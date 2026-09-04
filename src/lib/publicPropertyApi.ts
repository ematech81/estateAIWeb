import type { PublicProperty } from '@/types/property';

// Server-safe fetch for the property detail page's Server Component —
// deliberately NOT lib/api.ts's request(), which calls getToken() from
// lib/auth.ts (localStorage) and would crash during server-side rendering.
// Same cache: 'no-store' choice as lib/publicBlogApi.ts, for the same
// reason: ISR served visibly stale results after a listing was edited,
// with no way to force a refresh — traffic here is low enough that
// always-fresh is worth an extra request per view.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

// Returns null (not a throw) for a missing/unpublished listing, so callers
// can go straight to Next's notFound() without a try/catch.
export async function getPublishedListingById(id: string): Promise<PublicProperty | null> {
  const res = await fetch(`${API_URL}/listings/${encodeURIComponent(id)}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error('Could not load this property');
  }
  const body = await res.json();
  return body.listing as PublicProperty;
}
