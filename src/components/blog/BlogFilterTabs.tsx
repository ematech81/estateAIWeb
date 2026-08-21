import Link from 'next/link';
import { humanizeTag } from '@/lib/tags';

// Built from whatever tags real published posts actually use (see
// getAllPublishedTags) — not a fixed hardcoded category list, so it never
// shows a tab with nothing behind it.
export function BlogFilterTabs({ tags, activeTag }: { tags: string[]; activeTag?: string }) {
  if (tags.length === 0) return null;

  return (
    <div className="hide-scrollbar mb-6 flex gap-stack-md overflow-x-auto border-b border-border-gray-200 pb-4">
      <Tab href="/blog" label="All Insights" active={!activeTag} />
      {tags.map((tag) => (
        <Tab key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`} label={humanizeTag(tag)} active={activeTag === tag} />
      ))}
    </div>
  );
}

function Tab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        active
          ? 'label-md whitespace-nowrap border-b-2 border-trust-blue-900 pb-2 text-trust-blue-900'
          : 'label-md whitespace-nowrap border-b-2 border-transparent pb-2 text-on-surface-variant transition-colors hover:text-trust-blue-900'
      }
    >
      {label}
    </Link>
  );
}
