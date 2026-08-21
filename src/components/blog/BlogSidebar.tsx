import Link from 'next/link';
import type { BlogPostSummary } from '@/types/blog';

// Adapted from the reference design's three sidebar widgets — kept the
// visual pattern, replaced anything that would have needed fabricated data:
//  - "Trending Now" (view counts we don't track) -> "Latest Posts" (real,
//    sorted by actual publish date).
//  - The newsletter form has no backend yet, so it's an honest disabled
//    "coming soon" state rather than a form that silently does nothing.
//  - The "Verified Listings" promo now points at the real, built agent
//    directory instead of a marketplace page that doesn't exist here.
export function BlogSidebar({ latestPosts }: { latestPosts: BlogPostSummary[] }) {
  return (
    <aside className="flex w-full flex-col gap-stack-lg lg:w-1/3">
      <NewsletterWidget />
      {latestPosts.length > 0 && <LatestPostsWidget posts={latestPosts} />}
      <PromoWidget />
    </aside>
  );
}

function NewsletterWidget() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-trust-blue-900 p-6 text-white shadow-lg">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-growth-emerald-500 opacity-20 blur-2xl" />
      <div className="relative z-10">
        <span
          className="material-symbols-outlined mb-4 text-[36px] text-growth-emerald-500"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          mark_email_read
        </span>
        <h3 className="headline-md mb-2">Global Insights Weekly</h3>
        <p className="body-md mb-6 text-white/80">
          Curated market analysis, straight to your inbox — coming soon.
        </p>
        <form className="flex flex-col gap-3">
          <input
            type="email"
            disabled
            placeholder="Professional email address"
            title="Coming soon"
            className="input-standard cursor-not-allowed rounded bg-surface-container-lowest px-4 py-3 text-on-surface opacity-70 placeholder:text-on-surface-variant"
          />
          <button
            type="button"
            disabled
            title="Coming soon"
            className="label-md w-full cursor-not-allowed rounded bg-growth-emerald-500/50 py-3 font-semibold text-white/80"
          >
            Notify Me When It Launches
          </button>
        </form>
      </div>
    </div>
  );
}

function LatestPostsWidget({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <div className="rounded-xl border border-border-gray-200 bg-surface-container-lowest p-6">
      <h3 className="headline-md mb-6 flex items-center gap-2 border-b border-border-gray-200 pb-2">
        <span className="material-symbols-outlined text-growth-emerald-500">trending_up</span>
        Latest Posts
      </h3>
      <ul className="flex flex-col gap-4">
        {posts.map((post, i) => (
          <li key={post._id} className={i > 0 ? 'border-t border-border-gray-100 pt-4' : ''}>
            <Link href={`/blog/${post.slug}`} className="group flex items-start gap-4">
              <span className="headline-xl font-bold leading-none text-trust-blue-900/20 transition-colors group-hover:text-growth-emerald-500">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h4 className="label-md line-clamp-2 text-primary transition-colors group-hover:text-growth-emerald-500">
                  {post.title}
                </h4>
                <span className="label-sm text-on-surface-variant">
                  {new Date(post.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PromoWidget() {
  return (
    <div className="rounded-xl border border-border-gray-200 bg-surface-container p-6 text-center">
      <div className="flex flex-col items-center">
        <span className="material-symbols-outlined mb-2 text-[36px] text-trust-blue-900">verified_user</span>
        <h4 className="headline-md mb-2 text-primary">Verified Agents Only</h4>
        <p className="body-md mb-4 text-on-surface-variant">
          Browse our directory of identity-verified real estate agents and agencies.
        </p>
        <Link href="/agents" className="btn-primary">
          Explore Agents
        </Link>
      </div>
    </div>
  );
}
