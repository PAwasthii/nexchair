"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  deleteProduct,
  toggleProductActive,
  type ProductRow,
} from "@/app/actions/admin-products";
import ProductForm from "@/components/admin/ProductForm";

type CategoryOption = { id: string; name: string };
type FilterCategory = { id: string; name: string; slug: string };

type Props = {
  products: ProductRow[];
  categories: CategoryOption[];
  filterCategory?: FilterCategory | null;
};

export default function ProductManager({ products, categories, filterCategory }: Props) {
  const router = useRouter();

  const [formOpen, setFormOpen] = useState(false);
  // Store only the ID so that editing always reflects the freshest ProductRow
  // from the products prop (which is re-fetched after every router.refresh()).
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing =
    editingId !== null
      ? (products.find((p) => p.id === editingId) ?? null)
      : null;

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [deletePending, startDeleteTransition] = useTransition();
  const [togglePending, startToggleTransition] = useTransition();

  function openCreate() {
    setEditingId(null);
    setFormOpen(true);
  }

  function openEdit(product: ProductRow) {
    setEditingId(product.id);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    router.refresh();
  }

  function handleDelete(id: string) {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      const result = await deleteProduct({ success: false }, fd);
      if (result.success) {
        setConfirmDeleteId(null);
        router.refresh();
      } else {
        setDeleteError(result.error ?? "Delete failed.");
      }
    });
  }

  function handleToggle(id: string, currentIsActive: boolean) {
    startToggleTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("isActive", String(!currentIsActive));
      await toggleProductActive({ success: false }, fd);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
            Management
          </p>
          {filterCategory ? (
            <>
              <Link
                href="/admin/products"
                className="mt-2 inline-flex items-center gap-1 text-xs text-black/50 transition hover:text-black"
              >
                ← All products
              </Link>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                {filterCategory.name}
              </h1>
            </>
          ) : (
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Products</h1>
          )}
          <p className="mt-1 text-sm text-black/50">
            {products.length}{" "}
            {products.length === 1 ? "product" : "products"}
            {filterCategory ? " in this category" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="mt-2 flex-shrink-0 rounded-full bg-[#c44e18] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          + Add product
        </button>
      </div>

      {/* Empty state */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-12 text-center">
          <p className="text-sm font-medium text-black/60">
            {filterCategory
              ? `No products in ${filterCategory.name}.`
              : "No products yet."}
          </p>
          <p className="mt-1 text-sm text-black/40">
            {filterCategory
              ? "Add a product and assign it to this category."
              : "Add your first product to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => {
            const isConfirming = confirmDeleteId === product.id;
            const primaryImage =
              product.images.find((i) => i.isPrimary) ?? product.images[0];

            return (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3"
              >
                {/* Thumbnail */}
                {primaryImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryImage.storageKey}
                    alt={primaryImage.altText ?? product.name}
                    className="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#f5f1ea] text-xs text-black/25">
                    —
                  </div>
                )}

                {/* Product info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="truncate font-semibold text-black">
                      {product.name}
                    </span>
                    <span className="font-mono text-xs text-black/40">
                      {product.code}
                    </span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <span className="text-xs text-black/50">
                      {product.categoryName}
                    </span>
                    {product.isBestseller && (
                      <span className="rounded-full bg-[#f5dfd4] px-2 py-0.5 text-xs font-medium text-[#c44e18]">
                        Bestseller
                      </span>
                    )}
                    <span className="text-xs text-black/30">
                      {product.imageCount}{" "}
                      {product.imageCount === 1 ? "image" : "images"}
                    </span>
                  </div>
                </div>

                {/* Status toggle */}
                <button
                  type="button"
                  onClick={() => handleToggle(product.id, product.isActive)}
                  disabled={togglePending}
                  title={
                    product.isActive
                      ? "Active — click to deactivate"
                      : "Inactive — click to activate"
                  }
                  className={[
                    "flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50",
                    product.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-black/10 text-black/40",
                  ].join(" ")}
                >
                  {product.isActive ? "Active" : "Inactive"}
                </button>

                {/* Edit / Delete */}
                {!isConfirming ? (
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="rounded-lg border border-black/20 bg-white px-3 py-1.5 text-xs font-semibold text-black/70 transition hover:border-black/40 hover:text-black"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null);
                        setConfirmDeleteId(product.id);
                      }}
                      disabled={deletePending}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:border-red-400 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-shrink-0 flex-wrap items-center gap-1.5">
                    {deleteError && (
                      <p className="w-full text-right text-xs text-red-600">
                        {deleteError}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDeleteId(null);
                        setDeleteError(null);
                      }}
                      disabled={deletePending}
                      className="rounded-lg px-2.5 py-1.5 text-xs text-black/40 transition hover:text-black disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      disabled={deletePending}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                    >
                      {deletePending ? "Deleting…" : "Confirm delete"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {formOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[130] bg-black/40"
            onClick={closeForm}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editing ? `Edit ${editing.name}` : "Add product"}
            className="fixed inset-x-4 top-[4vh] z-[140] mx-auto max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            style={{ maxHeight: "92vh" }}
          >
            {/* Dialog header */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
                  {editing ? "Edit product" : "New product"}
                </p>
                <h2 className="mt-1 text-lg font-bold">
                  {editing ? editing.name : "Add product"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close"
                className="ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-black/40 transition hover:bg-black/5 hover:text-black"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1l12 12M13 1L1 13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <ProductForm
              key={editing?.id ?? "create"}
              product={editing}
              categories={categories}
              onClose={closeForm}
            />
          </div>
        </>
      )}
    </div>
  );
}
