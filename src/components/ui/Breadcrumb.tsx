import Link from 'next/link';

export interface Crumb {
  label: string;
  href?: string; // omitted → rendered as the current, non-clickable segment
}

// Shared "way back" trail for any page reached by drilling into a list
// (blog post ← blog, property ← search, agent ← directory) — the exact gap
// flagged after shipping the blog: reachable via a card click, but only
// escapable via the browser's own back button. The chevron between
// segments doubles as the "navigation arrows" ask — wayfinding, not a
// separate literal arrow control.
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="label-sm mb-6 flex flex-wrap items-center gap-2 text-on-surface-variant">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2">
          {i > 0 && <span className="material-symbols-outlined text-[16px]">chevron_right</span>}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-trust-blue-900">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-primary">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
