"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

const PER_PAGE = 4;

export default function ProductShowcase({ products }: { products: Product[] }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(products.length / PER_PAGE);
  const visible = products.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div>
      {/* Section header */}
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#F0A52E] mb-2 sm:text-[14px] lg:text-[16px]">
            Bestsellers
          </p>
          <h2 className="font-display mt-2 text-[34px] font-semibold leading-tight text-[#102F32] lg:text-[46px]">
            Our Most Preferred Chairs.
          </h2>
        </div>
        <a
          href="/product-range"
          className="hidden shrink-0 text-sm font-semibold text-[#D85B13] underline underline-offset-4 transition hover:text-[#bf5010] md:block"
        >
          View all chairs →
        </a>
      </div>

      {/* Carousel row: arrows + cards */}
      <div className="flex items-center gap-3 lg:gap-4">

        {/* Prev arrow */}
        <button
          type="button"
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          aria-label="Previous page"
          className="hidden shrink-0 h-10 w-10 items-center justify-center rounded-full border border-[#D9CDBF] text-[#102F32] transition hover:border-[#D85B13] hover:text-[#D85B13] disabled:opacity-25 md:flex"
        >
          ←
        </button>

        {/* Cards */}
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {visible.map((product) => (
            <Link
              key={product.code}
              href={`/specifications?model=${product.code}`}
              className="group overflow-hidden rounded-[16px] border border-[#D9CDBF]/40 bg-[#FBF7F0] transition duration-300 hover:-translate-y-1 hover:border-[#D85B13]/40 hover:shadow-md hover:shadow-[#D9CDBF]/30 lg:rounded-[18px]"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-[#F5EBDD]">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 639px) calc((100vw - 40px) / 2), (max-width: 1023px) calc((100vw - 72px) / 4), calc((1360px - 128px) / 4)"
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] font-semibold uppercase tracking-widest text-[#716D68]/30">
                    NC
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 lg:p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D85B13]">
                  {product.code}
                </p>
                <p className="mt-0.5 truncate text-[13px] font-semibold text-[#102F32] lg:text-[14px]">
                  {product.name}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-[#716D68]">
                  {product.category}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Next arrow */}
        <button
          type="button"
          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
          disabled={page === totalPages - 1}
          aria-label="Next page"
          className="hidden shrink-0 h-10 w-10 items-center justify-center rounded-full bg-[#D85B13] text-white transition hover:bg-[#bf5010] disabled:opacity-25 md:flex"
        >
          →
        </button>
      </div>

      {/* Mobile pagination dots + "View all" */}
      <div className="mt-5 flex items-center justify-between">
        <a
          href="/product-range"
          className="text-sm font-semibold text-[#D85B13] underline underline-offset-4 transition hover:text-[#bf5010] md:hidden"
        >
          View all chairs →
        </a>

        {totalPages > 1 && (
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              aria-label="Previous"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D9CDBF] text-[#102F32] disabled:opacity-25"
            >
              ←
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPage(i)}
                  aria-label={`Page ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === page ? "w-6 bg-[#D85B13]" : "w-1.5 bg-[#D9CDBF]"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              aria-label="Next"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D85B13] text-white disabled:opacity-25"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
