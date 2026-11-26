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

  function goToPage(n: number) {
    setPage(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const visible = products.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );

  if (products.length === 0) {
    return (
      <div className="rounded-[22px] border border-white/10 p-14 text-center" style={{ background: "linear-gradient(145deg, #073B38 0%, #092F30 55%, #073B38 100%)" }}>
        <p className="text-[15px] font-semibold text-white/70">
          No chairs found for this selection.
        </p>
        <p className="mt-2 text-[13px] text-white/40">
          Try removing some filters.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Vertical list of horizontal cards */}
      <div className="flex flex-col gap-[14px] lg:gap-[16px]">
        {visible.map((product) => (
          <ProductCard key={product.code} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="mt-10 flex items-center justify-center gap-2"
          aria-label="Product pagination"
        >
          <button
            type="button"
            onClick={() => goToPage(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
            aria-label="Previous page"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E7D4C0] bg-[#FFF9F1] text-[14px] font-bold text-[#103B39] transition hover:border-[#D85B13]/40 disabled:opacity-30"
          >
            ←
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => goToPage(n)}
              aria-label={`Page ${n}`}
              aria-current={n === safePage ? "page" : undefined}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-[14px] font-bold transition ${
                n === safePage
                  ? "bg-[#D85B13] text-white shadow-[0_4px_12px_rgba(216,91,19,0.35)]"
                  : "border border-[#E7D4C0] bg-[#FFF9F1] text-[#103B39] hover:border-[#D85B13]/40"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            onClick={() => goToPage(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages}
            aria-label="Next page"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D85B13] text-[14px] font-bold text-white transition hover:bg-[#c0500f] disabled:opacity-30"
          >
            →
          </button>
        </nav>
      )}
    </div>
  );
}
