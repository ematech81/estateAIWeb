import Link from 'next/link';
import { estimateReadTime } from '@/lib/readTime';
import { humanizeTag } from '@/lib/tags';
import type { BlogPostSummary } from '@/types/blog';

export function ArticleCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="card-property group flex h-full flex-col overflow-hidden"
    >
      <div className="relative h-48 overflow-hidden">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- Cloudinary-hosted, not a next/image-configured domain
          <img
            src={post.coverImage}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-gray-50">
            <span className="material-symbols-outlined text-[48px] text-surface-tint">image_not_supported</span>
          </div>
        )}
        {post.tags[0] && (
          <div className="label-sm absolute left-4 top-4 rounded bg-surface/90 px-2 py-1 font-semibold text-primary backdrop-blur">
            {humanizeTag(post.tags[0])}
          </div>
        )}
      </div>
      <div className="flex flex-grow flex-col p-6">
        <h2 className="headline-md mb-2 text-on-surface transition-colors group-hover:text-growth-emerald-500">
          {post.title}
        </h2>
        <p className="body-md mb-4 line-clamp-3 flex-grow text-on-surface-variant">{post.excerpt}</p>
        <div className="label-sm mt-auto flex items-center justify-between border-t border-border-gray-200 pt-4 text-on-surface-variant">
          <span>
            {new Date(post.publishedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            {estimateReadTime(post.bodyMarkdown)} min read
          </span>
        </div>
      </div>
    </Link>
  );
}
