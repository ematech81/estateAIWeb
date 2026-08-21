'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { PageLoader } from '@/components/ui/PageLoader';

// useSearchParams() needs a Suspense boundary around whatever calls it, or
// Next errors at build time — the actual page content lives in the inner
// component below so this default export can provide that boundary.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading…" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) return;

    setError(null);
    setSubmitting(true);
    try {
      await api.resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : 'Could not reset your password. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-surface px-gutter py-stack-lg">
      <div className="w-full max-w-md rounded-xl border border-border-gray-200 bg-surface-container-lowest p-stack-lg shadow-sm">
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

        {!token ? (
          <div className="flex flex-col items-center gap-stack-md text-center">
            <span className="material-symbols-outlined text-[40px] text-error">link_off</span>
            <h2 className="headline-md text-trust-blue-900">Invalid reset link</h2>
            <p className="body-md text-on-surface-variant">
              This link is missing its reset token. Request a new one below.
            </p>
            <Link href="/forgot-password" className="btn-primary">
              Request a new link
            </Link>
          </div>
        ) : done ? (
          <div className="flex flex-col items-center gap-stack-md text-center">
            <span className="material-symbols-outlined text-[40px] text-growth-emerald-500">check_circle</span>
            <h2 className="headline-md text-trust-blue-900">Password updated</h2>
            <p className="body-md text-on-surface-variant">You can now sign in with your new password.</p>
            <button type="button" onClick={() => router.push('/login')} className="btn-primary">
              Go to Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="mb-stack-md text-center">
              <h2 className="headline-md text-trust-blue-900">Choose a new password</h2>
              <p className="body-md mt-1 text-on-surface-variant">Must be at least 8 characters.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
              <label className="label-md flex flex-col gap-1 text-on-surface-variant">
                New password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="input-standard"
                />
              </label>
              <label className="label-md flex flex-col gap-1 text-on-surface-variant">
                Confirm new password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="input-standard"
                />
              </label>

              {error && (
                <p role="alert" className="body-md text-error">
                  {error}
                </p>
              )}

              <LoadingButton
                type="submit"
                loading={submitting}
                loadingText="Updating…"
                variant="secondary"
                className="w-full py-2.5"
              >
                Update Password
              </LoadingButton>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
