const STORAGE_KEY = 'estateai_visitor_id';

// Visitors never sign in, so "unique visitors" is counted with a random id
// kept in this browser's localStorage. It identifies a browser, not a person,
// and carries no personal information. If storage is blocked we fall back to
// a per-page-load id (those visits just count as separate visitors).
let fallbackId: string | null = null;

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const created = generateId();
    localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    fallbackId ??= generateId();
    return fallbackId;
  }
}
