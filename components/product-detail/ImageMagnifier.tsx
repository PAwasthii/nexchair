"use client";

import { useState, useEffect } from "react";

type Props = {
  src: string;
  alt: string;
  containerClassName: string;
  containerStyle?: React.CSSProperties;
  imageClassName: string;
  children?: React.ReactNode;
};

export default function ImageMagnifier({
  src,
  alt,
  containerClassName,
  containerStyle,
  imageClassName,
  children,
}: Props) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Lock body scroll when viewer is open
  useEffect(() => {
    if (isViewerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isViewerOpen]);

  // Escape key closes viewer
  useEffect(() => {
    if (!isViewerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsViewerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isViewerOpen]);

  return (
    <>
      {/* Image container */}
      <div className={containerClassName} style={containerStyle}>
        <img
          src={src}
          alt={alt}
          className={imageClassName}
          draggable={false}
        />

        {/* Prev/next nav buttons or any other overlay children */}
        {children}

        {/* Magnifier icon button — opens fullscreen viewer */}
        <button
          type="button"
          aria-label="View larger image"
          title="Click to enlarge"
          onClick={() => setIsViewerOpen(true)}
          className="absolute bottom-4 right-4 z-20 flex h-[44px] w-[44px] items-center justify-center rounded-full text-white shadow-[0_2px_14px_rgba(0,0,0,0.42)] transition-transform duration-150 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          style={{
            background: "#073B38",
            border: "1.5px solid rgba(255,255,255,0.22)",
          }}
        >
          <svg
            className="h-[18px] w-[18px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
            <line x1="11" y1="8" x2="11" y2="14" />
          </svg>
        </button>
      </div>

      {/* Fullscreen image viewer */}
      {isViewerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product image viewer"
          className="fixed inset-0 z-[200]"
          style={{ background: "rgba(7, 59, 56, 0.96)" }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsViewerOpen(false)}
            aria-label="Close image viewer"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
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
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Scroll/pinch-zoom area */}
          <div
            className="flex h-full w-full items-center justify-center overflow-auto p-4"
            style={{ touchAction: "pan-x pan-y pinch-zoom" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsViewerOpen(false);
            }}
          >
            <img
              src={src}
              alt={alt}
              className="max-h-[85vh] max-w-full object-contain"
              style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: "pinch-zoom",
              }}
              draggable={false}
            />
          </div>
        </div>
      )}
    </>
  );
}
