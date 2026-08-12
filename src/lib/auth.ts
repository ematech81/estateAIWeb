// Token storage for the MVP. Follow-up (noted, not built yet): move to an
// httpOnly cookie set by the backend instead of localStorage, once the
// consumer-facing surface makes XSS exposure a bigger concern.
const TOKEN_KEY = 'estateai_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}
