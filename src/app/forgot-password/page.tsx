'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { api, ApiClientError } from '@/lib/api';
import { LoadingButton } from '@/components/ui/LoadingButton';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Once true, the form is replaced by the confirmation — there's no
  // "resend" affordance here on purpose: the backend responds identically
  // whether or not the email is registered, so a resend button couldn't
  // tell the user anything a fresh visit to this page can't already.
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.');
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

        {sent ? (
          <div className="flex flex-col items-center gap-stack-md text-center">
            <span className="material-symbols-outlined text-[40px] text-growth-emerald-500">mark_email_read</span>
            <h2 className="headline-md text-trust-blue-900">Check your email</h2>
            <p className="body-md text-on-surface-variant">
              If an account exists for <span className="font-semibold text-on-surface">{email}</span>, we&apos;ve
              sent a link to reset your password. It expires in 1 hour.
            </p>
            <Link href="/login" className="label-md font-medium text-secondary hover:underline">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-stack-md text-center">
              <h2 className="headline-md text-trust-blue-900">Forgot your password?</h2>
              <p className="body-md mt-1 text-on-surface-variant">
                Enter your email and we&apos;ll send you a link to reset it.
              </p>
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

              {error && (
                <p role="alert" className="body-md text-error">
                  {error}
                </p>
              )}

              <LoadingButton
                type="submit"
                loading={submitting}
                loadingText="Sending…"
                variant="secondary"
                className="w-full py-2.5"
              >
                Send Reset Link
              </LoadingButton>
            </form>

            <p className="body-md mt-stack-lg text-center text-on-surface-variant">
              <Link href="/login" className="label-md font-medium text-secondary hover:underline">
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
