'use client';

import { useState } from 'react';

export function PropertyGallery({ media, title }: { media: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const hasPhotos = media.length > 0;

  return (
    <div className="flex flex-col gap-stack-sm">
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-surface-container">
        {hasPhotos ? (
          // eslint-disable-next-line @next/next/no-img-element -- agent-uploaded photos, not from a next/image-configured domain
          <img src={media[active]} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px]">image</span>
          </div>
        )}
      </div>
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {media.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              className={
                i === active
                  ? 'h-16 w-16 shrink-0 overflow-hidden rounded border-2 border-trust-blue-900'
                  : 'h-16 w-16 shrink-0 overflow-hidden rounded border border-border-gray-200 opacity-70'
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
