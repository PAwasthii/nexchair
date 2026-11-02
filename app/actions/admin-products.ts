"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma/client";

import { requireAdminSession } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import {
  deleteFile,
  deleteStorageAsset,
  StorageValidationError,
  uploadFile,
  type UploadResult,
} from "@/lib/storage";

// ─── Public types ─────────────────────────────────────────────────────────────

export type ProductImageRow = {
  id: string;
  storageKey: string;
  publicId: string | null;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  code: string;
  categoryId: string;
  categoryName: string;
  price: string;
  description: string | null;
  colour: string | null;
  seatWeight: string | null;
  maxUserWeight: string | null;
  armrests: string | null;
  warranty: string | null;
  specs: { lumbar?: string; back?: string };
  features: string[];
  isActive: boolean;
  isBestseller: boolean;
  specSheetKey: string | null;
  imageCount: number;
  images: ProductImageRow[];
};

export type ProductActionState = {
  success: boolean;
  error?: string;
  productId?: string;
};

export type ImageActionState = {
  success: boolean;
  error?: string;
};

// ─── Private helpers ──────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isUniqueConstraintError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  );
}

function isForeignKeyError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2003"
  );
}

function parseFile(formData: FormData, field: string): File | null {
  const value = formData.get(field);
  return value instanceof File && value.size > 0 ? value : null;
}

function parseBoolean(
  formData: FormData,
  field: string,
  defaultValue: boolean,
): boolean {
  const value = formData.get(field);
  if (value === "true") return true;
  if (value === "false") return false;
  return defaultValue;
}

/** Returns a string[] from repeated form fields named `features`. */
function parseFeatures(formData: FormData): string[] {
  return formData
    .getAll("features")
    .map((v) => String(v).trim())
    .filter(Boolean);
}

/**
 * Returns a specs object from `specsLumbar` and `specsBack` form fields.
 * Only includes keys that were actually filled in.
 * Returns an empty object when no values are provided (never null, to avoid
 * Prisma's nullable-JSON coercion complexity).
 */
function parseSpecs(formData: FormData): Record<string, string> {
  const lumbar = String(formData.get("specsLumbar") ?? "").trim();
  const back = String(formData.get("specsBack") ?? "").trim();
  const specs: Record<string, string> = {};
  if (lumbar) specs.lumbar = lumbar;
  if (back) specs.back = back;
  return specs;
}

function extractSpecs(raw: unknown): { lumbar?: string; back?: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const obj = raw as Record<string, unknown>;
  const result: { lumbar?: string; back?: string } = {};
  if (typeof obj.lumbar === "string" && obj.lumbar) result.lumbar = obj.lumbar;
  if (typeof obj.back === "string" && obj.back) result.back = obj.back;
  return result;
}

function extractFeatures(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((v): v is string => typeof v === "string");
}

// Fire-and-forget image asset cleanup — never propagates errors to the caller.
function cleanupOrphanAsset(
  asset: { url: string; publicId?: string | null },
  context: string,
): void {
  deleteStorageAsset(asset).catch((err) => {
    console.error(
      `Failed to clean up orphaned asset (${context}).`,
      err instanceof StorageValidationError ? err.message : "(unexpected error)",
    );
  });
}

// Fire-and-forget spec-sheet cleanup — never propagates errors to the caller.
function cleanupSpecSheet(url: string, context: string): void {
  deleteFile(url).catch((err) => {
    console.error(
      `Failed to clean up spec sheet (${context}).`,
      err instanceof StorageValidationError ? err.message : "(unexpected error)",
    );
  });
}

/** Revalidate all paths that depend on product data. */
function revalidateAll(slug: string): void {
  revalidatePath("/admin/products");
  revalidatePath("/product-range");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/specifications");
  revalidatePath("/");
}

// ─── getProducts ──────────────────────────────────────────────────────────────

export async function getProducts(categoryId?: string): Promise<ProductRow[]> {
  await requireAdminSession();

  const rows = await prisma.product.findMany({
    where: categoryId ? { categoryId } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      code: true,
      categoryId: true,
      category: { select: { name: true } },
      price: true,
      description: true,
      colour: true,
      seatWeight: true,
      maxUserWeight: true,
      armrests: true,
      warranty: true,
      specs: true,
      features: true,
      isActive: true,
      isBestseller: true,
      specSheetKey: true,
      _count: { select: { images: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          storageKey: true,
          publicId: true,
          altText: true,
          sortOrder: true,
          isPrimary: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    code: row.code,
    categoryId: row.categoryId,
    categoryName: row.category.name,
    price: row.price,
    description: row.description,
    colour: row.colour,
    seatWeight: row.seatWeight,
    maxUserWeight: row.maxUserWeight,
    armrests: row.armrests,
    warranty: row.warranty,
    specs: extractSpecs(row.specs),
    features: extractFeatures(row.features),
    isActive: row.isActive,
    isBestseller: row.isBestseller,
    specSheetKey: row.specSheetKey,
    imageCount: row._count.images,
    images: row.images,
  }));
}

// ─── createProduct ────────────────────────────────────────────────────────────

export async function createProduct(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdminSession();

  // Required fields
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { success: false, error: "Product name is required." };
  if (name.length > 200) {
    return { success: false, error: "Product name must be 200 characters or fewer." };
  }

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return { success: false, error: "Product code is required." };
  if (code.length > 50) {
    return { success: false, error: "Product code must be 50 characters or fewer." };
  }

  const categoryId = String(formData.get("categoryId") ?? "").trim();
  if (!categoryId) return { success: false, error: "Category is required." };

  const slug = toSlug(name);
  if (!slug) {
    return { success: false, error: "Could not generate a valid slug from this name." };
  }

  // Check uniqueness and category existence before any upload
  const [slugConflict, codeConflict, category] = await Promise.all([
    prisma.product.findUnique({ where: { slug }, select: { id: true } }),
    prisma.product.findUnique({ where: { code }, select: { id: true } }),
    prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }),
  ]);

  if (slugConflict) {
    return { success: false, error: `A product with the slug "${slug}" already exists.` };
  }
  if (codeConflict) {
    return { success: false, error: `Product code "${code}" is already in use.` };
  }
  if (!category) {
    return { success: false, error: "The selected category does not exist." };
  }

  // Optional scalar fields
  const price = String(formData.get("price") ?? "").trim() || "Price on request";
  const description = String(formData.get("description") ?? "").trim() || null;
  const colour = String(formData.get("colour") ?? "").trim() || null;
  const seatWeight = String(formData.get("seatWeight") ?? "").trim() || null;
  const maxUserWeight = String(formData.get("maxUserWeight") ?? "").trim() || null;
  const armrests = String(formData.get("armrests") ?? "").trim() || null;
  const warranty = String(formData.get("warranty") ?? "").trim() || null;
  const isActive = parseBoolean(formData, "isActive", true);
  const isBestseller = parseBoolean(formData, "isBestseller", false);
  const specs = parseSpecs(formData);
  const features = parseFeatures(formData);

  // Upload optional primary image
  const imageFile = parseFile(formData, "image");
  let imageUpload: UploadResult | null = null;

  if (imageFile) {
    try {
      imageUpload = await uploadFile(imageFile, "product-image");
    } catch (err) {
      if (err instanceof StorageValidationError) {
        return { success: false, error: err.message };
      }
      return { success: false, error: "Image upload failed. Verify storage configuration." };
    }
  }

  // Create product and optional initial image atomically
  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name,
          slug,
          code,
          categoryId,
          price,
          description,
          colour,
          seatWeight,
          maxUserWeight,
          armrests,
          warranty,
          isActive,
          isBestseller,
          specs: Object.keys(specs).length > 0 ? specs : undefined,
          features: features.length > 0 ? features : undefined,
        },
        select: { id: true, slug: true },
      });

      if (imageUpload) {
        await tx.productImage.create({
          data: {
            productId: created.id,
            storageKey: imageUpload.url,
            publicId: imageUpload.publicId ?? null,
            sortOrder: 0,
            isPrimary: true,
          },
        });
      }

      return created;
    });

    revalidateAll(product.slug);
    return { success: true, productId: product.id };
  } catch (err) {
    if (imageUpload) {
      cleanupOrphanAsset(imageUpload, "createProduct DB failure");
    }

    if (isUniqueConstraintError(err)) {
      return { success: false, error: "A product with that name or code already exists." };
    }

    console.error(
      "createProduct: DB error —",
      err instanceof Error ? err.message : "(unknown)",
    );
    return { success: false, error: "Could not create product. Please try again." };
  }
}

// ─── updateProduct ────────────────────────────────────────────────────────────

export async function updateProduct(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { success: false, error: "Product ID is required." };

  const current = await prisma.product.findUnique({
    where: { id },
    select: { id: true, slug: true, code: true, specSheetKey: true },
  });
  if (!current) return { success: false, error: "Product not found." };

  // Required fields
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { success: false, error: "Product name is required." };
  if (name.length > 200) {
    return { success: false, error: "Product name must be 200 characters or fewer." };
  }

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return { success: false, error: "Product code is required." };
  if (code.length > 50) {
    return { success: false, error: "Product code must be 50 characters or fewer." };
  }

  const categoryId = String(formData.get("categoryId") ?? "").trim();
  if (!categoryId) return { success: false, error: "Category is required." };

  const slug = toSlug(name);
  if (!slug) {
    return { success: false, error: "Could not generate a valid slug from this name." };
  }

  // Check uniqueness excluding this product, and verify category
  const [slugConflict, codeConflict, category] = await Promise.all([
    prisma.product.findFirst({ where: { slug, id: { not: id } }, select: { id: true } }),
    prisma.product.findFirst({ where: { code, id: { not: id } }, select: { id: true } }),
    prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }),
  ]);

  if (slugConflict) {
    return { success: false, error: `A product with the slug "${slug}" already exists.` };
  }
  if (codeConflict) {
    return { success: false, error: `Product code "${code}" is already in use.` };
  }
  if (!category) {
    return { success: false, error: "The selected category does not exist." };
  }

  // Optional scalar fields
  const price = String(formData.get("price") ?? "").trim() || "Price on request";
  const description = String(formData.get("description") ?? "").trim() || null;
  const colour = String(formData.get("colour") ?? "").trim() || null;
  const seatWeight = String(formData.get("seatWeight") ?? "").trim() || null;
  const maxUserWeight = String(formData.get("maxUserWeight") ?? "").trim() || null;
  const armrests = String(formData.get("armrests") ?? "").trim() || null;
  const warranty = String(formData.get("warranty") ?? "").trim() || null;
  const isActive = parseBoolean(formData, "isActive", true);
  const isBestseller = parseBoolean(formData, "isBestseller", false);
  const specs = parseSpecs(formData);
  const features = parseFeatures(formData);

  // Spec-sheet intent: keep / replace / remove
  const removeSpecSheet = parseBoolean(formData, "removeSpecSheet", false);
  const newSpecSheetFile = !removeSpecSheet ? parseFile(formData, "specSheet") : null;
  let newSpecSheetUpload: UploadResult | null = null;

  if (newSpecSheetFile) {
    try {
      newSpecSheetUpload = await uploadFile(newSpecSheetFile, "spec-sheet");
    } catch (err) {
      if (err instanceof StorageValidationError) {
        return { success: false, error: err.message };
      }
      return { success: false, error: "Spec sheet upload failed. Verify storage configuration." };
    }
  }

  const nextSpecSheetKey = removeSpecSheet
    ? null
    : (newSpecSheetUpload?.url ?? current.specSheetKey);

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        code,
        categoryId,
        price,
        description,
        colour,
        seatWeight,
        maxUserWeight,
        armrests,
        warranty,
        isActive,
        isBestseller,
        specs: Object.keys(specs).length > 0 ? specs : {},
        features,
        specSheetKey: nextSpecSheetKey,
      },
    });
  } catch (err) {
    // DB failed — clean up any newly uploaded spec sheet; preserve the old one.
    if (newSpecSheetUpload) {
      cleanupSpecSheet(newSpecSheetUpload.url, "updateProduct DB failure");
    }

    if (isUniqueConstraintError(err)) {
      return { success: false, error: "A product with that name or code already exists." };
    }

    console.error(
      "updateProduct: DB error —",
      err instanceof Error ? err.message : "(unknown)",
    );
    return { success: false, error: "Could not update product. Please try again." };
  }

  // DB succeeded — delete the superseded spec sheet fire-and-forget.
  const oldSpecSheetKey =
    (removeSpecSheet || !!newSpecSheetUpload) ? current.specSheetKey : null;
  if (oldSpecSheetKey) {
    cleanupSpecSheet(oldSpecSheetKey, "updateProduct post-update cleanup");
  }

  revalidateAll(slug);
  // Revalidate the old URL as well if the slug changed.
  if (current.slug !== slug) {
    revalidatePath(`/products/${current.slug}`);
  }

  return { success: true };
}

// ─── deleteProduct ────────────────────────────────────────────────────────────

export async function deleteProduct(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { success: false, error: "Product ID is required." };

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      specSheetKey: true,
      _count: { select: { enquiryItems: true } },
      images: { select: { storageKey: true, publicId: true } },
    },
  });

  if (!product) return { success: false, error: "Product not found." };

  if (product._count.enquiryItems > 0) {
    const n = product._count.enquiryItems;
    return {
      success: false,
      error:
        `Cannot delete this product — it appears on ${n} ${
          n === 1 ? "enquiry" : "enquiries"
        }. Remove those enquiry items first.`,
    };
  }

  // Capture assets before deletion; ProductImage records cascade with the product.
  const imagesToClean = product.images.map((img) => ({
    url: img.storageKey,
    publicId: img.publicId,
  }));
  const specSheetToClean = product.specSheetKey;
  const slug = product.slug;

  try {
    await prisma.product.delete({ where: { id } });
  } catch (err) {
    if (isForeignKeyError(err)) {
      return {
        success: false,
        error: "Cannot delete this product — it is referenced by existing records.",
      };
    }
    console.error(
      "deleteProduct: DB error —",
      err instanceof Error ? err.message : "(unknown)",
    );
    return { success: false, error: "Could not delete product. Please try again." };
  }

  // DB deletion succeeded — clean up storage assets fire-and-forget.
  for (const asset of imagesToClean) {
    deleteStorageAsset(asset).catch(() => {
      console.error(
        `Image asset cleanup failed for deleted product ${id}. Manual cleanup may be required in the Cloudinary Media Library.`,
      );
    });
  }
  if (specSheetToClean) {
    deleteFile(specSheetToClean).catch(() => {
      console.error(
        `Spec sheet cleanup failed for deleted product ${id}. Manual cleanup may be required in the Vercel Blob dashboard.`,
      );
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/product-range");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/");

  return { success: true };
}

// ─── toggleProductActive ──────────────────────────────────────────────────────

export async function toggleProductActive(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { success: false, error: "Product ID is required." };

  const rawActive = formData.get("isActive");
  if (rawActive !== "true" && rawActive !== "false") {
    return { success: false, error: "Invalid active status value." };
  }
  const isActive = rawActive === "true";

  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });
  if (!product) return { success: false, error: "Product not found." };

  try {
    await prisma.product.update({ where: { id }, data: { isActive } });

    revalidateAll(product.slug);
    return { success: true };
  } catch (err) {
    console.error(
      "toggleProductActive: DB error —",
      err instanceof Error ? err.message : "(unknown)",
    );
    return { success: false, error: "Could not update product status. Please try again." };
  }
}

// ─── addProductImage ──────────────────────────────────────────────────────────

export async function addProductImage(
  _prev: ImageActionState,
  formData: FormData,
): Promise<ImageActionState> {
  await requireAdminSession();

  const productId = String(formData.get("productId") ?? "").trim();
  if (!productId) return { success: false, error: "Product ID is required." };

  const imageFile = parseFile(formData, "image");
  if (!imageFile) return { success: false, error: "No image file provided." };

  const altText = String(formData.get("altText") ?? "").trim() || null;

  // Verify product exists and get slug for revalidation
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true },
  });
  if (!product) return { success: false, error: "Product not found." };

  // Upload to Cloudinary
  let upload: UploadResult;
  try {
    upload = await uploadFile(imageFile, "product-image");
  } catch (err) {
    if (err instanceof StorageValidationError) return { success: false, error: err.message };
    return { success: false, error: "Image upload failed. Verify storage configuration." };
  }

  // Determine sort position and whether this becomes the primary image
  const agg = await prisma.productImage.aggregate({
    where: { productId },
    _count: { id: true },
    _max: { sortOrder: true },
  });
  const existingCount = agg._count.id;
  const nextSortOrder = existingCount === 0 ? 0 : (agg._max.sortOrder ?? 0) + 1;
  const isPrimary = existingCount === 0;

  try {
    await prisma.productImage.create({
      data: {
        productId,
        storageKey: upload.url,
        publicId: upload.publicId ?? null,
        altText,
        sortOrder: nextSortOrder,
        isPrimary,
      },
    });

    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/product-range");
    revalidatePath("/admin/products");
    if (isPrimary) revalidatePath("/");
    return { success: true };
  } catch (err) {
    cleanupOrphanAsset(upload, "addProductImage DB failure");
    console.error(
      "addProductImage: DB error —",
      err instanceof Error ? err.message : "(unknown)",
    );
    return { success: false, error: "Could not save image. Please try again." };
  }
}

// ─── deleteProductImage ───────────────────────────────────────────────────────

export async function deleteProductImage(
  _prev: ImageActionState,
  formData: FormData,
): Promise<ImageActionState> {
  await requireAdminSession();

  const imageId = String(formData.get("imageId") ?? "").trim();
  const productId = String(formData.get("productId") ?? "").trim();
  if (!imageId) return { success: false, error: "Image ID is required." };
  if (!productId) return { success: false, error: "Product ID is required." };

  // Fetch image and verify it belongs to the specified product (IDOR guard).
  // Include the product relation for the slug needed in revalidation.
  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    select: {
      id: true,
      productId: true,
      storageKey: true,
      publicId: true,
      isPrimary: true,
      product: { select: { slug: true } },
    },
  });

  if (!image) return { success: false, error: "Image not found." };
  if (image.productId !== productId) {
    return { success: false, error: "Image does not belong to this product." };
  }

  const assetToClean = { url: image.storageKey, publicId: image.publicId };
  const wasPrimary = image.isPrimary;
  const productSlug = image.product.slug;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.productImage.delete({ where: { id: imageId } });

      if (wasPrimary) {
        // findFirst inside the transaction sees the post-delete state, so it
        // correctly skips the just-deleted row when selecting the next candidate.
        const next = await tx.productImage.findFirst({
          where: { productId },
          orderBy: { sortOrder: "asc" },
          select: { id: true },
        });
        if (next) {
          await tx.productImage.update({
            where: { id: next.id },
            data: { isPrimary: true },
          });
        }
      }
    });
  } catch (err) {
    console.error(
      "deleteProductImage: DB error —",
      err instanceof Error ? err.message : "(unknown)",
    );
    return { success: false, error: "Could not delete image. Please try again." };
  }

  // Fire-and-forget Cloudinary cleanup — runs only after the transaction succeeds.
  deleteStorageAsset(assetToClean).catch(() => {
    console.error(
      `Image asset cleanup failed for image ${imageId}. Manual cleanup may be required in the Cloudinary Media Library.`,
    );
  });

  revalidatePath(`/products/${productSlug}`);
  revalidatePath("/product-range");
  revalidatePath("/admin/products");
  if (wasPrimary) revalidatePath("/");

  return { success: true };
}

// ─── setProductImagePrimary ───────────────────────────────────────────────────

export async function setProductImagePrimary(
  _prev: ImageActionState,
  formData: FormData,
): Promise<ImageActionState> {
  await requireAdminSession();

  const imageId = String(formData.get("imageId") ?? "").trim();
  const productId = String(formData.get("productId") ?? "").trim();
  if (!imageId) return { success: false, error: "Image ID is required." };
  if (!productId) return { success: false, error: "Product ID is required." };

  // Verify the image exists and belongs to the specified product (IDOR guard).
  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    select: {
      id: true,
      productId: true,
      product: { select: { slug: true } },
    },
  });

  if (!image) return { success: false, error: "Image not found." };
  if (image.productId !== productId) {
    return { success: false, error: "Image does not belong to this product." };
  }

  try {
    await prisma.$transaction([
      prisma.productImage.updateMany({
        where: { productId, id: { not: imageId } },
        data: { isPrimary: false },
      }),
      prisma.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);

    revalidatePath(`/products/${image.product.slug}`);
    revalidatePath("/product-range");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error(
      "setProductImagePrimary: DB error —",
      err instanceof Error ? err.message : "(unknown)",
    );
    return { success: false, error: "Could not update primary image. Please try again." };
  }
}

// ─── reorderProductImages ─────────────────────────────────────────────────────

export async function reorderProductImages(
  _prev: ImageActionState,
  formData: FormData,
): Promise<ImageActionState> {
  await requireAdminSession();

  const productId = String(formData.get("productId") ?? "").trim();
  if (!productId) return { success: false, error: "Product ID is required." };

  const submittedIds = formData
    .getAll("imageIds")
    .map((v) => String(v).trim())
    .filter(Boolean);

  if (submittedIds.length === 0) {
    return { success: false, error: "No image IDs provided." };
  }

  // Reject duplicates
  if (new Set(submittedIds).size !== submittedIds.length) {
    return { success: false, error: "Duplicate image IDs in the submitted order." };
  }

  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true },
  });
  if (!product) return { success: false, error: "Product not found." };

  // Fetch all images for this product
  const existing = await prisma.productImage.findMany({
    where: { productId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((img) => img.id));

  // All submitted IDs must belong to this product, and the list must be complete.
  for (const sid of submittedIds) {
    if (!existingIds.has(sid)) {
      return { success: false, error: "One or more image IDs do not belong to this product." };
    }
  }
  if (submittedIds.length !== existing.length) {
    return {
      success: false,
      error: "The submitted order must include every image for this product.",
    };
  }

  try {
    await prisma.$transaction(
      submittedIds.map((imgId, index) =>
        prisma.productImage.update({
          where: { id: imgId },
          data: { sortOrder: index },
        }),
      ),
    );

    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/product-range");
    return { success: true };
  } catch (err) {
    console.error(
      "reorderProductImages: DB error —",
      err instanceof Error ? err.message : "(unknown)",
    );
    return { success: false, error: "Could not reorder images. Please try again." };
  }
}
