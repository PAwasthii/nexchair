"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

import {
  createCategory,
  updateCategory,
  type CategoryActionState,
  type CategoryRow,
} from "@/app/actions/admin-categories";

const EMPTY: CategoryActionState = { success: false };

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Props = {
  category: CategoryRow | null;
  onClose: () => void;
};

export default function CategoryForm({ category, onClose }: Props) {
  const router = useRouter();
  const isEdit = category !== null;

  const [createState, createAction, createPending] = useActionState(
    createCategory,
    EMPTY,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateCategory,
    EMPTY,
  );

  const state = isEdit ? updateState : createState;
  const action = isEdit ? updateAction : createAction;
  const pending = isEdit ? updatePending : createPending;

  const [nameValue, setNameValue] = useState(category?.name ?? "");
  const [slugPreview, setSlugPreview] = useState(category?.slug ?? "");
  // 'keep' | 'replace' | 'remove'
  const [imageIntent, setImageIntent] = useState<"keep" | "replace" | "remove">("keep");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Revoke object URL on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setNameValue(v);
    if (!isEdit) setSlugPreview(toSlug(v));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    // Revoke previous preview
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    if (file) {
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }

  function handleSetIntent(intent: "keep" | "replace" | "remove") {
    if (intent === "keep") {
      // Clear the file input and revoke any preview
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setPreviewUrl(null);
    }
    setImageIntent(intent);
  }

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onClose();
    }
  }, [state.success, router, onClose]);

  // Show the file input when:
  // - not removing
  // - creating (no existing image)
  // - editing with no existing image
  // - editing and explicitly replacing
  const showFileInput =
    imageIntent !== "remove" &&
    (!isEdit || !category?.imageKey || imageIntent === "replace");

  return (
    <form action={action} className="flex flex-col gap-5">
      {isEdit && <input type="hidden" name="id" value={category.id} />}
      <input
        type="hidden"
        name="removeImage"
        value={imageIntent === "remove" ? "true" : "false"}
      />

      {/* Name */}
      <div>
        <label
          htmlFor="cf-name"
          className="block text-sm font-medium text-black"
        >
          Name <span className="text-[#c44e18]">*</span>
        </label>
        <input
          id="cf-name"
          name="name"
          type="text"
          required
          maxLength={100}
          value={nameValue}
          onChange={handleNameChange}
          placeholder="e.g. Ergonomic Task"
          disabled={pending}
          className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#c44e18] focus:ring-2 focus:ring-[#c44e18]/20 disabled:opacity-50"
        />
      </div>

      {/* Slug preview */}
      <div>
        <p className="text-sm font-medium text-black">URL slug</p>
        <p className="mt-1.5 rounded-xl border border-black/10 bg-[#f5f1ea] px-3 py-2 font-mono text-xs text-black/60">
          /categories/
          <span className="text-black/80">{slugPreview || "—"}</span>
        </p>
        {isEdit && (
          <p className="mt-1 text-xs text-black/40">
            Slug updates automatically when the name changes.
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="cf-desc"
          className="block text-sm font-medium text-black"
        >
          Description
        </label>
        <textarea
          id="cf-desc"
          name="description"
          rows={3}
          defaultValue={category?.description ?? ""}
          placeholder="Optional short description"
          disabled={pending}
          className="mt-1.5 w-full resize-none rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#c44e18] focus:ring-2 focus:ring-[#c44e18]/20 disabled:opacity-50"
        />
      </div>

      {/* Sort order + Active */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="cf-sort"
            className="block text-sm font-medium text-black"
          >
            Display order
          </label>
          <input
            id="cf-sort"
            name="sortOrder"
            type="number"
            min={0}
            step={1}
            defaultValue={category?.sortOrder ?? 0}
            disabled={pending}
            className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#c44e18] focus:ring-2 focus:ring-[#c44e18]/20 disabled:opacity-50"
          />
        </div>
        <div>
          <label
            htmlFor="cf-active"
            className="block text-sm font-medium text-black"
          >
            Active
          </label>
          <select
            id="cf-active"
            name="isActive"
            defaultValue={String(category?.isActive ?? true)}
            disabled={pending}
            className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#c44e18] focus:ring-2 focus:ring-[#c44e18]/20 disabled:opacity-50"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      {/* Image */}
      <div>
        <p className="text-sm font-medium text-black">Image</p>
        <p className="mt-0.5 text-xs text-black/40">
          JPEG, PNG, or WebP · 4:3 ratio · 1200 × 900 px recommended · max 5 MB
        </p>

        {/* Edit: show existing image with replace/remove controls */}
        {isEdit && category.imageKey && imageIntent === "keep" && (
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-black/10 bg-[#f5f1ea] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={category.imageKey}
              alt={category.name}
              className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSetIntent("replace")}
                className="rounded-full border border-black/20 px-3 py-1 text-xs font-medium text-black/60 transition hover:bg-white"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => handleSetIntent("remove")}
                className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Remove confirmation banner */}
        {imageIntent === "remove" && (
          <div className="mt-2 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-3 py-2">
            <p className="text-xs text-red-600">
              Image will be removed when you save.
            </p>
            <button
              type="button"
              onClick={() => handleSetIntent("keep")}
              className="text-xs text-black/40 hover:text-black"
            >
              Undo
            </button>
          </div>
        )}

        {/* File input: create mode, edit with no image, or replace intent */}
        {showFileInput && (
          <div className="mt-2">
            <input
              ref={fileInputRef}
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp"
              disabled={pending}
              onChange={handleFileChange}
              className="block w-full rounded-xl border border-black/15 px-3 py-2 text-sm text-black file:mr-3 file:rounded-full file:border-0 file:bg-[#c44e18] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:opacity-90 disabled:opacity-50"
            />
            {isEdit && imageIntent === "replace" && (
              <button
                type="button"
                onClick={() => handleSetIntent("keep")}
                className="mt-1 text-xs text-black/40 hover:text-black"
              >
                Cancel replace
              </button>
            )}

            {/* Local preview of the selected file */}
            {previewUrl && (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-24 w-24 rounded-lg object-cover border border-black/10"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {state.error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-black/10 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="rounded-full border border-black/15 px-5 py-2 text-sm font-medium text-black/60 transition hover:bg-black/5 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[#c44e18] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {pending
            ? isEdit
              ? "Saving…"
              : "Creating…"
            : isEdit
              ? "Save changes"
              : "Create category"}
        </button>
      </div>
    </form>
  );
}
