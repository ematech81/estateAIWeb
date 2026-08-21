// Tags are freeform on the way in (see BlogPostForm) — admins type
// "market-insights" or "real estate" interchangeably, so this splits on
// either hyphens or spaces rather than assuming one convention. Purely a
// display transform; the raw value is still what's used in URLs/query
// params.
export function humanizeTag(tag: string): string {
  return tag
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}
