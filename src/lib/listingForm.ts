import type { CreateListingInput, ListingType, PricePeriod, Property, PropertyType } from '@/types/property';

// Shared by the create wizard (app/agent/listings/new) and the edit page
// (app/agent/listings/[id]/edit) — one form shape, one validation rule, one
// payload builder, so the two don't quietly drift apart.

export const LISTING_TYPES: ListingType[] = ['rent', 'sale', 'shortlet'];
export const PROPERTY_TYPES: PropertyType[] = [
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
export const PRICE_PERIODS: PricePeriod[] = ['yearly', 'monthly', 'one_time', 'nightly'];

// Editable form state — strings everywhere so empty inputs are representable,
// converted/validated into CreateListingInput only at submit time. The
// deterministic checks that actually enforce hard constraints live
// server-side (listing.validation.ts); this is just a friendlier UI shape.
export interface FormState {
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

export function validateRequired(form: FormState): string | null {
  if (!form.title.trim()) return 'Title is required.';
  if (!form.description.trim()) return 'Description is required.';
  if (!form.listingType) return 'Please select a listing type.';
  if (!form.propertyType) return 'Please select a property type.';
  if (!form.priceAmount || Number(form.priceAmount) <= 0) return 'Please enter a valid price.';
  if (!form.pricePeriod) return 'Please select a price period.';
  if (!form.city.trim()) return 'City is required.';
  return null;
}

export function formToCreateInput(form: FormState, mediaUrls: string[]): CreateListingInput {
  return {
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
}

// For the edit page — an existing listing's fields are all already
// concrete (unlike a nullable AI draft), so this is a straight
// number/array → string conversion, no defaulting logic needed.
export function propertyToForm(listing: Property): FormState {
  return {
    title: listing.title,
    description: listing.description,
    listingType: listing.listingType,
    propertyType: listing.propertyType,
    priceAmount: listing.price.amount.toString(),
    priceCurrency: listing.price.currency,
    pricePeriod: listing.price.period,
    country: listing.location.country,
    state: listing.location.state ?? '',
    city: listing.location.city,
    district: listing.location.district ?? '',
    address: listing.location.address ?? '',
    bedrooms: listing.specifications.bedrooms?.toString() ?? '',
    bathrooms: listing.specifications.bathrooms?.toString() ?? '',
    sizeSqm: listing.specifications.sizeSqm?.toString() ?? '',
    amenities: listing.specifications.amenities.join(', '),
  };
}
