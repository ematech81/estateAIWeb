// Derived from the post's actual word count (standard 200wpm estimate) —
// not fabricated, and no backend change needed since bodyMarkdown is
// already present in the API response, just computed at render time.
export function estimateReadTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
