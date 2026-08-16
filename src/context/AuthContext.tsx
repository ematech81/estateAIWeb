'use client';

import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clearToken, getToken, setToken as storeToken } from '@/lib/auth';
import { api, type UserProfile } from '@/lib/api';

interface AuthContextValue {
  isAuthenticated: boolean;
  // True until the initial storage check has run once (client-only, so this
  // starts true even during SSR) — lets a consumer avoid flashing the
  // logged-out UI before hydration catches up, if it cares to.
  isLoading: boolean;
  // Populated lazily after isAuthenticated flips true (a separate fetch, not
  // derivable from the token alone) — null until it resolves, so consumers
  // that need it should fall back gracefully (e.g. "Agent" while loading).
  user: UserProfile | null;
  login: (token: string, persist?: boolean) => void;
  logout: () => void;
  /** Push a freshly-saved profile into the shared context (e.g. after the profile page's PATCH succeeds) without a redundant re-fetch. */
  setUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Single source of truth for "is anyone logged in" (and who), shared by
// every screen (Header, AgentSidebar, the auth-guard pages, register/login)
// instead of each independently reading localStorage or re-fetching the
// profile — the reason the public Header used to always show "Sign In"
// regardless of actual login state is that it never checked at all. Mounted
// once at the root layout, so login()/logout() calls anywhere propagate
// everywhere without a full page reload.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const authed = !!getToken();
    setIsAuthenticated(authed);
    setIsLoading(false);
    if (authed) {
      api.getMe().then((res) => setUser(res.user)).catch(() => {});
    }
  }, []);

  const login = useCallback((token: string, persist = true) => {
    storeToken(token, persist);
    setIsAuthenticated(true);
    api.getMe().then((res) => setUser(res.user)).catch(() => {});
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
