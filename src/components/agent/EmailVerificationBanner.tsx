'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

// Shown on the dashboard only (not every agent page) — a persistent
// reminder on every screen would read as naggy; the dashboard is the one
// page an agent reliably lands on. Non-blocking: an unverified agent can
// still use the app fully, this is a nudge, not a gate.
export function EmailVerificationBanner() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleResend() {
    setStatus('sending');
    try {
      await api.resendVerification();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-tertiary-container bg-tertiary-container/10 p-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-tertiary-container">mark_email_unread</span>
        <p className="body-md text-on-surface">
          {status === 'sent' ? (
            <>Verification email sent — check your inbox.</>
          ) : (
            <>Please verify your email address to keep full access to your account.</>
          )}
        </p>
      </div>
      {status !== 'sent' && (
        <button
          type="button"
          onClick={handleResend}
          disabled={status === 'sending'}
          className="label-md shrink-0 whitespace-nowrap text-trust-blue-900 underline hover:opacity-80 disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : status === 'error' ? 'Could not send — try again' : 'Resend email'}
        </button>
      )}
    </div>
  );
}
