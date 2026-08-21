import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FeaturedPostHero } from '@/components/blog/FeaturedPostHero';
import { ArticleCard } from '@/components/blog/ArticleCard';
import { BlogFilterTabs } from '@/components/blog/BlogFilterTabs';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { getAllPublishedTags, getPublishedPosts } from '@/lib/publicBlogApi';

export const metadata: Metadata = {
  title: 'Blog | EstateAI',
  description:
    "Market insights, guides, and stories from EstateAI — Nigeria's AI-powered real estate marketplace, expanding worldwide.",
};

// A Server Component — deliberately not 'use client'. This is the app's
// first genuinely public, must-rank surface, so it needs real server-
// rendered HTML a crawler can read on the first response, not a client
// fetch behind a loading spinner.
export default async function BlogIndexPage({
  searchParams,
}: {
  // Next 15: both params and searchParams are async in Server Components.
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const { page: pageParam, tag } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const isDefaultView = page === 1 && !tag;

  // The sidebar's "Latest Posts" is deliberately site-wide, independent of
  // the current page/tag filter — it's there for cross-category discovery
  // (see any other real tag from wherever you're browsing), not a mirror of
  // whatever's already in the main grid. Only refetched when the current
  // view isn't already that exact query (page 1, no tag).
  const [{ posts, totalPages }, tags, latestPosts] = await Promise.all([
    getPublishedPosts({ page, tag }),
    getAllPublishedTags(),
    isDefaultView ? Promise.resolve(null) : getPublishedPosts({ page: 1, limit: 3 }),
  ]);
  const sidebarLatest = latestPosts ? latestPosts.posts : posts.slice(0, 3);

  // The featured hero only makes sense on the default, unfiltered landing
  // view — a filtered/paginated view is more of an archive, so it just
  // shows a plain grid instead of re-featuring whatever's first on that page.
  const heroPost = isDefaultView ? posts[0] : undefined;
  const gridPosts = heroPost ? posts.slice(1) : posts;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      {/* Single <main> for the page, but the hero and the rest of the
          content deliberately have different widths: the hero is a direct,
          unconstrained child (full page width), while everything else sits
          in the normal centered max-w-container-max column below it. */}
      <main className="flex-grow">
        {heroPost && <FeaturedPostHero post={heroPost} />}

        <div className="mx-auto w-full max-w-container-max px-margin-mobile py-stack-lg md:px-gutter">
          <div className="flex flex-col gap-stack-lg lg:flex-row">
            <div className="w-full lg:w-2/3">
              <BlogFilterTabs tags={tags} activeTag={tag} />

              {gridPosts.length === 0 ? (
                // Distinct from "genuinely nothing published" — this case is
                // "the one post there is became the hero above," which isn't
                // an empty state at all and shouldn't read like one.
                posts.length === 0 ? (
                  <p className="body-md text-on-surface-variant">
                    {tag ? 'No posts with this tag yet.' : 'No posts published yet — check back soon.'}
                  </p>
                ) : heroPost ? (
                  <p className="body-md text-on-surface-variant">More posts coming soon.</p>
                ) : null
              ) : (
                <div className="grid grid-cols-1 gap-stack-md md:grid-cols-2">
                  {gridPosts.map((post) => (
                    <ArticleCard key={post._id} post={post} />
                  ))}
                </div>
              )}

              <BlogPagination page={page} totalPages={totalPages} tag={tag} />
            </div>

            {/* Sidebar renders even on an empty grid (e.g. a tag with
                nothing published yet) — "Latest Posts" gives a
                filtered-to-nothing visitor somewhere else to go instead of
                a dead end. */}
            {sidebarLatest.length > 0 && <BlogSidebar latestPosts={sidebarLatest} />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
