'use client';

import { useState } from 'react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  /** Sizing/aspect-ratio classes for the container (e.g. "aspect-video w-full"). */
  className?: string;
}

// Self-contained (owns its own current-index state) — fine for a grid of
// independent cards. Arrows are always visible, not hover-gated, since
// hover doesn't exist on touch devices and the reference design shows them
// unconditionally.
export function ImageCarousel({ images, alt, className = '' }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-surface-container text-on-surface-variant ${className}`}>
        <span className="material-symbols-outlined text-[32px]">image</span>
      </div>
    );
  }

  function goPrev(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i - 1 + images.length) % images.length);
  }

  function goNext(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + 1) % images.length);
  }

  return (
    <div className={`relative overflow-hidden bg-surface-container ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- agent-uploaded photos, not from a next/image-configured domain */}
      <img src={images[index]} alt={alt} className="h-full w-full object-cover" />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-trust-blue-900 shadow-md transition-colors hover:bg-white"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-trust-blue-900 shadow-md transition-colors hover:bg-white"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </>
      )}
    </div>
  );
}
