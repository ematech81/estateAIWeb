'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { LoadingButton } from '@/components/ui/LoadingButton';

// Split branding/form layout — no top/bottom nav, matching the source
// design's intent for a transactional/login screen (same convention as
// /register's chrome-less hero).
export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();

  // Targets the same place as handleSubmit's own post-login redirect below
  // (both '/') — matches the fix on /register: this effect and the explicit
  // push both fire in the same tick right after login() flips
  // isAuthenticated, and mismatched targets meant this one silently won.
  useEffect(() => {
    if (!isLoading && isAuthenticated) router.push('/');
  }, [isLoading, isAuthenticated, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token } = await api.login({ email, password });
      // "Remember me" controls where the token is persisted: localStorage
      // survives closing the browser, sessionStorage clears when the tab
      // does — a real behavioral difference, not just a cosmetic checkbox.
      login(token, rememberMe);
      router.push('/');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full flex-col md:flex-row">
      {/* Left: branding panel — real hero photo (public/images/), same
          treatment as /register's hero: a dark gradient over the photo
          keeps the white heading text legible. */}
      <div className="relative hidden flex-col items-center justify-center overflow-hidden md:flex md:w-1/2">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-towers-day.jpg')" }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-trust-blue-900/90 via-trust-blue-900/70 to-black/85" />
        <div className="absolute -right-24 -top-24 z-0 h-96 w-96 rounded-full bg-growth-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 z-0 h-96 w-96 rounded-full bg-premium-gold/5 blur-3xl" />

        <div className="z-10 max-w-md px-12 text-center text-on-primary">
          <Link href="/" className="mb-stack-lg flex items-center justify-center gap-2">
            <span
              className="material-symbols-outlined text-4xl text-growth-emerald-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              real_estate_agent
            </span>
            <h1 className="headline-xl font-bold tracking-tight">EstateAI</h1>
          </Link>
          <h2 className="headline-lg mb-stack-md">Welcome back to the future of real estate.</h2>
          <p className="body-lg text-inverse-primary">
            Access AI-assisted listing tools, manage your properties, and reach buyers searching
            globally — all from your agent dashboard.
          </p>
        </div>
      </div>

      {/* Right: login form */}
      <div className="flex w-full flex-grow items-center justify-center bg-surface px-gutter py-stack-lg md:w-1/2">
        <div className="w-full max-w-md rounded-xl border border-border-gray-200 bg-surface-container-lowest p-stack-lg shadow-sm">
          <div className="mb-stack-lg flex flex-col items-center gap-2 md:hidden">
            <Link href="/" className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-3xl text-growth-emerald-500"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                real_estate_agent
              </span>
              <h1 className="headline-lg-mobile text-trust-blue-900">EstateAI</h1>
            </Link>
            <p className="body-md text-center text-on-surface-variant">
              Welcome back to the future of real estate.
            </p>
          </div>

          <div className="mb-stack-md hidden md:block">
            <h2 className="headline-md mb-2 text-trust-blue-900">Sign In</h2>
            <p className="body-md text-on-surface-variant">Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
            <div>
              <label htmlFor="email" className="label-md mb-stack-sm block text-on-surface">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@agency.com"
                  className="input-standard py-2 pl-10 pr-3"
                />
              </div>
            </div>

            <div>
              <div className="mb-stack-sm flex items-center justify-between">
                <label htmlFor="password" className="label-md text-on-surface">
                  Password
                </label>
                <Link href="/forgot-password" className="label-md text-secondary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-standard py-2 pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded-sm border-border-gray-200 text-trust-blue-900 focus:ring-trust-blue-900"
              />
              <label htmlFor="remember-me" className="label-md ml-2 text-on-surface-variant">
                Remember me for 30 days
              </label>
            </div>

            {error && (
              <p role="alert" className="body-md text-error">
                {error}
              </p>
            )}

            <LoadingButton
              type="submit"
              loading={submitting}
              loadingText="Signing in…"
              variant="secondary"
              className="w-full py-2.5"
            >
              Sign In
            </LoadingButton>
          </form>

          <p className="body-md mt-stack-lg text-center text-on-surface-variant">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="label-md font-medium text-secondary hover:underline">
              Sign up as Agent
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
