"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";

const PER_PAGE = 4;

export default function ProductShowcase({ products }: { products: Product[] }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(products.length / PER_PAGE);
  const visible = products.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
            Our range
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Specs up front, every card.
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Previous page"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/20 transition hover:border-black/50 disabled:opacity-30"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            aria-label="Next page"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition hover:bg-black/80 disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((product) => (
          <ProductCard key={product.code} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              aria-label={`Page ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === page ? "w-6 bg-black" : "w-1.5 bg-black/20"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
