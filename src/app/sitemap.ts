import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/publicBlogApi';

// Next's built-in sitemap convention — auto-served at /sitemap.xml, no
// route file needed beyond this. NEXT_PUBLIC_SITE_URL MUST be set to the
// real production domain once deployed, or every URL here will advertise
// localhost to search engines (see .env.local.example).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/agents`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/help`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.8 },
  ];

  // Sitemap generation shouldn't 500 the whole site if the API is briefly
  // unreachable — worst case, new posts are just missing from the sitemap
  // until the next successful build/revalidation.
  const posts = await getPublishedPosts({ page: 1 })
    .then((res) => res.posts)
    .catch(() => []);

  // Only page 1 is fetched here deliberately — a full multi-page walk would
  // need a "give me every published post" endpoint; fine to add once the
  // post count actually exceeds one page.
  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes];
}
