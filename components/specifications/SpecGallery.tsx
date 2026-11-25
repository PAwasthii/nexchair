"use client";

import { useState } from "react";
import ImageMagnifier from "@/components/product-detail/ImageMagnifier";

type GalleryImage = {
  id: string;
  storageKey: string;
  altText: string | null;
  isPrimary: boolean;
};

export default function SpecGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const initialIdx = Math.max(0, images.findIndex((img) => img.isPrimary));
  const [selectedIndex, setSelectedIndex] = useState(initialIdx);

  if (images.length === 0) {
    return (
      <div
        className="flex h-[280px] items-center justify-center rounded-[28px] border border-white/10 sm:h-[360px] lg:h-[440px]"
        style={{
          background:
            "linear-gradient(145deg, #073B38 0%, #092F30 55%, #073B38 100%)",
        }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/20">
          NC
        </span>
      </div>
    );
  }

  const hasMultiple = images.length > 1;
  const selected = images[selectedIndex] ?? images[0];

  const prev = () =>
    setSelectedIndex((i) => (i - 1 + images.length) % images.length);
  const next = () =>
    setSelectedIndex((i) => (i + 1) % images.length);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image with magnifier */}
      <ImageMagnifier
        src={selected.storageKey}
        alt={selected.altText ?? productName}
        containerClassName="group relative h-[280px] overflow-hidden rounded-[28px] border border-white/10 sm:h-[360px] lg:h-[440px]"
        containerStyle={{
          background:
            "linear-gradient(145deg, #073B38 0%, #092F30 55%, #073B38 100%)",
        }}
        imageClassName="h-full w-full object-contain p-3"
      >
        {/* Prev / next arrows — only when multiple images */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#073B38]/75 text-white backdrop-blur-sm transition duration-200 hover:bg-[#073B38] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#073B38]/75 text-white backdrop-blur-sm transition duration-200 hover:bg-[#073B38] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </ImageMagnifier>

      {/* Thumbnails — only when multiple images */}
      {hasMultiple && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              aria-label={`View ${productName} image ${idx + 1}`}
              style={{
                background:
                  "linear-gradient(145deg, #073B38 0%, #092F30 55%, #073B38 100%)",
              }}
              className={`relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[12px] border-2 transition duration-200 ${
                idx === selectedIndex
                  ? "border-[#D85B13] shadow-[0_0_0_2px_rgba(216,91,19,0.20)]"
                  : "border-white/15 hover:border-[#D85B13]/60"
              }`}
            >
              <img
                src={img.storageKey}
                alt={img.altText ?? `${productName} thumbnail ${idx + 1}`}
                className="h-full w-full object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
