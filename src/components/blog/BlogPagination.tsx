import { ReactNode } from 'react';
import Link from 'next/link';
import { getPageNumbers } from '@/lib/pagination';

// Link-based (not callback-based, like components/ui/Pagination.tsx) since
// this renders inside a Server Component and the page number needs to be a
// real, shareable/crawlable URL (?page=N), not client state.
export function BlogPagination({ page, totalPages, tag }: { page: number; totalPages: number; tag?: string }) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);
  const hrefFor = (n: number) => {
    const params = new URLSearchParams();
    if (n > 1) params.set('page', String(n));
    if (tag) params.set('tag', tag);
    const qs = params.toString();
    return qs ? `/blog?${qs}` : '/blog';
  };

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      <PageLink href={hrefFor(page - 1)} disabled={page === 1} label="Previous page">
        <span className="material-symbols-outlined">chevron_left</span>
      </PageLink>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="label-md px-1 text-on-surface-variant">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? 'page' : undefined}
            className={
              p === page
                ? 'flex h-10 w-10 items-center justify-center rounded bg-trust-blue-900 text-label-md text-white'
                : 'label-md flex h-10 w-10 items-center justify-center rounded border border-border-gray-200 text-on-surface-variant transition-colors hover:bg-surface-container-low'
            }
          >
            {p}
          </Link>
        ),
      )}

      <PageLink href={hrefFor(page + 1)} disabled={page === totalPages} label="Next page">
        <span className="material-symbols-outlined">chevron_right</span>
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded border border-border-gray-200 text-on-surface-variant opacity-40">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded border border-border-gray-200 text-on-surface-variant transition-colors hover:border-trust-blue-900"
    >
      {children}
    </Link>
  );
}
