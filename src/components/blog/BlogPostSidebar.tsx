import Link from 'next/link';
import type { BlogPostSummary } from '@/types/blog';

// The reference design's "Property Match AI" + author-bio + related-posts
// sidebar, adapted to what this app actually is and actually has:
//  - No per-post author bio exists (blog posts don't carry a public author
//    name/photo — see blog.service.ts's toPublicPost, which strips it), and
//    exposing the admin's personal identity on every post wasn't asked for
//    — so this is a brand/editorial box, not a fabricated "Senior Analyst"
//    persona.
//  - The CTA is the important one: real copy matching the homepage's own
//    hero framing, linking straight to the real AI search, not a
//    marketplace page that doesn't exist here.
//  - "Related Insights" is real other posts, never placeholder content.
export function BlogPostSidebar({ relatedPosts }: { relatedPosts: BlogPostSummary[] }) {
  return (
    <aside className="flex flex-col gap-stack-lg lg:col-span-4">
      <AuthorWidget />
      <ListingsCta />
      {relatedPosts.length > 0 && <RelatedInsights posts={relatedPosts} />}
    </aside>
  );
}

function AuthorWidget() {
  return (
    <div className="rounded-lg border border-border-gray-200 bg-surface-container-lowest p-6 shadow-sm">
      <h3 className="label-md mb-4 uppercase tracking-wider text-on-surface-variant">About EstateAI</h3>
      <div className="flex gap-4">
        <span
          className="material-symbols-outlined flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-trust-blue-900 text-[28px] text-growth-emerald-500"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          real_estate_agent
        </span>
        <div>
          <h4 className="headline-md text-[18px] text-primary">EstateAI Editorial</h4>
          <p className="body-md mt-2 text-on-surface-variant">
            Written by the team building EstateAI — grounded in the real listing and agent data on
            this platform, not stock analysis.
          </p>
        </div>
      </div>
    </div>
  );
}

function ListingsCta() {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-trust-blue-900 p-6 shadow-md">
      <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity duration-500 group-hover:opacity-20">
        <span
          className="material-symbols-outlined text-[120px] text-white"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
      </div>
      <div className="relative z-10">
        <h3 className="headline-md mb-2 text-white">Find Your Perfect Property with AI</h3>
        <p className="body-md mb-6 text-white/80">
          Tell us what you&apos;re looking for in your own words, and we&apos;ll match you with real,
          agent-verified listings — starting in Nigeria, expanding worldwide.
        </p>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded bg-growth-emerald-500 px-4 py-3 text-label-md font-semibold text-white transition-colors hover:bg-secondary"
        >
          Search Listings
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}

function RelatedInsights({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <div className="rounded-lg border border-border-gray-200 bg-surface-container-lowest p-6 shadow-sm">
      <h3 className="label-md mb-4 uppercase tracking-wider text-on-surface-variant">Related Insights</h3>
      <div className="flex flex-col gap-stack-md">
        {posts.map((post) => (
          <Link key={post._id} href={`/blog/${post.slug}`} className="group flex gap-4">
            <div className="h-20 w-24 shrink-0 overflow-hidden rounded bg-surface-gray-50">
              {post.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- Cloudinary-hosted, not a next/image-configured domain
                <img
                  src={post.coverImage}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant/40">image_not_supported</span>
                </div>
              )}
            </div>
            <div>
              <h4 className="label-md mb-1 line-clamp-2 text-primary transition-colors group-hover:text-growth-emerald-500">
                {post.title}
              </h4>
              <p className="label-sm text-on-surface-variant">
                {new Date(post.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
