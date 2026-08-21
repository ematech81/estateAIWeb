import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ShareBar } from '@/components/blog/ShareBar';
import { BlogPostSidebar } from '@/components/blog/BlogPostSidebar';
import { getPublishedPostBySlug, getRelatedPosts } from '@/lib/publicBlogApi';
import { estimateReadTime } from '@/lib/readTime';
import { humanizeTag } from '@/lib/tags';

// Next 15: params is async in both generateMetadata and the page itself.
type Params = Promise<{ slug: string }>;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    return { title: 'Post not found | EstateAI Blog' };
  }

  return {
    title: `${post.title} | EstateAI Blog`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  // Next dedupes identical fetch() calls made during the same request, so
  // this and generateMetadata's fetch above don't cost two real network
  // round-trips to the API.
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post);
  const primaryTag = post.tags[0];
  const publishedDate = new Date(post.publishedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-container-max flex-grow px-margin-mobile py-stack-lg md:px-gutter">
        <Breadcrumb
          items={[
            { label: 'Blog', href: '/blog' },
            ...(primaryTag ? [{ label: humanizeTag(primaryTag), href: `/blog?tag=${encodeURIComponent(primaryTag)}` }] : []),
          ]}
        />

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <article className="space-y-8 lg:col-span-8">
            <header className="space-y-6">
              <h1 className="headline-xl text-primary">{post.title}</h1>
              <div className="label-md flex flex-wrap items-center gap-4 border-y border-border-gray-200 py-4 text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  <time dateTime={post.publishedAt}>{publishedDate}</time>
                </span>
                <span className="h-4 w-px bg-border-gray-200" />
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  {estimateReadTime(post.bodyMarkdown)} min read
                </span>
                {post.tags.length > 0 && (
                  <>
                    <span className="h-4 w-px bg-border-gray-200" />
                    <span className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="label-sm rounded-full bg-surface-container-low px-3 py-1 text-on-surface-variant">
                          {humanizeTag(tag)}
                        </span>
                      ))}
                    </span>
                  </>
                )}
              </div>
            </header>

            {post.coverImage && (
              <figure className="aspect-video w-full overflow-hidden rounded-lg border border-border-gray-200 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary-hosted, not a next/image-configured domain */}
                <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
              </figure>
            )}

            <div className="markdown-body">
              <ReactMarkdown>{post.bodyMarkdown}</ReactMarkdown>
            </div>

            <ShareBar title={post.title} url={`${SITE_URL}/blog/${post.slug}`} />
          </article>

          <BlogPostSidebar relatedPosts={relatedPosts} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
