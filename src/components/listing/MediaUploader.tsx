'use client';

import { useRef, useState } from 'react';
import { uploadImage } from '@/lib/upload';
import { ApiClientError } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';

// Shared by the create wizard's Media step and the edit page — just the
// upload grid/input, no step-flow buttons (Back/Publish live in whichever
// page embeds this, since "publish" and "save changes" mean different
// things there).
export function MediaUploader({
  mediaUrls,
  onAddUrl,
  onRemove,
}: {
  mediaUrls: string[];
  onAddUrl: (url: string) => void;
  onRemove: (i: number) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    const fileArray = Array.from(files);
    setUploadingCount((c) => c + fileArray.length);
    // Sequential, not Promise.all — keeps upload order predictable and
    // avoids bursting Cloudinary with N simultaneous requests for a
    // multi-select of, say, 20 photos.
    for (const file of fileArray) {
      try {
        const url = await uploadImage(file);
        onAddUrl(url);
      } catch (err) {
        setUploadError(err instanceof ApiClientError ? err.message : `Could not upload ${file.name}`);
      } finally {
        setUploadingCount((c) => c - 1);
      }
    }
  }

  function handleAddUrlClick() {
    onAddUrl(urlInput);
    setUrlInput('');
  }

  return (
    <div className="flex flex-col gap-stack-md">
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-stack-sm sm:grid-cols-4">
          {mediaUrls.map((url, i) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border-gray-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- uploaded to Cloudinary, not a next/image-configured domain */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label="Remove image"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-trust-blue-900/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFilesSelected(e.target.files);
          e.target.value = ''; // allow re-selecting the same file again later
        }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadingCount > 0}
        className="btn-tertiary self-start"
      >
        {uploadingCount > 0 ? (
          <>
            <Spinner className="h-4 w-4" />
            Uploading {uploadingCount} photo{uploadingCount > 1 ? 's' : ''}…
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
            Upload photos
          </>
        )}
      </button>

      {uploadError && <p className="body-md text-error">{uploadError}</p>}

      {showUrlFallback ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://…"
            className="input-standard"
          />
          <button type="button" onClick={handleAddUrlClick} className="btn-tertiary shrink-0">
            Add
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowUrlFallback(true)}
          className="label-md self-start text-on-surface-variant underline"
        >
          or paste an image URL instead
        </button>
      )}
    </div>
  );
}
