'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { PageLoader } from '@/components/ui/PageLoader';

// useSearchParams() needs a Suspense boundary around whatever calls it —
// same pattern as /reset-password.
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading…" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

type Status = 'verifying' | 'success' | 'error' | 'no-token';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'no-token');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setError(err instanceof ApiClientError ? err.message : 'Could not verify your email.');
        setStatus('error');
      });
  }, [token]);

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

        <div className="flex flex-col items-center gap-stack-md text-center">
          {status === 'verifying' && <PageLoader label="Verifying your email…" />}

          {status === 'no-token' && (
            <>
              <span className="material-symbols-outlined text-[40px] text-error">link_off</span>
              <h2 className="headline-md text-trust-blue-900">Invalid verification link</h2>
              <p className="body-md text-on-surface-variant">
                This link is missing its verification token. You can request a new one from your
                dashboard.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <span className="material-symbols-outlined text-[40px] text-growth-emerald-500">check_circle</span>
              <h2 className="headline-md text-trust-blue-900">Email verified</h2>
              <p className="body-md text-on-surface-variant">Thanks for confirming your email address.</p>
              <Link href="/agent/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <span className="material-symbols-outlined text-[40px] text-error">error</span>
              <h2 className="headline-md text-trust-blue-900">Verification failed</h2>
              <p className="body-md text-on-surface-variant">{error}</p>
              <p className="body-md text-on-surface-variant">
                You can request a new verification email from your dashboard.
              </p>
              <Link href="/agent/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
