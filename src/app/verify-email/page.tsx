'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { PageLoader } from '@/components/ui/PageLoader';

const RESEND_COOLDOWN_SECONDS = 60;

// Enter-the-code screen for email verification. Needs a signed-in account —
// the code belongs to it. Reached right after registering, from the
// dashboard banner, and from the link in any older verification email.
export default function VerifyEmailPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, setUser } = useAuth();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      await api.verifyEmail(code);
      if (user) setUser({ ...user, emailVerified: true });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not verify your email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setNotice(null);
    setResending(true);
    try {
      const res = await api.resendVerification();
      setNotice(res.message);
      setCode('');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not send a new code. Please try again.');
    } finally {
      setResending(false);
    }
  }

  const header = (
    <div className="mb-stack-lg flex flex-col items-center gap-2">
      <Link href="/" className="flex items-center gap-2">
        <span
          className="material-symbols-outlined text-3xl text-growth-emerald-500"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          real_estate_agent
        </span>
        <h1 className="headline-lg-mobile text-trust-blue-900">EstateAI</h1>
      </Link>
    </div>
  );

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-surface px-gutter py-stack-lg">
      <div className="w-full max-w-md rounded-xl border border-border-gray-200 bg-surface-container-lowest p-stack-lg shadow-sm">
        {header}

        {(isLoading || !isAuthenticated || !user) && <PageLoader label="Loading…" />}

        {user?.emailVerified && (
          <div className="flex flex-col items-center gap-stack-md text-center">
            <span className="material-symbols-outlined text-[40px] text-growth-emerald-500">check_circle</span>
            <h2 className="headline-md text-trust-blue-900">Email verified</h2>
            <p className="body-md text-on-surface-variant">Thanks for confirming your email address.</p>
            <Link href="/agent/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          </div>
        )}

        {user && !user.emailVerified && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
            <div className="text-center">
              <h2 className="headline-md text-trust-blue-900">Check your email</h2>
              <p className="body-md mt-2 text-on-surface-variant">
                We sent a 6-character code to <span className="font-semibold text-on-surface">{user.email}</span>.
                Enter it below. It expires in 10 minutes.
              </p>
            </div>

            <label className="label-md flex flex-col gap-1 text-on-surface-variant">
              Verification code
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                minLength={4}
                maxLength={12}
                autoComplete="one-time-code"
                autoCapitalize="characters"
                spellCheck={false}
                autoFocus
                placeholder="e.g. K7M2QX"
                className="input-standard text-center font-mono text-[24px] uppercase tracking-[0.3em]"
              />
            </label>

            {error && <p className="body-md text-error">{error}</p>}
            {notice && <p className="body-md text-growth-emerald-500">{notice}</p>}

            <LoadingButton type="submit" loading={submitting} loadingText="Verifying…" disabled={code.trim().length < 4}>
              Verify email
            </LoadingButton>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="label-md text-trust-blue-900 underline hover:opacity-80 disabled:no-underline disabled:opacity-50"
              >
                {resending ? 'Sending…' : cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
              </button>
              <Link href="/agent/dashboard" className="label-md text-on-surface-variant hover:underline">
                Skip for now
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
