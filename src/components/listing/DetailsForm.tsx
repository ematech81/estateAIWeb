import type { ReactNode } from 'react';
import { LISTING_TYPES, PRICE_PERIODS, PROPERTY_TYPES, type FormState } from '@/lib/listingForm';
import type { ListingType, PricePeriod, PropertyType } from '@/types/property';

// Shared by the create wizard and the edit page — one field set, one layout.
export function DetailsForm({
  form,
  updateField,
  children,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  children?: ReactNode;
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
        {/* Not Nigeria-only — an agent anywhere can list a property in any
            country (e.g. a Nigerian agent listing a property in the US). */}
        <Field label="Country" value={form.country} onChange={(v) => updateField('country', v)} />
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

export function Field({
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

export function Select({
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
