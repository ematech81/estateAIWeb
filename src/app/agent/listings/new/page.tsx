'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { getToken } from '@/lib/auth';
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

export default function NewListingPage() {
  const router = useRouter();
  const [rawText, setRawText] = useState('');
  const [form, setForm] = useState<FormState | null>(null);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) router.push('/login');
  }, [router]);

  async function handleGenerateDraft() {
    setError(null);
    setGenerating(true);
    try {
      const { draft } = await api.generateListingDraft(rawText);
      setForm(draftToForm(draft));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not generate a draft');
    } finally {
      setGenerating(false);
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSubmit() {
    if (!form) return;
    setError(null);

    if (!form.listingType || !form.propertyType || !form.pricePeriod) {
      setError('Please fill in listing type, property type, and price period before submitting.');
      return;
    }

    const payload: CreateListingInput = {
      title: form.title,
      description: form.description,
      listingType: form.listingType,
      propertyType: form.propertyType,
      price: {
        amount: Number(form.priceAmount),
        currency: form.priceCurrency,
        period: form.pricePeriod,
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
      media: [],
    };

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
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Describe your property</h1>
      <p className="mb-6 text-slate-600">
        Write it the way you&apos;d tell a client about it. AI will structure it into a listing —
        you review and edit before anything is published.
      </p>

      <textarea
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        rows={5}
        placeholder="e.g. Newly built 3 bedroom duplex at Lekki Phase 1, ₦8 million per year. It has a BQ, swimming pool, parking space, 24/7 security and prepaid meter."
        className="w-full rounded-md border border-slate-300 p-3"
      />
      <button
        onClick={handleGenerateDraft}
        disabled={generating || rawText.trim().length < 10}
        className="mt-3 rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {generating ? 'Generating draft…' : 'Generate draft with AI'}
      </button>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {form && (
        <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-8">
          <h2 className="text-lg font-semibold text-slate-900">Review &amp; edit</h2>
          <p className="text-sm text-slate-500">
            Only what you confirm here gets published — nothing is invented beyond what you wrote.
          </p>

          <Field label="Title" value={form.title} onChange={(v) => updateField('title', v)} />
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Description
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              className="rounded-md border border-slate-300 p-2 font-normal"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-3 gap-4">
            <Field
              label="Price amount"
              type="number"
              value={form.priceAmount}
              onChange={(v) => updateField('priceAmount', v)}
            />
            <Field
              label="Currency"
              value={form.priceCurrency}
              onChange={(v) => updateField('priceCurrency', v)}
            />
            <Select
              label="Period"
              value={form.pricePeriod}
              options={PRICE_PERIODS}
              onChange={(v) => updateField('pricePeriod', v as PricePeriod)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="City" value={form.city} onChange={(v) => updateField('city', v)} />
            <Field
              label="Area / District"
              value={form.district}
              onChange={(v) => updateField('district', v)}
            />
            <Field label="State" value={form.state} onChange={(v) => updateField('state', v)} />
            <Field label="Address" value={form.address} onChange={(v) => updateField('address', v)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field
              label="Bedrooms"
              type="number"
              value={form.bedrooms}
              onChange={(v) => updateField('bedrooms', v)}
            />
            <Field
              label="Bathrooms"
              type="number"
              value={form.bathrooms}
              onChange={(v) => updateField('bathrooms', v)}
            />
            <Field
              label="Size (sqm)"
              type="number"
              value={form.sizeSqm}
              onChange={(v) => updateField('sizeSqm', v)}
            />
          </div>

          <Field
            label="Amenities (comma-separated)"
            value={form.amenities}
            onChange={(v) => updateField('amenities', v)}
          />

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-2 rounded-md bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Confirm & submit listing'}
          </button>
        </div>
      )}
    </main>
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
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-300 px-3 py-2 font-normal"
      />
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
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-300 px-3 py-2 font-normal"
      >
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
