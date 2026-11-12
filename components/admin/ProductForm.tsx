"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createProduct,
  updateProduct,
  type ProductActionState,
  type ProductRow,
} from "@/app/actions/admin-products";
import ProductImageManager from "@/components/admin/ProductImageManager";

type CategoryOption = { id: string; name: string };

type Props = {
  product: ProductRow | null;
  categories: CategoryOption[];
  onClose: () => void;
};

type SpecSheetIntent = "keep" | "replace" | "remove";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const INITIAL_STATE: ProductActionState = { success: false };

export default function ProductForm({ product, categories, onClose }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const action = isEdit ? updateProduct : createProduct;
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  const [name, setName] = useState(product?.name ?? "");
  const slugPreview = toSlug(name);

  const [features, setFeatures] = useState<string[]>(product?.features ?? []);
  const [featureInput, setFeatureInput] = useState("");

  const [specSheetIntent, setSpecSheetIntent] = useState<SpecSheetIntent>("keep");

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onClose();
    }
  }, [state.success, router, onClose]);

  function addFeature() {
    const value = featureInput.trim();
    if (value && !features.includes(value)) {
      setFeatures((prev) => [...prev, value]);
    }
    setFeatureInput("");
  }

  function removeFeature(value: string) {
    setFeatures((prev) => prev.filter((f) => f !== value));
  }

  return (
    <>
    <form action={formAction} className="space-y-5">
      {isEdit && <input type="hidden" name="id" value={product.id} />}

      {state.error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-black/60">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          maxLength={200}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ergo Pro 500"
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
        />
        {slugPreview && (
          <p className="mt-1 text-xs text-black/40">
            Slug: <span className="font-mono">{slugPreview}</span>
          </p>
        )}
      </div>

      {/* Code */}
      {isEdit ? (
        <>
          <input type="hidden" name="code" value={product.code} />
          <div>
            <label className="mb-1 block text-xs font-semibold text-black/60">
              Product code
            </label>
            <p className="rounded-lg border border-black/10 bg-black/[0.02] px-3 py-2 font-mono text-sm text-black/50">
              {product.code}
            </p>
          </div>
        </>
      ) : (
        <div>
          <label className="mb-1 block text-xs font-semibold text-black/60">
            Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="code"
            required
            maxLength={50}
            placeholder="e.g. EP500"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm uppercase outline-none focus:border-black/30"
          />
        </div>
      )}

      {/* Category + Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-black/60">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="categoryId"
            required
            defaultValue={product?.categoryId ?? ""}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-black/60">
            Price
          </label>
          <input
            type="text"
            name="price"
            defaultValue={
              product?.price === "Price on request" ? "" : (product?.price ?? "")
            }
            placeholder="Price on request"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-black/60">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          placeholder="A brief description of the product…"
          className="w-full resize-none rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
        />
      </div>

      {/* Colour + Armrests */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-black/60">
            Colour
          </label>
          <input
            type="text"
            name="colour"
            defaultValue={product?.colour ?? ""}
            placeholder="e.g. Black"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-black/60">
            Armrests
          </label>
          <input
            type="text"
            name="armrests"
            defaultValue={product?.armrests ?? ""}
            placeholder="e.g. 4D"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
          />
        </div>
      </div>

      {/* Seat weight + Max user weight */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-black/60">
            Seat weight
          </label>
          <input
            type="text"
            name="seatWeight"
            defaultValue={product?.seatWeight ?? ""}
            placeholder="e.g. 14 kg"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-black/60">
            Max user weight
          </label>
          <input
            type="text"
            name="maxUserWeight"
            defaultValue={product?.maxUserWeight ?? ""}
            placeholder="e.g. 120 kg"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
          />
        </div>
      </div>

      {/* Warranty + (spacer) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-black/60">
            Warranty
          </label>
          <input
            type="text"
            name="warranty"
            defaultValue={product?.warranty ?? ""}
            placeholder="e.g. 5 years"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
          />
        </div>
        <div />
      </div>

      {/* Specs: lumbar + back */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-black/60">
            Lumbar support
          </label>
          <input
            type="text"
            name="specsLumbar"
            defaultValue={product?.specs?.lumbar ?? ""}
            placeholder="e.g. Adjustable"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-black/60">
            Back type
          </label>
          <input
            type="text"
            name="specsBack"
            defaultValue={product?.specs?.back ?? ""}
            placeholder="e.g. Mesh"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
          />
        </div>
      </div>

      {/* Features */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-black/60">
          Features
        </label>
        {features.map((f) => (
          <input key={f} type="hidden" name="features" value={f} />
        ))}
        {features.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {features.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-full bg-[#f5dfd4] px-2.5 py-0.5 text-xs font-medium text-[#c44e18]"
              >
                {f}
                <button
                  type="button"
                  onClick={() => removeFeature(f)}
                  aria-label={`Remove ${f}`}
                  className="ml-0.5 leading-none text-[#c44e18]/60 hover:text-[#c44e18]"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addFeature();
              }
            }}
            placeholder="Add a feature…"
            className="min-w-0 flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
          />
          <button
            type="button"
            onClick={addFeature}
            className="rounded-lg border border-black/10 px-3 py-2 text-xs font-medium text-black/60 transition hover:bg-black/5"
          >
            Add
          </button>
        </div>
      </div>

      {/* Status + Bestseller */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-black/60">
            Status
          </label>
          <select
            name="isActive"
            defaultValue={String(product?.isActive ?? true)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-black/60">
            Bestseller
          </label>
          <select
            name="isBestseller"
            defaultValue={String(product?.isBestseller ?? false)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
      </div>

      {/* Spec sheet — edit only */}
      {isEdit && (
        <div>
          <label className="mb-2 block text-xs font-semibold text-black/60">
            Spec sheet
          </label>
          <input
            type="hidden"
            name="removeSpecSheet"
            value={String(specSheetIntent === "remove")}
          />
          {product.specSheetKey ? (
            <>
              {specSheetIntent === "keep" && (
                <p className="mb-2 text-xs text-black/50">
                  Current:{" "}
                  <a
                    href={product.specSheetKey}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c44e18] underline"
                  >
                    View PDF
                  </a>
                </p>
              )}
              <div className="mb-3 flex flex-wrap gap-2">
                {(["keep", "replace", "remove"] as SpecSheetIntent[]).map(
                  (intent) => (
                    <button
                      key={intent}
                      type="button"
                      onClick={() => setSpecSheetIntent(intent)}
                      className={[
                        "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                        specSheetIntent === intent
                          ? "bg-black text-white"
                          : "border border-black/10 text-black/50 hover:border-black/30",
                      ].join(" ")}
                    >
                      {intent === "keep"
                        ? "Keep"
                        : intent === "replace"
                          ? "Replace"
                          : "Remove"}
                    </button>
                  ),
                )}
              </div>
              {specSheetIntent === "replace" && (
                <input
                  type="file"
                  name="specSheet"
                  accept=".pdf,application/pdf"
                  className="w-full text-sm text-black/60"
                />
              )}
            </>
          ) : (
            <input
              type="file"
              name="specSheet"
              accept=".pdf,application/pdf"
              className="w-full text-sm text-black/60"
            />
          )}
        </div>
      )}

      {/* Primary image — create only */}
      {!isEdit && (
        <div>
          <label className="mb-1 block text-xs font-semibold text-black/60">
            Primary image
          </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="w-full text-sm text-black/60"
          />
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3 border-t border-black/5 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm text-black/50 transition hover:text-black"
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
              : "Create product"}
        </button>
      </div>
    </form>

    {isEdit && (
      <ProductImageManager
        productId={product.id}
        images={product.images}
      />
    )}
    </>
  );
}
