'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Nav shell for the authenticated agent area (dashboard, listing creation,
// etc.) — distinct from the public marketing Header (Discover/Invest/Agents/
// Help).
export function AgentHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  // "Listings" covers everything under /agent/listings (both the dashboard's
  // list and the creation flow) since there's no separate listings-index
  // page yet — the dashboard doubles as it.
  const isListings = pathname?.startsWith('/agent/listings');
  const isDashboard = !isListings && pathname?.startsWith('/agent/dashboard');
  const isProfile = pathname?.startsWith('/agent/profile');
  const isLeads = pathname?.startsWith('/agent/leads');

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <nav className="hidden h-16 w-full items-center justify-between border-b border-border-gray-200 bg-surface-container-lowest px-gutter md:flex">
      <div className="mx-auto flex h-full w-full max-w-container-max items-center justify-between">
        <div className="flex items-center gap-stack-lg">
          <Link href="/" className="headline-md font-bold text-primary">
            EstateAI
          </Link>
          <div className="flex gap-stack-md">
            <NavLink href="/agent/dashboard" active={isDashboard}>
              Dashboard
            </NavLink>
            <NavLink href="/agent/dashboard" active={isListings}>
              Listings
            </NavLink>
            <NavLink href="/agent/profile" active={isProfile}>
              Profile
            </NavLink>
            <NavLink href="/agent/leads" active={isLeads}>
              Leads
            </NavLink>
          </div>
        </div>
        <div className="flex items-center gap-stack-md">
          <button
            type="button"
            aria-label="Notifications (coming soon)"
            title="Notifications — coming soon"
            className="cursor-default text-on-surface-variant"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="text-on-surface-variant transition-colors hover:text-primary"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={
        active
          ? 'label-md border-b-2 border-primary pb-1 font-bold text-primary'
          : 'label-md text-on-surface-variant transition-colors hover:text-primary'
      }
    >
      {children}
    </Link>
  );
}

