'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { uploadImage } from '@/lib/upload';
import { AgentLayout } from '@/components/layout/AgentLayout';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Spinner } from '@/components/ui/Spinner';
import type {
  CreateListingInput,
  ListingDraft,
  ListingType,
  PricePeriod,
  PropertyType,
} from '@/types/property';

const LISTING_TYPES: ListingType[] = ['rent', 'sale', 'shortlet'];
const PROPERTY_TYPES: PropertyType[] = [
  'apartment',
  'duplex',
  'bungalow',
  'terrace',
  'detached_house',
  'semi_detached_house',
  'land',
  'commercial',
  'other',
];
const PRICE_PERIODS: PricePeriod[] = ['yearly', 'monthly', 'one_time', 'nightly'];

type Mode = 'ai' | 'manual';

// Editable form state — strings everywhere so empty inputs are representable,
// converted/validated into CreateListingInput only at submit time. The
// deterministic checks that actually enforce hard constraints live
// server-side (listing.validation.ts); this is just a friendlier UI shape.
interface FormState {
  title: string;
  description: string;
  listingType: ListingType | '';
  propertyType: PropertyType | '';
  priceAmount: string;
  priceCurrency: string;
  pricePeriod: PricePeriod | '';
  country: string;
  state: string;
  city: string;
  district: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  sizeSqm: string;
  amenities: string; // comma-separated in the UI
}

const BLANK_FORM: FormState = {
  title: '',
  description: '',
  listingType: '',
  propertyType: '',
  priceAmount: '',
  priceCurrency: 'NGN',
  pricePeriod: '',
  country: 'Nigeria',
  state: '',
  city: '',
  district: '',
  address: '',
  bedrooms: '',
  bathrooms: '',
  sizeSqm: '',
  amenities: '',
};

function draftToForm(draft: ListingDraft): FormState {
  return {
    title: draft.title ?? '',
    description: draft.description,
    listingType: draft.listingType ?? '',
    propertyType: draft.propertyType ?? '',
    priceAmount: draft.price.amount?.toString() ?? '',
    priceCurrency: draft.price.currency ?? 'NGN',
    pricePeriod: draft.price.period ?? '',
    country: draft.location.country ?? 'Nigeria',
    state: draft.location.state ?? '',
    city: draft.location.city ?? '',
    district: draft.location.district ?? '',
    address: draft.location.address ?? '',
    bedrooms: draft.specifications.bedrooms?.toString() ?? '',
    bathrooms: draft.specifications.bathrooms?.toString() ?? '',
    sizeSqm: draft.specifications.sizeSqm?.toString() ?? '',
    amenities: draft.specifications.amenities.join(', '),
  };
}

function validateRequired(form: FormState): string | null {
  if (!form.title.trim()) return 'Title is required.';
  if (!form.description.trim()) return 'Description is required.';
  if (!form.listingType) return 'Please select a listing type.';
  if (!form.propertyType) return 'Please select a property type.';
  if (!form.priceAmount || Number(form.priceAmount) <= 0) return 'Please enter a valid price.';
  if (!form.pricePeriod) return 'Please select a price period.';
  if (!form.city.trim()) return 'City is required.';
  return null;
}

// Step labels differ by mode: AI-assisted has a distinct "Review" step
// (checking what the AI extracted); Manual entry skips straight to the same
// form blank, so there's nothing separate to "review".
function stepsFor(mode: Mode): string[] {
  return mode === 'ai' ? ['Input', 'Review', 'Media'] : ['Details', 'Media'];
}

export default function NewListingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [mode, setMode] = useState<Mode>('ai');
  const [step, setStep] = useState(1);
  const [rawText, setRawText] = useState('');
  const [form, setForm] = useState<FormState | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const steps = stepsFor(mode);

  function selectMode(next: Mode) {
    setMode(next);
    setError(null);
    // Manual entry has nowhere to hold the form except the blank form itself
    // — its "step 1" IS the details form. Switching back to AI drops it so
    // the textarea shows again.
    setForm(next === 'manual' ? { ...BLANK_FORM } : null);
  }

  async function handleGenerateDraft() {
    setError(null);
    setGenerating(true);
    try {
      const { draft } = await api.generateListingDraft(rawText);
      setForm(draftToForm(draft));
      setStep(2);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not generate a draft');
    } finally {
      setGenerating(false);
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function handleContinueFromDetails() {
    if (!form) return;
    const validationError = validateRequired(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep(mode === 'ai' ? 3 : 2);
  }

  function addMediaUrl(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return;
    setMediaUrls((prev) => [...prev, trimmed]);
  }

  function removeMediaUrl(index: number) {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handlePublish() {
    if (!form) return;
    const validationError = validateRequired(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload: CreateListingInput = {
      title: form.title,
      description: form.description,
      listingType: form.listingType as ListingType,
      propertyType: form.propertyType as PropertyType,
      price: {
        amount: Number(form.priceAmount),
        currency: form.priceCurrency,
        period: form.pricePeriod as PricePeriod,
      },
      location: {
        country: form.country,
        state: form.state || undefined,
        city: form.city,
        district: form.district || undefined,
        address: form.address || undefined,
      },
      specifications: {
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        sizeSqm: form.sizeSqm ? Number(form.sizeSqm) : undefined,
        amenities: form.amenities
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
      },
      media: mediaUrls,
    };

    setError(null);
    setSubmitting(true);
    try {
      await api.createListing(payload);
      router.push('/agent/dashboard');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not submit listing');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <AgentHeader />

      <div className="flex w-full flex-grow justify-center px-margin-mobile py-stack-lg md:px-gutter">
        <div className="flex w-full max-w-3xl flex-col gap-stack-lg">
          <div className="flex flex-col gap-stack-sm text-center">
            <h1 className="headline-lg-mobile md:headline-lg text-trust-blue-900">AI-Assisted Listing</h1>
            <p className="body-md text-on-surface-variant">
              Let our AI extract the details and structure your listing automatically — or fill it in
              yourself.
            </p>
          </div>

          <Stepper steps={steps} current={step} />

          {step === 1 && (
            <div className="flex flex-col gap-stack-md">
              <ModeToggle mode={mode} onChange={selectMode} />

              {mode === 'ai' ? (
                <div className="card-ai-glow relative flex flex-col gap-stack-md overflow-hidden rounded-xl border border-border-gray-200 bg-surface-container-lowest p-stack-lg shadow-sm">
                  <div className="mb-2 flex items-center gap-stack-sm text-growth-emerald-500">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      auto_awesome
                    </span>
                    <span className="label-md">AI Natural Language Extraction</span>
                  </div>
                  <label className="sr-only" htmlFor="ai-input">
                    Paste property description
                  </label>
                  <textarea
                    id="ai-input"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    rows={6}
                    placeholder="Paste your raw description here... E.g., 'Newly built 3 bedroom duplex at Lekki Phase 1, ₦8 million per year. Comes with a pool and 24/7 power.'"
                    className="w-full resize-none border-none bg-transparent text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
                  />
                  <div className="flex items-center justify-between gap-stack-md border-t border-border-gray-200 pt-stack-md">
                    <p className="label-sm text-on-surface-variant">
                      Our AI will automatically fill out the form in the next step. Nothing you didn&apos;t
                      write gets invented.
                    </p>
                    <LoadingButton
                      onClick={handleGenerateDraft}
                      disabled={rawText.trim().length < 10}
                      loading={generating}
                      loadingText="Generating…"
                      variant="primary"
                      className="shrink-0"
                    >
                      Generate Listing
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </LoadingButton>
                  </div>
                </div>
              ) : (
                form && (
                  <DetailsForm form={form} updateField={updateField}>
                    <button onClick={handleContinueFromDetails} className="btn-primary mt-1 self-end">
                      Continue to Media
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </DetailsForm>
                )
              )}
            </div>
          )}

          {mode === 'ai' && step === 2 && form && (
            <DetailsForm form={form} updateField={updateField}>
              <div className="mt-1 flex justify-between">
                <button onClick={() => setStep(1)} className="btn-tertiary">
                  Back
                </button>
                <button onClick={handleContinueFromDetails} className="btn-primary">
                  Continue to Media
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </DetailsForm>
          )}

          {step === steps.length && steps.length > 0 && form && (
            <MediaStep
              mediaUrls={mediaUrls}
              onAddUrl={addMediaUrl}
              onRemove={removeMediaUrl}
              onBack={() => setStep(mode === 'ai' ? 2 : 1)}
              onPublish={handlePublish}
              submitting={submitting}
            />
          )}

          {error && (
            <p role="alert" className="body-md text-center text-error">
              {error}
            </p>
          )}
        </div>
      </div>

      <AgentFooter />
    </main>
  );
}

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="mx-auto flex w-full max-w-sm gap-2 rounded-lg border border-border-gray-200 bg-surface-container-lowest p-1">
      <button
        type="button"
        onClick={() => onChange('ai')}
        className={mode === 'ai' ? 'btn-primary flex-1 !py-2 text-label-sm' : 'btn-tertiary flex-1 border-0 !py-2 text-label-sm'}
      >
        ✨ AI-Assisted
      </button>
      <button
        type="button"
        onClick={() => onChange('manual')}
        className={mode === 'manual' ? 'btn-primary flex-1 !py-2 text-label-sm' : 'btn-tertiary flex-1 border-0 !py-2 text-label-sm'}
      >
        📝 Manual Entry
      </button>
    </div>
  );
}

function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="relative mx-auto flex w-full max-w-md items-center justify-between">
      <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full -translate-y-1/2 bg-border-gray-200" />
      {steps.map((label, i) => {
        const n = i + 1;
        const isDone = n < current;
        const isCurrent = n === current;
        return (
          <div key={label} className="z-10 flex flex-col items-center gap-stack-sm bg-surface px-2">
            <div
              className={
                isDone || isCurrent
                  ? 'label-md flex h-8 w-8 items-center justify-center rounded-full bg-trust-blue-900 text-white'
                  : 'label-md flex h-8 w-8 items-center justify-center rounded-full border border-border-gray-200 bg-surface-container-high text-on-surface-variant'
              }
            >
              {isDone ? '✓' : n}
            </div>
            <span className={isCurrent || isDone ? 'label-sm text-trust-blue-900' : 'label-sm text-on-surface-variant'}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DetailsForm({
  form,
  updateField,
  children,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-stack-md rounded-xl border border-border-gray-200 bg-surface-container-lowest p-stack-lg shadow-sm">
      <Field label="Title" value={form.title} onChange={(v) => updateField('title', v)} />
      <label className="label-md flex flex-col gap-1 text-on-surface-variant">
        Description
        <textarea
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={4}
          className="input-standard"
        />
      </label>

      <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
        <Select
          label="Listing type"
          value={form.listingType}
          options={LISTING_TYPES}
          onChange={(v) => updateField('listingType', v as ListingType)}
        />
        <Select
          label="Property type"
          value={form.propertyType}
          options={PROPERTY_TYPES}
          onChange={(v) => updateField('propertyType', v as PropertyType)}
        />
      </div>

      <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-3">
        <Field
          label="Price amount"
          type="number"
          value={form.priceAmount}
          onChange={(v) => updateField('priceAmount', v)}
        />
        <Field label="Currency" value={form.priceCurrency} onChange={(v) => updateField('priceCurrency', v)} />
        <Select
          label="Period"
          value={form.pricePeriod}
          options={PRICE_PERIODS}
          onChange={(v) => updateField('pricePeriod', v as PricePeriod)}
        />
      </div>

      <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
        <Field label="City" value={form.city} onChange={(v) => updateField('city', v)} />
        <Field label="Area / District" value={form.district} onChange={(v) => updateField('district', v)} />
        <Field label="State" value={form.state} onChange={(v) => updateField('state', v)} />
        <Field label="Address" value={form.address} onChange={(v) => updateField('address', v)} />
      </div>

      <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-3">
        <Field label="Bedrooms" type="number" value={form.bedrooms} onChange={(v) => updateField('bedrooms', v)} />
        <Field
          label="Bathrooms"
          type="number"
          value={form.bathrooms}
          onChange={(v) => updateField('bathrooms', v)}
        />
        <Field label="Size (sqm)" type="number" value={form.sizeSqm} onChange={(v) => updateField('sizeSqm', v)} />
      </div>

      <Field
        label="Amenities (comma-separated)"
        value={form.amenities}
        onChange={(v) => updateField('amenities', v)}
      />

      {children}
    </div>
  );
}

function MediaStep({
  mediaUrls,
  onAddUrl,
  onRemove,
  onBack,
  onPublish,
  submitting,
}: {
  mediaUrls: string[];
  onAddUrl: (url: string) => void;
  onRemove: (i: number) => void;
  onBack: () => void;
  onPublish: () => void;
  submitting: boolean;
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
    <div className="flex flex-col gap-stack-md rounded-xl border border-border-gray-200 bg-surface-container-lowest p-stack-lg shadow-sm">
      <div>
        <h2 className="headline-md text-on-surface">Photos</h2>
        <p className="body-md mt-1 text-on-surface-variant">
          Upload photos of the property — optional, but listings with real photos get more attention.
        </p>
      </div>

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

      <div className="mt-1 flex justify-between border-t border-border-gray-200 pt-stack-md">
        <button onClick={onBack} className="btn-tertiary">
          Back
        </button>
        <LoadingButton onClick={onPublish} loading={submitting} loadingText="Publishing…" variant="secondary">
          Publish Listing
        </LoadingButton>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="label-md flex flex-col gap-1 text-on-surface-variant">
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="input-standard" />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="label-md flex flex-col gap-1 text-on-surface-variant">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input-standard">
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.replace('_', ' ')}
          </option>
        ))}
      </select>
    </label>
  );
}
