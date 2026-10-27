"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  deleteCategory,
  toggleCategoryActive,
  type CategoryRow,
} from "@/app/actions/admin-categories";
import CategoryForm from "./CategoryForm";

type Props = {
  categories: CategoryRow[];
};

export default function CategoryManager({ categories }: Props) {
  const router = useRouter();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);

  // Per-row delete confirmation: stores the ID of the row being confirmed
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [deletePending, startDeleteTransition] = useTransition();
  const [togglePending, startToggleTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(cat: CategoryRow) {
    setEditing(cat);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    router.refresh();
  }

  function handleDelete(id: string) {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      const result = await deleteCategory({ success: false }, fd);
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
      const result = await toggleCategoryActive({ success: false }, fd);
      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
            Management
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Categories
          </h1>
          <p className="mt-1 text-sm text-black/50">
            {categories.length}{" "}
            {categories.length === 1 ? "category" : "categories"}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="mt-2 flex-shrink-0 rounded-full bg-[#c44e18] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          + Add category
        </button>
      </div>

      {/* Empty state */}
      {categories.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-12 text-center">
          <p className="text-sm font-medium text-black/60">
            No categories yet.
          </p>
          <p className="mt-1 text-sm text-black/40">
            Add your first category to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-black/[0.02]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-black/40">
                    Category
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-black/40 sm:table-cell">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-black/40">
                    Products
                  </th>
                  <th className="hidden px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-black/40 md:table-cell">
                    Order
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-black/40">
                    Active
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-black/40">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {categories.map((cat) => {
                  const isConfirming = confirmDeleteId === cat.id;
                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-black/[0.015] transition-colors"
                    >
                      {/* Image + Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {cat.imageKey ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cat.imageKey}
                              alt={cat.name}
                              className="h-9 w-9 flex-shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#f5f1ea] text-xs text-black/25">
                              —
                            </div>
                          )}
                          <span className="font-medium text-black">
                            {cat.name}
                          </span>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span className="font-mono text-xs text-black/50">
                          {cat.slug}
                        </span>
                      </td>

                      {/* Product count */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-black/60">
                          {cat.productCount}
                        </span>
                      </td>

                      {/* Sort order */}
                      <td className="hidden px-4 py-3 text-center md:table-cell">
                        <span className="text-sm text-black/40">
                          {cat.sortOrder}
                        </span>
                      </td>

                      {/* Active toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(cat.id, cat.isActive)}
                          disabled={togglePending}
                          title={
                            cat.isActive
                              ? "Active — click to deactivate"
                              : "Inactive — click to activate"
                          }
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50",
                            cat.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-black/10 text-black/40",
                          ].join(" ")}
                        >
                          {cat.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Row actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isConfirming ? (
                            <>
                              <Link
                                href={`/admin/products?category=${cat.slug}`}
                                className="rounded-lg px-2.5 py-1 text-xs font-medium text-[#c44e18] transition hover:bg-[#f5dfd4]"
                              >
                                Products
                              </Link>
                              <button
                                type="button"
                                onClick={() => openEdit(cat)}
                                className="rounded-lg px-2.5 py-1 text-xs font-medium text-black/50 transition hover:bg-black/5 hover:text-black"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteError(null);
                                  setConfirmDeleteId(cat.id);
                                }}
                                disabled={deletePending}
                                className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
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
                                className="rounded-lg px-2 py-1 text-xs text-black/40 transition hover:text-black disabled:opacity-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(cat.id)}
                                disabled={deletePending}
                                className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                              >
                                {deletePending ? "Deleting…" : "Confirm delete"}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
            aria-label={editing ? `Edit ${editing.name}` : "Add category"}
            className="fixed inset-x-4 top-[4vh] z-[140] mx-auto max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            style={{ maxHeight: "92vh" }}
          >
            {/* Dialog header */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
                  {editing ? "Edit category" : "New category"}
                </p>
                <h2 className="mt-1 text-lg font-bold">
                  {editing ? editing.name : "Add category"}
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

            <CategoryForm
              key={editing?.id ?? "create"}
              category={editing}
              onClose={closeForm}
            />
          </div>
        </>
      )}
    </div>
  );
}
