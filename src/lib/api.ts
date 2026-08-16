import { getToken } from './auth';
import type { CreateListingInput, ListingDraft, Property, PublicProperty } from '@/types/property';
import type { Lead, LeadStatus } from '@/types/lead';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiClientError(body.message ?? 'Request failed', res.status);
  }
  return body as T;
}

// Matches the backend's toPublicUser() exactly (api/src/models/User.ts) —
// used for both auth responses and the profile page's GET /users/me.
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  businessName?: string;
  primaryLocation?: string;
  verificationStatus: 'unverified' | 'pending' | 'verified';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export const api = {
  register: (input: {
    email: string;
    password: string;
    name: string;
    role: 'agent' | 'agency' | 'owner';
    phone?: string;
    businessName?: string;
    primaryLocation?: string;
  }) => request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),

  login: (input: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),

  generateListingDraft: (text: string) =>
    request<{ draft: ListingDraft }>('/listings/draft', { method: 'POST', body: JSON.stringify({ text }) }),

  createListing: (input: CreateListingInput) =>
    request<{ listing: Property }>('/listings', { method: 'POST', body: JSON.stringify(input) }),

  getMyListings: () => request<{ listings: Property[] }>('/listings/mine'),

  // Public — basic text/city matching, not AI-ranked (see listing.service.ts).
  searchListings: (params: { q?: string; city?: string; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.city) query.set('city', params.city);
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return request<{ listings: PublicProperty[] }>(`/listings${qs ? `?${qs}` : ''}`);
  },

  // Public — same visibility rule as search (pending_review/active only).
  getListing: (id: string) => request<{ listing: PublicProperty }>(`/listings/${id}`),

  getMe: () => request<{ user: UserProfile }>('/users/me'),

  updateProfile: (input: { name?: string; phone?: string; businessName?: string; primaryLocation?: string }) =>
    request<{ user: UserProfile }>('/users/me', { method: 'PATCH', body: JSON.stringify(input) }),

  // Public — a seeker contacting an agent isn't necessarily registered.
  submitLead: (propertyId: string, input: { name: string; email: string; phone?: string; message?: string }) =>
    request<{ lead: Lead }>('/leads', { method: 'POST', body: JSON.stringify({ propertyId, ...input }) }),

  getMyLeads: () => request<{ leads: Lead[] }>('/leads/mine'),

  updateLeadStatus: (id: string, status: LeadStatus) =>
    request<{ lead: Lead }>(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  getUploadSignature: () =>
    request<{ timestamp: number; signature: string; apiKey: string; cloudName: string; folder: string }>(
      '/uploads/signature',
      { method: 'POST' },
    ),
};
