"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  addProductImage,
  deleteProductImage,
  reorderProductImages,
  setProductImagePrimary,
  type ImageActionState,
  type ProductImageRow,
} from "@/app/actions/admin-products";

type Props = {
  productId: string;
  images: ProductImageRow[];
};

const UPLOAD_INITIAL: ImageActionState = { success: false };
const OP_INITIAL: ImageActionState = { success: false };

export default function ProductImageManager({ productId, images }: Props) {
  const router = useRouter();

  // ─── Upload ────────────────────────────────────────────────────────────────────
  const [uploadState, uploadAction, uploadPending] = useActionState(
    addProductImage,
    UPLOAD_INITIAL,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const altTextInputRef = useRef<HTMLInputElement>(null);

  // Reset form and refresh after a successful upload.
  // Depend on the full uploadState object so consecutive uploads each trigger the effect.
  // DOM mutation via ref is the correct use of an effect; no setState here.
  useEffect(() => {
    if (uploadState.success) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (altTextInputRef.current) altTextInputRef.current.value = "";
      router.refresh();
    }
  }, [uploadState, router]);

  // ─── Set primary ───────────────────────────────────────────────────────────────
  const [primaryPending, startPrimaryTransition] = useTransition();
  const [primaryError, setPrimaryError] = useState<string | null>(null);
  const [primaryPendingId, setPrimaryPendingId] = useState<string | null>(null);

  function handleSetPrimary(imageId: string) {
    setPrimaryError(null);
    setPrimaryPendingId(imageId);
    startPrimaryTransition(async () => {
      const fd = new FormData();
      fd.set("imageId", imageId);
      fd.set("productId", productId);
      const result = await setProductImagePrimary(OP_INITIAL, fd);
      setPrimaryPendingId(null);
      if (result.success) {
        router.refresh();
      } else {
        setPrimaryError(result.error ?? "Failed to update primary image.");
      }
    });
  }

  // ─── Delete ────────────────────────────────────────────────────────────────────
  const [deletePending, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleDelete(imageId: string) {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const fd = new FormData();
      fd.set("imageId", imageId);
      fd.set("productId", productId);
      const result = await deleteProductImage(OP_INITIAL, fd);
      if (result.success) {
        setConfirmDeleteId(null);
        router.refresh();
      } else {
        setDeleteError(result.error ?? "Failed to delete image.");
      }
    });
  }

  // ─── Reorder ───────────────────────────────────────────────────────────────────
  const [reorderPending, startReorderTransition] = useTransition();
  const [reorderError, setReorderError] = useState<string | null>(null);

  function handleMove(imageId: string, direction: "up" | "down") {
    const idx = images.findIndex((img) => img.id === imageId);
    if (idx < 0) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === images.length - 1) return;

    const newOrder = images.map((img) => img.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];

    setReorderError(null);
    startReorderTransition(async () => {
      const fd = new FormData();
      fd.set("productId", productId);
      newOrder.forEach((id) => fd.append("imageIds", id));
      const result = await reorderProductImages(OP_INITIAL, fd);
      if (result.success) {
        router.refresh();
      } else {
        setReorderError(result.error ?? "Reorder failed.");
      }
    });
  }

  const anyPending = uploadPending || primaryPending || deletePending || reorderPending;

  return (
    <div className="mt-6 border-t border-black/5 pt-6">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
        Images
      </p>

      {/* Per-operation error banners */}
      {primaryError && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {primaryError}
        </p>
      )}
      {deleteError && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {deleteError}
        </p>
      )}
      {reorderError && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {reorderError}
        </p>
      )}

      {/* Image list */}
      {images.length === 0 ? (
        <div className="mb-4 rounded-xl border border-dashed border-black/15 p-6 text-center">
          <p className="text-xs text-black/40">No images yet. Add one below.</p>
        </div>
      ) : (
        <ul className="mb-4 space-y-2">
          {images.map((image, idx) => {
            const isConfirmingDelete = confirmDeleteId === image.id;
            const isThisPrimaryPending = primaryPendingId === image.id;

            return (
              <li
                key={image.id}
                className="flex items-start gap-3 rounded-xl border border-black/10 bg-white p-3"
              >
                {/* Thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.storageKey}
                  alt={image.altText ?? `Product image ${idx + 1}`}
                  className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                />

                {/* Info + controls */}
                <div className="min-w-0 flex-1">
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-black/40">#{idx + 1}</span>
                    {image.isPrimary && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Primary
                      </span>
                    )}
                    {image.altText && (
                      <span
                        className="max-w-[160px] truncate text-xs text-black/50"
                        title={image.altText}
                      >
                        {image.altText}
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {/* Set primary */}
                    {!image.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(image.id)}
                        disabled={anyPending}
                        className="rounded-md border border-black/10 px-2 py-1 text-xs text-black/50 transition hover:border-green-300 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isThisPrimaryPending ? "Setting…" : "Set primary"}
                      </button>
                    )}

                    {/* Move up */}
                    <button
                      type="button"
                      onClick={() => handleMove(image.id, "up")}
                      disabled={idx === 0 || anyPending}
                      aria-label="Move up"
                      className="rounded-md border border-black/10 px-2 py-1 text-xs text-black/50 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ↑
                    </button>

                    {/* Move down */}
                    <button
                      type="button"
                      onClick={() => handleMove(image.id, "down")}
                      disabled={idx === images.length - 1 || anyPending}
                      aria-label="Move down"
                      className="rounded-md border border-black/10 px-2 py-1 text-xs text-black/50 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ↓
                    </button>

                    {/* Delete trigger / inline confirm */}
                    {!isConfirmingDelete ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError(null);
                          setConfirmDeleteId(image.id);
                        }}
                        disabled={anyPending}
                        className="rounded-md px-2 py-1 text-xs text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Delete
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-red-600">Delete?</span>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDeleteId(null);
                            setDeleteError(null);
                          }}
                          disabled={deletePending}
                          className="rounded-md px-2 py-1 text-xs text-black/40 transition hover:text-black disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(image.id)}
                          disabled={deletePending}
                          className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                          {deletePending ? "Deleting…" : "Confirm"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Upload form — separate <form> so it can use useActionState cleanly */}
      <form
        action={uploadAction}
        className="space-y-3 rounded-xl border border-dashed border-black/15 p-4"
      >
        <input type="hidden" name="productId" value={productId} />

        <p className="text-xs font-medium text-black/60">Add image</p>
        <p className="-mt-1 text-xs text-black/40">JPEG, PNG, or WebP · max 5 MB</p>

        {uploadState.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {uploadState.error}
          </p>
        )}

        <div>
          <label className="mb-1 block text-xs text-black/50">
            Alt text (optional)
          </label>
          <input
            ref={altTextInputRef}
            type="text"
            name="altText"
            defaultValue=""
            placeholder="e.g. Ergo Pro 500 in black"
            disabled={uploadPending}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30 disabled:opacity-50"
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          required
          disabled={uploadPending}
          className="block w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-black/60 file:mr-3 file:rounded-full file:border-0 file:bg-[#c44e18] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:opacity-90 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={uploadPending}
          className="rounded-full bg-[#c44e18] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {uploadPending ? "Uploading…" : "Upload image"}
        </button>
      </form>
    </div>
  );
}
