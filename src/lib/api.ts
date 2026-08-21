import { getToken } from './auth';
import type { CreateListingInput, ListingDraft, Property, PropertyType, PublicProperty } from '@/types/property';
import type { Lead, LeadStatus } from '@/types/lead';
import type { AdminBlogPost, BlogPostInput } from '@/types/blog';

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

// Public agent-directory shape — deliberately no email/phone (matches the
// backend's toPublicAgent(); contact goes through a listing's lead form,
// not a public directory).
export interface PublicAgent {
  id: string;
  name: string;
  role: string;
  businessName?: string;
  primaryLocation?: string;
  verificationStatus: 'unverified' | 'pending' | 'verified';
  createdAt: string;
  activeListingCount: number;
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

  // Always resolves with the same generic message, whether or not the
  // email is actually registered — the backend deliberately doesn't
  // distinguish, so this never gives the UI anything to leak either.
  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token: string, newPassword: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  generateListingDraft: (text: string) =>
    request<{ draft: ListingDraft }>('/listings/draft', { method: 'POST', body: JSON.stringify({ text }) }),

  createListing: (input: CreateListingInput) =>
    request<{ listing: Property }>('/listings', { method: 'POST', body: JSON.stringify(input) }),

  getMyListings: () => request<{ listings: Property[] }>('/listings/mine'),

  updateListing: (id: string, input: Partial<CreateListingInput>) =>
    request<{ listing: Property }>(`/listings/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),

  // Public — basic text/city matching, not AI-ranked (see listing.service.ts).
  searchListings: (
    params: {
      q?: string;
      city?: string;
      limit?: number;
      page?: number;
      international?: boolean;
      propertyType?: PropertyType;
      minPrice?: number;
      maxPrice?: number;
      agentId?: string;
    } = {},
  ) => {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.city) query.set('city', params.city);
    if (params.limit) query.set('limit', String(params.limit));
    if (params.page) query.set('page', String(params.page));
    if (params.international != null) query.set('international', String(params.international));
    if (params.propertyType) query.set('propertyType', params.propertyType);
    if (params.minPrice != null) query.set('minPrice', String(params.minPrice));
    if (params.maxPrice != null) query.set('maxPrice', String(params.maxPrice));
    if (params.agentId) query.set('agentId', params.agentId);
    const qs = query.toString();
    return request<{ listings: PublicProperty[]; total: number; page: number; limit: number; totalPages: number }>(
      `/listings${qs ? `?${qs}` : ''}`,
    );
  },

  // Public — same visibility rule as search (pending_review/active only).
  getListing: (id: string) => request<{ listing: PublicProperty }>(`/listings/${id}`),

  getMe: () => request<{ user: UserProfile }>('/users/me'),

  updateProfile: (input: { name?: string; phone?: string; businessName?: string; primaryLocation?: string }) =>
    request<{ user: UserProfile }>('/users/me', { method: 'PATCH', body: JSON.stringify(input) }),

  changePassword: (input: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/users/me/password', { method: 'PATCH', body: JSON.stringify(input) }),

  // 204 No Content — nothing to parse, but request() always calls
  // res.json() first; that .catch(() => ({})) fallback in request() makes
  // an empty body safe to await here too.
  deleteAccount: () => request<Record<string, never>>('/users/me', { method: 'DELETE' }),

  // Real numbers we already store — no view/click tracking exists, so none
  // are reported (see api/src/modules/analytics/analytics.service.ts).
  getMyAnalytics: () =>
    request<{
      listingsByStatus: Record<string, number>;
      leadsByStatus: Record<string, number>;
      listingsByMonth: { month: string; count: number }[];
    }>('/analytics/mine'),

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

  // Public — the Header's "Agents" directory.
  getAgents: (params: { page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return request<{ agents: PublicAgent[]; total: number; page: number; limit: number; totalPages: number }>(
      `/users/agents${qs ? `?${qs}` : ''}`,
    );
  },

  getAgent: (id: string) => request<{ agent: PublicAgent }>(`/users/agents/${id}`),

  // Admin-only — the public blog reads (list/by-slug) go through
  // lib/publicBlogApi.ts instead, since those run in Server Components
  // where this request() helper's localStorage-backed token lookup isn't
  // available.
  listAllBlogPosts: () => request<{ posts: AdminBlogPost[] }>('/blog-admin'),

  getBlogPostAdmin: (id: string) => request<{ post: AdminBlogPost }>(`/blog-admin/${id}`),

  createBlogPost: (input: BlogPostInput) =>
    request<{ post: AdminBlogPost }>('/blog-admin', { method: 'POST', body: JSON.stringify(input) }),

  updateBlogPost: (id: string, input: Partial<BlogPostInput>) =>
    request<{ post: AdminBlogPost }>(`/blog-admin/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),

  deleteBlogPost: (id: string) => request<Record<string, never>>(`/blog-admin/${id}`, { method: 'DELETE' }),
};
