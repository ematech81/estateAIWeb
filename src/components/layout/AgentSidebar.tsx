'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Persistent shell for the whole authenticated agent area — supersedes
// AgentHeader/AgentFooter (top nav, desktop-only, no mobile nav at all).
// Desktop: fixed left sidebar. Mobile: top bar + bottom tab bar, since the
// old AgentHeader was literally invisible below the md breakpoint — agents
// on mobile previously had no way to navigate the agent area, or even log
// out, at all.
const NAV_ITEMS = [
  { href: '/agent/dashboard', label: 'Dashboard', icon: 'dashboard', match: 'dashboard' as const },
  { href: '/agent/dashboard', label: 'Listings', icon: 'list_alt', match: 'listings' as const },
  { href: '/agent/profile', label: 'Profile', icon: 'person', match: 'profile' as const },
  { href: '/agent/leads', label: 'Leads', icon: 'group', match: 'leads' as const },
];

// Desktop-only secondary items — real pages now, but there's no room for
// them in the mobile bottom tab bar's 4 slots (NAV_ITEMS above already
// fills it). Messages deliberately has no `match`: it links to the same
// /agent/leads page as "Leads" above (no second messaging system — see
// the milestone plan), so it should never fight that nav item for the
// active highlight.
const SECONDARY_ITEMS = [
  { href: '/agent/analytics', label: 'Analytics', icon: 'analytics', match: 'analytics' as const },
  { href: '/agent/leads', label: 'Messages', icon: 'chat', match: undefined },
  { href: '/agent/upgrade', label: 'Upgrade', icon: 'workspace_premium', match: 'upgrade' as const },
];

function useActiveSection() {
  const pathname = usePathname();
  if (pathname?.startsWith('/agent/listings')) return 'listings';
  if (pathname?.startsWith('/agent/dashboard')) return 'dashboard';
  if (pathname?.startsWith('/agent/profile')) return 'profile';
  if (pathname?.startsWith('/agent/leads')) return 'leads';
  if (pathname?.startsWith('/agent/analytics')) return 'analytics';
  if (pathname?.startsWith('/agent/settings')) return 'settings';
  if (pathname?.startsWith('/agent/upgrade')) return 'upgrade';
  return null;
}

export function AgentSidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const active = useActiveSection();

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-border-gray-200 bg-surface-gray-50 py-stack-lg md:flex">
        <Link href="/" className="mb-8 block px-gutter">
          <h1 className="headline-md font-bold text-primary">EstateAI</h1>
          <p className="label-sm text-on-surface-variant">Global Marketplace</p>
        </Link>

        <div className="mb-8 flex items-center gap-3 px-gutter">
          <span className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
            account_circle
          </span>
          <div>
            <p className="label-md font-bold text-primary">{user?.name ?? 'Agent'}</p>
            <p className="label-sm capitalize text-on-surface-variant">
              {user?.verificationStatus ?? '…'}
            </p>
          </div>
        </div>

        <ul className="flex flex-grow flex-col gap-2 px-4">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={
                  active === item.match
                    ? 'flex items-center gap-3 rounded-xl bg-secondary-container px-4 py-3 font-bold text-on-secondary-container transition-all'
                    : 'flex items-center gap-3 rounded-xl px-4 py-3 text-on-surface-variant transition-all hover:bg-surface-container-high'
                }
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="label-md">{item.label}</span>
              </Link>
            </li>
          ))}
          {SECONDARY_ITEMS.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={
                  active === item.match
                    ? 'flex items-center gap-3 rounded-xl bg-secondary-container px-4 py-3 font-bold text-on-secondary-container transition-all'
                    : 'flex items-center gap-3 rounded-xl px-4 py-3 text-on-surface-variant transition-all hover:bg-surface-container-high'
                }
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="label-md">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto px-4">
          <Link
            href="/agent/listings/new"
            className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-trust-blue-900 py-3 text-label-md text-white transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add New Listing
          </Link>
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                href="/agent/settings"
                className={
                  active === 'settings'
                    ? 'flex items-center gap-3 rounded-xl bg-secondary-container px-4 py-2 font-bold text-on-secondary-container transition-all'
                    : 'flex items-center gap-3 rounded-xl px-4 py-2 text-on-surface-variant transition-all hover:bg-surface-container-high'
                }
              >
                <span className="material-symbols-outlined">settings</span>
                <span className="label-md">Settings</span>
              </Link>
            </li>
            <li>
              {/* /help already exists (built earlier) — it just never had a
                  sidebar link pointed at it. */}
              <Link
                href="/help"
                className="flex items-center gap-3 rounded-xl px-4 py-2 text-on-surface-variant transition-all hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined">help</span>
                <span className="label-md">Help Center</span>
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-error transition-all hover:bg-error/10"
              >
                <span className="material-symbols-outlined">logout</span>
                <span className="label-md">Log out</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border-gray-200 bg-surface-container-lowest px-gutter md:hidden">
        <Link href="/" className="headline-md font-bold text-primary">
          EstateAI
        </Link>
        <div className="flex items-center gap-4 text-on-surface-variant">
          <span
            className="material-symbols-outlined cursor-default"
            title="Notifications — coming soon"
          >
            notifications
          </span>
          <button type="button" onClick={handleLogout} aria-label="Log out" title="Log out">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      {/* Mobile bottom tabs — NAV_ITEMS only; a 4-slot bar has no room for
          SECONDARY_ITEMS (Analytics/Messages) too. Both are real pages,
          just reachable via the desktop sidebar or a direct link on mobile. */}
      <nav className="fixed bottom-0 z-50 flex h-16 w-full items-center justify-around border-t border-border-gray-200 bg-surface-container-lowest md:hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={
              active === item.match
                ? 'flex w-1/4 flex-col items-center border-t-2 border-primary pt-1 font-bold text-primary'
                : 'flex w-1/4 flex-col items-center pt-1 text-on-surface-variant'
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="label-sm">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
