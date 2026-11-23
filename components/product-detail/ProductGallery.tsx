"use client";

import { useState } from "react";

type ProductImage = {
  id: string;
  storageKey: string;
  altText: string | null;
};

type ProductGalleryProps = {
  productName: string;
  images: ProductImage[];
};

const DARK_GREEN = "linear-gradient(145deg, #073B38 0%, #092F30 55%, #073B38 100%)";

export default function ProductGallery({
  productName,
  images,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedImage = images[selectedIndex] ?? images[0] ?? null;

  if (images.length === 0) {
    return (
      <div
        className="flex h-[280px] items-center justify-center rounded-[24px] border border-white/10 sm:h-[360px] lg:h-[440px]"
        style={{ background: DARK_GREEN }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/20">
          NC
        </span>
      </div>
    );
  }

  const hasMultiple = images.length > 1;

  const prev = () =>
    setSelectedIndex((i) => (i - 1 + images.length) % images.length);
  const next = () =>
    setSelectedIndex((i) => (i + 1) % images.length);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="group relative h-[280px] overflow-hidden rounded-[24px] border border-white/10 sm:h-[360px] lg:h-[440px]"
        style={{ background: DARK_GREEN }}
      >
        {selectedImage && (
          <img
            src={selectedImage.storageKey}
            alt={selectedImage.altText ?? `${productName} product image`}
            className="h-full w-full object-contain p-3 transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.02]"
          />
        )}

        {/* Prev / next arrows */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition duration-200 hover:bg-black/50 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
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
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition duration-200 hover:bg-black/50 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
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
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`View ${productName} image ${index + 1}`}
              style={{ background: DARK_GREEN }}
              className={`relative h-[68px] w-[68px] flex-shrink-0 overflow-hidden rounded-[12px] border-2 transition duration-200 ${
                selectedIndex === index
                  ? "border-[#D85B13] shadow-[0_0_0_2px_rgba(216,91,19,0.20)]"
                  : "border-white/15 hover:border-[#D85B13]/60"
              }`}
            >
              <img
                src={image.storageKey}
                alt={image.altText ?? `${productName} thumbnail ${index + 1}`}
                className="h-full w-full object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
