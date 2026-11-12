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

export default function ProductGallery({
  productName,
  images,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedImage = images[selectedIndex] ?? images[0] ?? null;

  if (images.length === 0) {
    return (
      <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
        <div className="flex gap-2 sm:flex-col">
          {["Front", "Side", "Back", "Detail"].map((item) => (
            <button
              key={item}
              type="button"
              className={`flex h-16 min-w-16 items-center justify-center rounded-xl border text-xs sm:h-20 sm:min-w-0 ${
                item === "Front"
                  ? "border-[#F26919] bg-white"
                  : "border-black/10 bg-white text-black/50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex min-h-[480px] items-center justify-center rounded-3xl bg-[#e9e3d8]">
          <p className="text-sm text-black/40">Product image</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelectedIndex(index)}
            aria-label={`View ${productName} image ${index + 1}`}
            className={`h-16 min-w-16 overflow-hidden rounded-xl bg-white sm:h-20 sm:min-w-0 ${
              selectedIndex === index
                ? "border-2 border-[#F26919]"
                : "border border-black/10"
            }`}
          >
            <img
              src={image.storageKey}
              alt={
                image.altText ??
                `${productName} thumbnail ${index + 1}`
              }
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="flex min-h-[480px] items-center justify-center overflow-hidden rounded-3xl bg-white">
        {selectedImage && (
          <img
            src={selectedImage.storageKey}
            alt={
              selectedImage.altText ??
              `${productName} product image`
            }
            className="h-full max-h-[600px] w-full object-contain"
          />
        )}
      </div>
    </div>
  );
}