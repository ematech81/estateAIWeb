// Shared by the homepage search grid and the agent-detail page's "their
// listings" grid.
export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded border border-border-gray-200 text-on-surface transition-colors hover:border-trust-blue-900 disabled:pointer-events-none disabled:opacity-40"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="label-md px-1 text-on-surface-variant">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={
              p === page
                ? 'flex h-9 w-9 items-center justify-center rounded bg-trust-blue-900 text-label-md text-white'
                : 'flex h-9 w-9 items-center justify-center rounded text-label-md text-on-surface transition-colors hover:bg-surface-container-high'
            }
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded border border-border-gray-200 text-on-surface transition-colors hover:border-trust-blue-900 disabled:pointer-events-none disabled:opacity-40"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
    </nav>
  );
}

// Compact page list with ellipses once there are enough pages to need them,
// e.g. [1, 'ellipsis', 9, 10, 11, 'ellipsis', 20].
function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  const delta = 1; // pages shown on each side of current
  const range: (number | 'ellipsis')[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push('ellipsis');
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push('ellipsis');
  if (total > 1) range.push(total);

  return range;
}
