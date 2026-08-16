// Token storage for the MVP. Follow-up (noted, not built yet): move to an
// httpOnly cookie set by the backend instead of localStorage, once the
// consumer-facing surface makes XSS exposure a bigger concern.
const TOKEN_KEY = 'estateai_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Persistent (localStorage) takes priority; session-only (sessionStorage)
  // is the "Remember me" unchecked case — cleared when the tab closes.
  return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY);
}

/**
 * @param persist "Remember me" — true (default) survives closing the
 * browser (localStorage); false clears when the tab does (sessionStorage).
 */
export function setToken(token: string, persist = true): void {
  const store = persist ? window.localStorage : window.sessionStorage;
  const other = persist ? window.sessionStorage : window.localStorage;
  store.setItem(TOKEN_KEY, token);
  other.removeItem(TOKEN_KEY); // avoid a stale token lingering in the other store
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
}
