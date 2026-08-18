// Mirrors the backend canonical schema (api/src/models/Property.ts and
// api/src/services/ai/AIProvider.ts). Kept in sync by hand for now — a
// shared-types package is a reasonable later refactor once there's a second
// frontend consuming the same API, not needed at this size.

export type ListingType = 'rent' | 'sale' | 'shortlet';
export type PropertyType =
  | 'apartment'
  | 'duplex'
  | 'bungalow'
  | 'terrace'
  | 'detached_house'
  | 'semi_detached_house'
  | 'land'
  | 'commercial'
  | 'other';
export type PricePeriod = 'yearly' | 'monthly' | 'one_time' | 'nightly';
export type PropertyStatus = 'draft' | 'pending_review' | 'active' | 'inactive';

export interface PropertyPrice {
  amount: number;
  currency: string;
  period: PricePeriod;
}

export interface PropertyLocation {
  country: string;
  state?: string;
  city: string;
  district?: string;
  address?: string;
}

export interface PropertySpecifications {
  bedrooms?: number;
  bathrooms?: number;
  sizeSqm?: number;
  amenities: string[];
}

// The AI-extracted draft — every field is nullable because it reflects only
// what the model found in the agent's free text (never invented).
export interface ListingDraft {
  title: string | null;
  description: string;
  listingType: ListingType | null;
  propertyType: PropertyType | null;
  price: { amount: number | null; currency: string | null; period: PricePeriod | null };
  location: {
    country: string | null;
    state: string | null;
    city: string | null;
    district: string | null;
    address: string | null;
  };
  specifications: {
    bedrooms: number | null;
    bathrooms: number | null;
    sizeSqm: number | null;
    amenities: string[];
  };
}

// The final, strict shape required to actually create a listing.
export interface CreateListingInput {
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  price: PropertyPrice;
  location: PropertyLocation;
  specifications: PropertySpecifications;
  media: string[];
}

export interface Property extends CreateListingInput {
  _id: string;
  source: 'internal';
  status: PropertyStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Shape returned by the public GET /api/listings search endpoint — same as
// Property but with createdBy stripped (never exposed publicly) and
// replaced by the one derived boolean the UI actually needs.
export interface PublicProperty extends CreateListingInput {
  _id: string;
  source: 'internal';
  status: PropertyStatus;
  agentVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
