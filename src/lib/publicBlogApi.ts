import type { BlogPost, BlogPostSummary } from '@/types/blog';

// Server-safe fetch helpers for the public, server-rendered blog pages
// (app/blog/**) — deliberately NOT lib/api.ts's request(), which calls
// getToken() from lib/auth.ts (localStorage) and would crash during
// server-side rendering. These run on the server (and are never called from
// a 'use client' component), so a plain fetch() is all that's needed.
//
// `cache: 'no-store'` — deliberately NOT ISR (`next: { revalidate }`).
// ISR served visibly stale results here (publish a post, then the page
// still shows the pre-publish state for up to the revalidate window) with
// no way for the admin to force a refresh. The blog has essentially no
// traffic yet, so always-fresh is worth the extra request per view; worth
// revisiting (a short revalidate window, or on-demand revalidation
// triggered from the admin's publish action) once that trade-off flips.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export interface PublishedPostsPage {
  posts: BlogPostSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getPublishedPosts(
  params: { page?: number; limit?: number; tag?: string } = {},
): Promise<PublishedPostsPage> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.tag) query.set('tag', params.tag);
  const qs = query.toString();

  const res = await fetch(`${API_URL}/blog${qs ? `?${qs}` : ''}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Could not load blog posts');
  }
  return res.json();
}

// Returns null (not a throw) for a missing/unpublished slug, so callers can
// go straight to Next's notFound() without a try/catch.
export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const res = await fetch(`${API_URL}/blog/${encodeURIComponent(slug)}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error('Could not load blog post');
  }
  const body = await res.json();
  return body.post as BlogPost;
}

// Real other posts, never placeholder cards. Prefers posts sharing the
// current post's first tag (genuinely "related"); tops up with the most
// recent posts otherwise so the widget isn't empty on a blog that's still
// short on tag overlap.
export async function getRelatedPosts(post: BlogPostSummary, limit = 2): Promise<BlogPostSummary[]> {
  const primaryTag = post.tags[0];
  const [byTag, recent] = await Promise.all([
    primaryTag ? getPublishedPosts({ tag: primaryTag, limit: limit + 1 }) : Promise.resolve(null),
    getPublishedPosts({ limit: limit + 1 }),
  ]);

  const seen = new Set([post._id]);
  const related: BlogPostSummary[] = [];
  for (const candidate of [...(byTag?.posts ?? []), ...recent.posts]) {
    if (related.length >= limit) break;
    if (seen.has(candidate._id)) continue;
    seen.add(candidate._id);
    related.push(candidate);
  }
  return related;
}

// Flagged simplification: there's no dedicated "distinct tags" endpoint —
// this just pulls the most recent published posts (24, the API's current
// max page size) and dedupes their tags. Fine while the blog has a couple
// dozen posts; once it outgrows that, either bump the backend's list-size
// cap or add a real /api/blog/tags endpoint.
export async function getAllPublishedTags(): Promise<string[]> {
  const { posts } = await getPublishedPosts({ limit: 24 });
  const seen = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) seen.add(tag);
  }
  return Array.from(seen);
}
