import Link from 'next/link';
import { humanizeTag } from '@/lib/tags';
import type { BlogPostSummary } from '@/types/blog';

// The most recent post, shown large — only on the unfiltered first page of
// /blog (see app/blog/page.tsx). Full-bleed (rendered outside the page's
// max-w-container-max column — see how the caller mounts it), unlike
// everything below it. The background is always the static brand hero
// photo, never a per-post cover image — only the overlaid title, excerpt,
// tag, and "Read Full Report" link are dynamic, tied to the real latest
// post. No fabricated view/engagement numbers either way.
export function FeaturedPostHero({ post }: { post: BlogPostSummary }) {
  return (
    <section>
      <Link
        href={`/blog/${post.slug}`}
        className="group relative block h-[60vh] min-h-[400px] w-full overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: "url('/images/hero-skyline-night.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-trust-blue-900/90 via-trust-blue-900/40 to-transparent" />

        <div className="absolute bottom-0 left-0 max-w-3xl p-6 md:p-12">
          {post.tags[0] && (
            <span className="label-sm mb-4 inline-block rounded-full bg-growth-emerald-500 px-3 py-1 font-semibold text-white">
              {humanizeTag(post.tags[0])}
            </span>
          )}
          <h1 className="headline-xl mb-4 leading-tight text-white">{post.title}</h1>
          <p className="body-lg mb-6 line-clamp-2 text-white/80 md:line-clamp-none">{post.excerpt}</p>
          <span className="btn-primary inline-flex w-fit">
            Read Full Report
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </span>
        </div>
      </Link>
    </section>
  );
}
