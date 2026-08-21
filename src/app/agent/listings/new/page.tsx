'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AgentLayout } from '@/components/layout/AgentLayout';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { DetailsForm } from '@/components/listing/DetailsForm';
import { MediaUploader } from '@/components/listing/MediaUploader';
import { formToCreateInput, validateRequired, type FormState } from '@/lib/listingForm';
import type { ListingDraft } from '@/types/property';

type Mode = 'ai' | 'manual';
// "Local Agent" / "International Agent" — independent of the AI/Manual mode
// toggle above. It only changes the *defaults* a blank form (or an
// AI draft missing country/currency) starts with; it never overwrites a
// value the agent already typed or that the AI actually extracted.
type Region = 'local' | 'international';

// Region only decides these two defaults — Local assumes Nigeria/NGN (the
// overwhelming majority case, worth defaulting), International leaves both
// blank so the agent has to type the real values rather than us silently
// implying Nigeria for a property that isn't there.
function regionDefaults(region: Region): { country: string; priceCurrency: string } {
  return region === 'local' ? { country: 'Nigeria', priceCurrency: 'NGN' } : { country: '', priceCurrency: '' };
}

function blankForm(region: Region): FormState {
  return {
    title: '',
    description: '',
    listingType: '',
    propertyType: '',
    priceAmount: '',
    ...regionDefaults(region),
    pricePeriod: '',
    state: '',
    city: '',
    district: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    sizeSqm: '',
    amenities: '',
  };
}

function draftToForm(draft: ListingDraft, region: Region): FormState {
  const defaults = regionDefaults(region);
  return {
    title: draft.title ?? '',
    description: draft.description,
    listingType: draft.listingType ?? '',
    propertyType: draft.propertyType ?? '',
    priceAmount: draft.price.amount?.toString() ?? '',
    priceCurrency: draft.price.currency ?? defaults.priceCurrency,
    pricePeriod: draft.price.period ?? '',
    country: draft.location.country ?? defaults.country,
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
  const [region, setRegion] = useState<Region>('local');
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
    setForm(next === 'manual' ? blankForm(region) : null);
  }

  function selectRegion(next: Region) {
    setRegion(next);
    // Re-defaulting an already-open form: only touch country/currency if
    // they still hold the *other* region's default (i.e. untouched) — a
    // value the agent actually typed is never clobbered.
    setForm((prev) => {
      if (!prev) return prev;
      const prevDefaults = regionDefaults(next === 'local' ? 'international' : 'local');
      const nextDefaults = regionDefaults(next);
      return {
        ...prev,
        country: prev.country === prevDefaults.country ? nextDefaults.country : prev.country,
        priceCurrency: prev.priceCurrency === prevDefaults.priceCurrency ? nextDefaults.priceCurrency : prev.priceCurrency,
      };
    });
  }

  async function handleGenerateDraft() {
    setError(null);
    setGenerating(true);
    try {
      const { draft } = await api.generateListingDraft(rawText);
      setForm(draftToForm(draft, region));
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

    setError(null);
    setSubmitting(true);
    try {
      await api.createListing(formToCreateInput(form, mediaUrls));
      router.push('/agent/dashboard');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not submit listing');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AgentLayout>
      <div className="flex w-full justify-center px-margin-mobile py-stack-lg md:px-gutter">
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
              <div className="flex flex-col items-center gap-1">
                <RegionToggle region={region} onChange={selectRegion} />
                <p className="label-sm text-on-surface-variant">
                  {region === 'local'
                    ? "Country and currency default to Nigeria / NGN — change them below if that's wrong."
                    : "Country and currency start blank — tell us where in the world this property is."}
                </p>
              </div>

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
    </AgentLayout>
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

function RegionToggle({ region, onChange }: { region: Region; onChange: (r: Region) => void }) {
  return (
    <div className="mx-auto flex w-full max-w-sm gap-2 rounded-lg border border-border-gray-200 bg-surface-container-lowest p-1">
      <button
        type="button"
        onClick={() => onChange('local')}
        className={region === 'local' ? 'btn-primary flex-1 !py-2 text-label-sm' : 'btn-tertiary flex-1 border-0 !py-2 text-label-sm'}
      >
        🇳🇬 Local Agent
      </button>
      <button
        type="button"
        onClick={() => onChange('international')}
        className={region === 'international' ? 'btn-primary flex-1 !py-2 text-label-sm' : 'btn-tertiary flex-1 border-0 !py-2 text-label-sm'}
      >
        🌍 International Agent
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
  return (
    <div className="flex flex-col gap-stack-md rounded-xl border border-border-gray-200 bg-surface-container-lowest p-stack-lg shadow-sm">
      <div>
        <h2 className="headline-md text-on-surface">Photos</h2>
        <p className="body-md mt-1 text-on-surface-variant">
          Upload photos of the property — optional, but listings with real photos get more attention.
        </p>
      </div>

      <MediaUploader mediaUrls={mediaUrls} onAddUrl={onAddUrl} onRemove={onRemove} />

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
