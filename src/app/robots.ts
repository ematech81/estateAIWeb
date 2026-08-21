import type { MetadataRoute } from 'next';

// Next's built-in robots convention — auto-served at /robots.txt.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The agent/admin areas are auth-gated anyway (nothing to index),
        // but excluding them explicitly keeps crawlers from wasting budget
        // trying.
        disallow: ['/agent/', '/admin/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
