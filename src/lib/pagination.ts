// Compact page list with ellipses once there are enough pages to need them,
// e.g. [1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]. Shared by the client,
// callback-driven Pagination component and any URL-driven (link-based)
// pager, since the actual page-number math is identical either way.
export function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
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
