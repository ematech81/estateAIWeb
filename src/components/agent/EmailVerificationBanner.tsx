import Link from 'next/link';

// Shown on the dashboard only (not every agent page) — a persistent
// reminder on every screen would read as naggy; the dashboard is the one
// page an agent reliably lands on. Non-blocking: an unverified agent can
// still use the app fully, this is a nudge, not a gate. Verification itself
// happens on /verify-email, where the agent enters the code we emailed them
// (and can ask for a new one).
export function EmailVerificationBanner() {
  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-tertiary-container bg-tertiary-container/10 p-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-tertiary-container">mark_email_unread</span>
        <p className="body-md text-on-surface">Please verify your email address with the code we sent you.</p>
      </div>
      <Link
        href="/verify-email"
        className="label-md shrink-0 whitespace-nowrap rounded-lg bg-trust-blue-900 px-4 py-2 text-white transition-opacity hover:opacity-90"
      >
        Enter code
      </Link>
    </div>
  );
}
