'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AgentLayout } from '@/components/layout/AgentLayout';
import { PageLoader } from '@/components/ui/PageLoader';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { DetailsForm } from '@/components/listing/DetailsForm';
import { MediaUploader } from '@/components/listing/MediaUploader';
import { formToCreateInput, propertyToForm, validateRequired, type FormState } from '@/lib/listingForm';

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [listingId, setListingId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    // No public single-listing-by-id-for-an-agent endpoint is needed here:
    // getMyListings() is already scoped to the signed-in agent and returns
    // every status (not just pending_review/active, unlike the public
    // GET /listings/:id) — the right source for "can I edit this."
    api
      .getMyListings()
      .then((res) => {
        const match = res.listings.find((l) => l._id === params.id);
        if (!match) {
          setNotFound(true);
          return;
        }
        setListingId(match._id);
        setForm(propertyToForm(match));
        setMediaUrls(match.media);
      })
      .catch((err) => setLoadError(err instanceof ApiClientError ? err.message : 'Could not load this listing.'));
  }, [isLoading, isAuthenticated, params.id]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function addMediaUrl(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return;
    setMediaUrls((prev) => [...prev, trimmed]);
  }

  function removeMediaUrl(index: number) {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!form || !listingId) return;
    const validationError = validateRequired(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      await api.updateListing(listingId, formToCreateInput(form, mediaUrls));
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not save changes');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AgentLayout>
      <div className="flex w-full justify-center px-margin-mobile py-stack-lg md:px-gutter">
        <div className="flex w-full max-w-3xl flex-col gap-stack-lg">
          <div className="flex flex-col gap-stack-sm text-center">
            <h1 className="headline-lg-mobile md:headline-lg text-trust-blue-900">Edit Listing</h1>
            <p className="body-md text-on-surface-variant">Update your listing&apos;s details and photos.</p>
          </div>

          {notFound && (
            <div className="elevation-1 rounded-lg p-10 text-center">
              <p className="body-md text-on-surface-variant">
                This listing isn&apos;t available — it may not be yours, or the link is incorrect.
              </p>
            </div>
          )}
          {loadError && <p className="body-md text-center text-error">{loadError}</p>}
          {!form && !notFound && !loadError && <PageLoader label="Loading listing…" />}

          {form && (
            <>
              <DetailsForm form={form} updateField={updateField} />

              <div className="flex flex-col gap-stack-md rounded-xl border border-border-gray-200 bg-surface-container-lowest p-stack-lg shadow-sm">
                <div>
                  <h2 className="headline-md text-on-surface">Photos</h2>
                  <p className="body-md mt-1 text-on-surface-variant">Add, remove, or reorder your listing photos.</p>
                </div>
                <MediaUploader mediaUrls={mediaUrls} onAddUrl={addMediaUrl} onRemove={removeMediaUrl} />
              </div>

              {error && (
                <p role="alert" className="body-md text-center text-error">
                  {error}
                </p>
              )}
              {saved && <p className="body-md text-center text-secondary">Changes saved.</p>}

              <div className="flex justify-between">
                <button type="button" onClick={() => router.push('/agent/dashboard')} className="btn-tertiary">
                  Cancel
                </button>
                <LoadingButton onClick={handleSave} loading={submitting} loadingText="Saving…" variant="primary">
                  Save Changes
                </LoadingButton>
              </div>
            </>
          )}
        </div>
      </div>
    </AgentLayout>
  );
}
