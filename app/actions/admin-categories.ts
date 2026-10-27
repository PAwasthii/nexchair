"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma/client";

import { requireAdminSession } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import {
  deleteStorageAsset,
  StorageValidationError,
  uploadFile,
  type UploadResult,
} from "@/lib/storage";

// ─── Public types ─────────────────────────────────────────────────────────────

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageKey: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};

export type CategoryActionState = {
  success: boolean;
  error?: string;
  categoryId?: string;
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

function parseInteger(
  formData: FormData,
  field: string,
  defaultValue: number,
): number {
  const raw = formData.get(field);
  if (typeof raw !== "string") return defaultValue;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : defaultValue;
}

// Fire-and-forget orphan cleanup — never swallows the original error.
function cleanupOrphanAsset(
  asset: { url: string; publicId?: string | null },
  context: string,
): void {
  deleteStorageAsset(asset).catch((err) => {
    console.error(
      `Failed to clean up orphaned image asset (${context}).`,
      err instanceof StorageValidationError ? err.message : "(unexpected error)",
    );
  });
}

// ─── getCategories ────────────────────────────────────────────────────────────

export async function getCategories(): Promise<CategoryRow[]> {
  await requireAdminSession();

  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageKey: true,
      sortOrder: true,
      isActive: true,
      _count: { select: { products: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageKey: row.imageKey,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    productCount: row._count.products,
  }));
}

// ─── createCategory ───────────────────────────────────────────────────────────

export async function createCategory(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdminSession();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { success: false, error: "Category name is required." };
  }
  if (name.length > 100) {
    return {
      success: false,
      error: "Category name must be 100 characters or fewer.",
    };
  }

  const slug = toSlug(name);
  if (!slug) {
    return {
      success: false,
      error: "Could not generate a valid slug from this name.",
    };
  }

  const description =
    String(formData.get("description") ?? "").trim() || null;
  const sortOrder = parseInteger(formData, "sortOrder", 0);
  const isActive = parseBoolean(formData, "isActive", true);

  // Check slug uniqueness before any upload.
  const existing = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (existing) {
    return {
      success: false,
      error: `A category with the slug "${slug}" already exists.`,
    };
  }

  // Upload optional image.
  const imageFile = parseFile(formData, "image");
  let uploadResult: UploadResult | null = null;

  if (imageFile) {
    try {
      uploadResult = await uploadFile(imageFile, "category-image");
    } catch (err) {
      if (err instanceof StorageValidationError) {
        return { success: false, error: err.message };
      }
      return {
        success: false,
        error: "Image upload failed. Verify storage configuration.",
      };
    }
  }

  try {
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        imageKey: uploadResult?.url ?? null,
        imagePublicId: uploadResult?.publicId ?? null,
        sortOrder,
        isActive,
      },
      select: { id: true },
    });

    revalidatePath("/admin/categories");
    return { success: true, categoryId: category.id };
  } catch (err) {
    // Clean up the uploaded image without hiding the original DB error.
    if (uploadResult) {
      cleanupOrphanAsset(uploadResult, "createCategory DB failure");
    }

    if (isUniqueConstraintError(err)) {
      return {
        success: false,
        error: `A category with the slug "${slug}" already exists.`,
      };
    }

    console.error(
      "createCategory: DB error —",
      err instanceof Error ? err.message : "(unknown)",
    );
    return {
      success: false,
      error: "Could not create category. Please try again.",
    };
  }
}

// ─── updateCategory ───────────────────────────────────────────────────────────

export async function updateCategory(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { success: false, error: "Category ID is required." };
  }

  // Retrieve current imageKey and imagePublicId — both needed for cleanup.
  const current = await prisma.category.findUnique({
    where: { id },
    select: { id: true, imageKey: true, imagePublicId: true },
  });
  if (!current) {
    return { success: false, error: "Category not found." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { success: false, error: "Category name is required." };
  }
  if (name.length > 100) {
    return {
      success: false,
      error: "Category name must be 100 characters or fewer.",
    };
  }

  const slug = toSlug(name);
  if (!slug) {
    return {
      success: false,
      error: "Could not generate a valid slug from this name.",
    };
  }

  const description =
    String(formData.get("description") ?? "").trim() || null;
  const sortOrder = parseInteger(formData, "sortOrder", 0);
  const isActive = parseBoolean(formData, "isActive", true);

  // Check slug uniqueness excluding this category.
  const slugConflict = await prisma.category.findFirst({
    where: { slug, id: { not: id } },
    select: { id: true },
  });
  if (slugConflict) {
    return {
      success: false,
      error: `A category with the slug "${slug}" already exists.`,
    };
  }

  // Determine image intent:
  //   removeImage=true  → clear imageKey/imagePublicId regardless of any uploaded file
  //   new imageFile     → upload now; replace on successful DB update
  //   neither           → keep existing imageKey/imagePublicId
  const removeImage = parseBoolean(formData, "removeImage", false);
  const newImageFile = !removeImage ? parseFile(formData, "image") : null;

  let newUploadResult: UploadResult | null = null;

  if (newImageFile) {
    try {
      newUploadResult = await uploadFile(newImageFile, "category-image");
    } catch (err) {
      if (err instanceof StorageValidationError) {
        return { success: false, error: err.message };
      }
      return {
        success: false,
        error: "Image upload failed. Verify storage configuration.",
      };
    }
  }

  const nextImageKey = removeImage
    ? null
    : (newUploadResult?.url ?? current.imageKey);

  const nextImagePublicId = removeImage
    ? null
    : (newUploadResult ? (newUploadResult.publicId ?? null) : current.imagePublicId);

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        imageKey: nextImageKey,
        imagePublicId: nextImagePublicId,
        sortOrder,
        isActive,
      },
    });
  } catch (err) {
    // DB failed — clean up the newly uploaded image; never touch the old one.
    if (newUploadResult) {
      cleanupOrphanAsset(newUploadResult, "updateCategory DB failure");
    }

    if (isUniqueConstraintError(err)) {
      return {
        success: false,
        error: `A category with the slug "${slug}" already exists.`,
      };
    }

    console.error(
      "updateCategory: DB error —",
      err instanceof Error ? err.message : "(unknown)",
    );
    return {
      success: false,
      error: "Could not update category. Please try again.",
    };
  }

  // DB update succeeded — safe to delete the superseded image.
  const oldUrl = (removeImage || !!newUploadResult) ? current.imageKey : null;
  if (oldUrl) {
    cleanupOrphanAsset(
      { url: oldUrl, publicId: current.imagePublicId },
      "updateCategory post-update cleanup",
    );
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

// ─── deleteCategory ───────────────────────────────────────────────────────────

export async function deleteCategory(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { success: false, error: "Category ID is required." };
  }

  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      imageKey: true,
      imagePublicId: true,
      _count: { select: { products: true } },
    },
  });

  if (!category) {
    return { success: false, error: "Category not found." };
  }

  if (category._count.products > 0) {
    const n = category._count.products;
    return {
      success: false,
      error: `Cannot delete this category — ${n} ${
        n === 1 ? "product is" : "products are"
      } assigned to it. Reassign or remove those products first.`,
    };
  }

  try {
    await prisma.category.delete({ where: { id } });
  } catch (err) {
    console.error(
      "deleteCategory: DB error —",
      err instanceof Error ? err.message : "(unknown)",
    );
    return {
      success: false,
      error: "Could not delete category. Please try again.",
    };
  }

  // DB deletion succeeded — clean up the image asset.
  // Failure here does not compromise the DB record; we log the category ID
  // for manual cleanup but never log credentials or environment variables.
  if (category.imageKey) {
    deleteStorageAsset({
      url: category.imageKey,
      publicId: category.imagePublicId,
    }).catch(() => {
      console.error(
        `Image cleanup failed for deleted category ${id}. ` +
          "Manual cleanup may be required in the Cloudinary Media Library or Vercel Blob dashboard.",
      );
    });
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

// ─── toggleCategoryActive ─────────────────────────────────────────────────────

export async function toggleCategoryActive(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { success: false, error: "Category ID is required." };
  }

  const rawActive = formData.get("isActive");
  if (rawActive !== "true" && rawActive !== "false") {
    return { success: false, error: "Invalid active status value." };
  }
  const isActive = rawActive === "true";

  const exists = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!exists) {
    return { success: false, error: "Category not found." };
  }

  try {
    await prisma.category.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (err) {
    console.error(
      "toggleCategoryActive: DB error —",
      err instanceof Error ? err.message : "(unknown)",
    );
    return {
      success: false,
      error: "Could not update category status. Please try again.",
    };
  }
}
