'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-gray-200 bg-surface">
      <div className="container-app flex h-20 items-center justify-between">
        <Link href="/" className="headline-md flex items-center gap-2 text-primary">
          <span
            className="material-symbols-outlined text-growth-emerald-500"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            real_estate_agent
          </span>
          EstateAI
        </Link>

        <nav className="hidden h-full items-center gap-8 md:flex">
          <NavLink href="/" label="Discover" active={pathname === '/'} />
          <NavLink href="/agents" label="Agents" active={pathname?.startsWith('/agents') ?? false} />
          <NavLink href="/blog" label="Blog" active={pathname?.startsWith('/blog') ?? false} />
          <NavLink href="/help" label="Help" active={pathname?.startsWith('/help') ?? false} />
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Logout lives on the dashboard now (and in AgentSidebar
                  throughout the agent area) — this marketing header no
                  longer duplicates it. Dashboard/Add-a-listing swap the
                  visibility rule from before too: the filled CTA is always
                  visible (mirrors "List Property" below), the plain link
                  hides on mobile (mirrors "Sign In" below). */}
              <Link
                href="/agent/dashboard"
                className="label-md hidden text-primary transition-opacity hover:opacity-80 md:block"
              >
                Dashboard
              </Link>
              <Link href="/agent/listings/new" className="btn-primary">
                Add a listing
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="label-md hidden text-primary transition-opacity hover:opacity-80 md:block"
              >
                Sign In
              </Link>
              <Link href="/register" className="btn-primary">
                List Property
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        active
          ? 'label-md flex h-full items-center border-b-2 border-primary pb-1 text-primary'
          : 'label-md flex h-full items-center text-on-surface-variant transition-colors hover:text-primary'
      }
    >
      {label}
    </Link>
  );
}
