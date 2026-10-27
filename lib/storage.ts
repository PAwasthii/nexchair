import "server-only";

import type { UploadApiResponse } from "cloudinary";
import { put, del } from "@vercel/blob";

import { cloudinary } from "@/lib/cloudinary";

// ─── Asset categories ─────────────────────────────────────────────────────────

export type UploadCategory =
  | "product-image"
  | "category-image"
  | "spec-sheet"
  | "catalogue";

type CategoryConfig = {
  allowedMime: Set<string>;
  allowedExt: Set<string>;
  maxBytes: number;
  storage: "cloudinary" | "blob";
  /** Cloudinary folder — set when storage === "cloudinary". */
  cloudinaryFolder?: string;
  /** Vercel Blob path prefix — set when storage === "blob". */
  pathPrefix?: string;
};

const UPLOAD_CONFIG: Record<UploadCategory, CategoryConfig> = {
  "product-image": {
    allowedMime: new Set(["image/jpeg", "image/png", "image/webp"]),
    allowedExt: new Set([".jpg", ".jpeg", ".png", ".webp"]),
    maxBytes: 5 * 1024 * 1024, // 5 MB
    storage: "cloudinary",
    cloudinaryFolder: "nexchair/products",
  },
  "category-image": {
    allowedMime: new Set(["image/jpeg", "image/png", "image/webp"]),
    allowedExt: new Set([".jpg", ".jpeg", ".png", ".webp"]),
    maxBytes: 2 * 1024 * 1024, // 2 MB
    storage: "cloudinary",
    cloudinaryFolder: "nexchair/categories",
  },
  "spec-sheet": {
    allowedMime: new Set(["application/pdf"]),
    allowedExt: new Set([".pdf"]),
    maxBytes: 10 * 1024 * 1024, // 10 MB
    storage: "blob",
    pathPrefix: "products/spec-sheets",
  },
  catalogue: {
    allowedMime: new Set(["application/pdf"]),
    allowedExt: new Set([".pdf"]),
    maxBytes: 25 * 1024 * 1024, // 25 MB
    storage: "blob",
    pathPrefix: "catalogues",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx >= 0 ? filename.slice(idx).toLowerCase() : "";
}

// IDs are server-generated only — user-supplied filenames never appear in paths.
function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildBlobPath(pathPrefix: string, originalName: string): string {
  const ext = getExtension(originalName);
  return `${pathPrefix}/${generateUniqueId()}${ext}`;
}

// Vercel Blob public URLs: https://<storeId>.public.blob.vercel-storage.com/<path>
const VERCEL_BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

function isVercelBlobUrl(value: string): boolean {
  try {
    const { protocol, hostname } = new URL(value);
    return protocol === "https:" && hostname.endsWith(VERCEL_BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

// ─── Public error type ────────────────────────────────────────────────────────

export class StorageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageValidationError";
  }
}

// ─── Public result type ───────────────────────────────────────────────────────

export type UploadResult = {
  /** Public CDN URL — persist this in the corresponding *Key column. */
  url: string;
  /**
   * Cloudinary public_id (includes the folder prefix, e.g. "nexchair/categories/1234-abc").
   * Present for product-image and category-image uploads; absent for Blob uploads.
   * Persist this in the imagePublicId / publicId column so images can be deleted later.
   */
  publicId?: string;
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validateUpload(
  file: File,
  config: CategoryConfig,
  category: UploadCategory,
): void {
  if (!config.allowedMime.has(file.type)) {
    throw new StorageValidationError(
      `File type "${file.type}" is not permitted for ${category}. ` +
        `Accepted: ${[...config.allowedMime].join(", ")}.`,
    );
  }

  const ext = getExtension(file.name);
  if (!config.allowedExt.has(ext)) {
    throw new StorageValidationError(
      `Extension "${ext || "(none)"}" is not permitted for ${category}. ` +
        `Accepted: ${[...config.allowedExt].join(", ")}.`,
    );
  }

  if (file.size > config.maxBytes) {
    const limitMB = (config.maxBytes / (1024 * 1024)).toFixed(0);
    const fileMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new StorageValidationError(
      `File is ${fileMB} MB but the limit for ${category} is ${limitMB} MB.`,
    );
  }
}

// ─── Cloudinary upload ────────────────────────────────────────────────────────

async function uploadToCloudinary(
  file: File,
  folder: string,
): Promise<UploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: generateUniqueId(),
        resource_type: "image",
        overwrite: false,
      },
      (error, uploadResult) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else if (!uploadResult) {
          reject(new Error("Cloudinary upload returned no result."));
        } else {
          resolve(uploadResult);
        }
      },
    );
    stream.end(buffer);
  });

  return { url: result.secure_url, publicId: result.public_id };
}

// ─── Vercel Blob upload ───────────────────────────────────────────────────────

async function uploadToBlob(
  file: File,
  pathPrefix: string,
): Promise<UploadResult> {
  const pathname = buildBlobPath(pathPrefix, file.name);
  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type,
    addRandomSuffix: false,
  });
  return { url: blob.url };
}

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Upload a file to the appropriate storage provider:
 *   product-image / category-image → Cloudinary
 *   spec-sheet / catalogue         → Vercel Blob
 *
 * Returns { url, publicId? }. For Cloudinary uploads publicId is always set;
 * persist it in the imagePublicId / publicId DB column so deletion works later.
 *
 * Authorization is the caller's responsibility. Every Server Action that calls
 * this must first verify the admin session via requireAdminSession().
 *
 * Throws StorageValidationError for invalid type, extension, or size.
 */
export async function uploadFile(
  file: File,
  category: UploadCategory,
): Promise<UploadResult> {
  const config = UPLOAD_CONFIG[category];

  validateUpload(file, config, category);

  if (config.storage === "cloudinary") {
    return uploadToCloudinary(file, config.cloudinaryFolder!);
  }
  return uploadToBlob(file, config.pathPrefix!);
}

// ─── Cloudinary deletion ──────────────────────────────────────────────────────

async function destroyCloudinaryAsset(publicId: string): Promise<void> {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  // "not found" means the asset is already gone — treat as success (idempotent).
  if (result.result !== "ok" && result.result !== "not found") {
    console.error(
      `Cloudinary destroy returned unexpected result "${result.result}" for public_id "${publicId}".`,
    );
    throw new StorageValidationError(
      `Cloudinary deletion returned unexpected result: ${result.result}`,
    );
  }
}

// ─── Vercel Blob deletion ─────────────────────────────────────────────────────

/**
 * Delete a file from Vercel Blob.
 *
 * Use this for spec-sheets and catalogues (PDFs).
 * For images, use deleteStorageAsset which routes to Cloudinary or Blob based
 * on whether a publicId is available.
 *
 * Throws StorageValidationError if the URL is not a valid Vercel Blob URL.
 *
 * Authorization is the caller's responsibility.
 */
export async function deleteFile(storageKey: string): Promise<void> {
  if (!isVercelBlobUrl(storageKey)) {
    throw new StorageValidationError(
      `Cannot delete: "${storageKey}" is not a valid Vercel Blob URL.`,
    );
  }
  await del(storageKey);
}

// ─── Unified image deletion ───────────────────────────────────────────────────

/**
 * Delete a stored image from either Cloudinary or Vercel Blob.
 *
 * Routing:
 *   publicId present  → Cloudinary destroy (invalidates CDN cache)
 *   publicId absent   → Vercel Blob delete (validated URL required)
 *
 * Missing or already-deleted Cloudinary assets are treated as success.
 *
 * Authorization is the caller's responsibility.
 */
export async function deleteStorageAsset(params: {
  url: string;
  publicId?: string | null;
}): Promise<void> {
  if (params.publicId) {
    await destroyCloudinaryAsset(params.publicId);
  } else {
    await deleteFile(params.url);
  }
}
