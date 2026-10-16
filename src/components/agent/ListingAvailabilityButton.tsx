'use client';

import { useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { LoadingButton } from '@/components/ui/LoadingButton';
import type { Property, UnavailableReason } from '@/types/property';

// Reason options depend on the listing type: a property for sale is "sold",
// one for rent/shortlet is "rented". "Taken off the market" covers everything
// else (owner changed their mind, listing expired, etc.).
function reasonOptions(listingType: Property['listingType']): { value: Exclude<UnavailableReason, 'removed'>; label: string }[] {
  return [
    listingType === 'sale'
      ? { value: 'sold', label: 'Sold' }
      : { value: 'rented', label: listingType === 'shortlet' ? 'Booked / rented out' : 'Rented' },
    { value: 'withdrawn', label: 'Taken off the market' },
  ];
}

// "Mark unavailable" (opens a small confirm dialog asking why) for a live
// listing, or "Mark available" (one click) for one that's been taken down.
// An unavailable listing disappears from the public site but stays here, in
// the agent's dashboard and analytics, as a record.
export function ListingAvailabilityButton({
  listing,
  onChange,
}: {
  listing: Property;
  onChange: (updated: Property) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Exclude<UnavailableReason, 'removed'>>(reasonOptions(listing.listingType)[0].value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUnavailable = listing.status === 'inactive';
  const options = reasonOptions(listing.listingType);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function save(input: Parameters<typeof api.setListingAvailability>[1]) {
    setSaving(true);
    setError(null);
    try {
      const { listing: updated } = await api.setListingAvailability(listing._id, input);
      onChange(updated);
      setOpen(false);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not update this listing. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // Drafts aren't published, so there's nothing to hide or restore.
  if (listing.status === 'draft') return null;

  // Taken down by an admin — only an admin can restore it.
  if (listing.unavailableReason === 'removed') {
    return <span className="label-sm text-error">Removed by EstateAI</span>;
  }

  if (isUnavailable) {
    return (
      <div className="flex flex-col items-end">
        <button
          type="button"
          onClick={() => save({ available: true })}
          disabled={saving}
          className="label-sm text-trust-blue-900 underline hover:opacity-80 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Mark available'}
        </button>
        {error && <span className="label-sm text-error">{error}</span>}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setReason(options[0].value);
          setError(null);
          setOpen(true);
        }}
        className="label-sm text-on-surface-variant underline hover:text-trust-blue-900"
      >
        Mark unavailable
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`unavail-title-${listing._id}`}
            className="w-full max-w-md rounded-xl bg-surface-container-lowest p-stack-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id={`unavail-title-${listing._id}`} className="headline-md mb-1 text-on-surface">
              No longer available?
            </h3>
            <p className="body-md mb-stack-sm text-on-surface-variant">{listing.title}</p>

            <fieldset className="mb-stack-sm flex flex-col gap-2">
              <legend className="label-md mb-1 text-on-surface">What happened?</legend>
              {options.map((o) => (
                <label key={o.value} className="body-md flex cursor-pointer items-center gap-2 text-on-surface">
                  <input
                    type="radio"
                    name={`reason-${listing._id}`}
                    value={o.value}
                    checked={reason === o.value}
                    onChange={() => setReason(o.value)}
                  />
                  {o.label}
                </label>
              ))}
            </fieldset>

            <p className="label-md rounded-lg bg-surface-container-low p-3 text-on-surface-variant">
              It will be hidden from the public site right away. You&apos;ll keep it in your dashboard and
              performance stats, and you can make it available again at any time.
            </p>

            {error && <p className="body-md mt-3 text-error">{error}</p>}

            <div className="mt-stack-md flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded border border-border-gray-200 bg-surface-gray-50 py-2 text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <LoadingButton
                variant="secondary"
                loading={saving}
                loadingText="Saving…"
                onClick={() => save({ available: false, reason })}
                className="flex-1"
              >
                Confirm
              </LoadingButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
