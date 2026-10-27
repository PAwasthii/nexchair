"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { deleteFile, StorageValidationError, uploadFile } from "@/lib/storage";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CatalogueRow = {
  id: string;
  name: string;
  storageKey: string;
  version: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CatalogueActionState = {
  success: boolean;
  error?: string;
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getCatalogues(): Promise<CatalogueRow[]> {
  await requireAdminSession();

  const rows = await prisma.catalogue.findMany({
    orderBy: { createdAt: "desc" },
  });

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    storageKey: c.storageKey,
    version: c.version,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createCatalogue(
  _prev: CatalogueActionState,
  formData: FormData,
): Promise<CatalogueActionState> {
  await requireAdminSession();

  const name = String(formData.get("name") ?? "").trim();
  const version = String(formData.get("version") ?? "").trim() || null;
  const file = formData.get("file");

  if (!name) return { success: false, error: "Name is required." };
  if (name.length > 200) return { success: false, error: "Name must be 200 characters or fewer." };
  if (version && version.length > 50) return { success: false, error: "Version must be 50 characters or fewer." };
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "A PDF file is required." };
  }

  let storageKey: string;
  try {
    const result = await uploadFile(file, "catalogue");
    storageKey = result.url;
  } catch (err) {
    if (err instanceof StorageValidationError) {
      return { success: false, error: err.message };
    }
    console.error("Catalogue upload failed:", err);
    return { success: false, error: "File upload failed. Please try again." };
  }

  try {
    await prisma.catalogue.create({
      data: { name, storageKey, version },
    });
  } catch (err) {
    // DB failed — clean up the uploaded file orphan.
    deleteFile(storageKey).catch((e) =>
      console.error("Orphan catalogue file cleanup failed:", storageKey, e),
    );
    console.error("Catalogue create failed:", err);
    return { success: false, error: "Failed to save catalogue. Please try again." };
  }

  revalidatePath("/admin/catalogues");
  return { success: true };
}

// ─── Update metadata ──────────────────────────────────────────────────────────

export async function updateCatalogue(
  _prev: CatalogueActionState,
  formData: FormData,
): Promise<CatalogueActionState> {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const version = String(formData.get("version") ?? "").trim() || null;

  if (!id) return { success: false, error: "Catalogue ID is required." };
  if (!name) return { success: false, error: "Name is required." };
  if (name.length > 200) return { success: false, error: "Name must be 200 characters or fewer." };
  if (version && version.length > 50) return { success: false, error: "Version must be 50 characters or fewer." };

  const exists = await prisma.catalogue.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return { success: false, error: "Catalogue not found." };

  await prisma.catalogue.update({ where: { id }, data: { name, version } });

  revalidatePath("/admin/catalogues");
  return { success: true };
}

// ─── Toggle active ────────────────────────────────────────────────────────────

export async function toggleCatalogueActive(
  _prev: CatalogueActionState,
  formData: FormData,
): Promise<CatalogueActionState> {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { success: false, error: "Catalogue ID is required." };

  const catalogue = await prisma.catalogue.findUnique({
    where: { id },
    select: { id: true, isActive: true },
  });
  if (!catalogue) return { success: false, error: "Catalogue not found." };

  await prisma.catalogue.update({
    where: { id },
    data: { isActive: !catalogue.isActive },
  });

  revalidatePath("/admin/catalogues");
  return { success: true };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteCatalogue(
  _prev: CatalogueActionState,
  formData: FormData,
): Promise<CatalogueActionState> {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { success: false, error: "Catalogue ID is required." };

  const catalogue = await prisma.catalogue.findUnique({
    where: { id },
    select: { id: true, storageKey: true },
  });
  if (!catalogue) return { success: false, error: "Catalogue not found." };

  // Delete DB record first, then attempt to clean up the stored file.
  await prisma.catalogue.delete({ where: { id } });

  deleteFile(catalogue.storageKey).catch((e) =>
    console.error("Failed to delete catalogue file from Blob:", catalogue.storageKey, e),
  );

  revalidatePath("/admin/catalogues");
  return { success: true };
}
