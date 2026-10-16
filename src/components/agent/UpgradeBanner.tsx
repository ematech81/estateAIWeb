'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Shown at the top of every agent page while the agent is on the Free plan.
// Keyed on the *effective* plan tier from the API (an expired paid plan
// already comes back as 'free'), so it vanishes the moment a subscription is
// active — and returns if that subscription lapses. Hidden on the upgrade
// page itself, where it would just point at the page you're already on.
export function UpgradeBanner() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user || user.planTier !== 'free' || pathname?.startsWith('/agent/upgrade')) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-tertiary-container bg-tertiary-container/10 px-margin-mobile py-3 md:px-gutter">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined shrink-0 text-tertiary-container">workspace_premium</span>
        <p className="label-md text-on-surface">
          You&apos;re on the Free plan, which lets you list only 2 properties per month. Upgrade to list more and get
          priority in search results.
        </p>
      </div>
      <Link
        href="/agent/upgrade"
        className="label-md shrink-0 whitespace-nowrap rounded-lg bg-trust-blue-900 px-4 py-2 text-white transition-opacity hover:opacity-90"
      >
        Upgrade
      </Link>
    </div>
  );
}
