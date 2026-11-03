"use client";

import { useState } from "react";

import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";

const PER_PAGE = 9;

type ProductGridProps = {
  products: Product[];
};

export default function ProductGrid({ products }: ProductGridProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const visible = products.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/20 p-12 text-center">
        <p className="text-sm text-black/50">
          No chairs found for this selection.
        </p>

        <p className="mt-2 text-xs text-black/40">
          Try removing some filters.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((product) => (
          <ProductCard key={product.code} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          className="mt-10 flex items-center justify-center gap-2"
          aria-label="Product pagination"
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            aria-label="Previous page"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-white text-xs disabled:opacity-40"
          >
            ←
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-label={`Page ${n}`}
              aria-current={n === safePage ? "page" : undefined}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs ${
                n === safePage
                  ? "bg-[#0E3159] text-white"
                  : "border border-black/10 bg-white hover:border-black/30"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            aria-label="Next page"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-white text-xs disabled:opacity-40"
          >
            →
          </button>
        </nav>
      )}
    </div>
  );
}
