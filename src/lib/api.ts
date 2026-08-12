import { getToken } from './auth';
import type { CreateListingInput, ListingDraft, Property, PublicProperty } from '@/types/property';

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

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; name: string; role: string };
}

export const api = {
  register: (input: {
    email: string;
    password: string;
    name: string;
    role: 'agent' | 'agency' | 'owner';
    phone?: string;
    businessName?: string;
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
};
