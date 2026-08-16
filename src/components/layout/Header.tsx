'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// Nav destinations that don't have a page yet (Discover/Invest/Agents/Help)
// stay as inert placeholders — only Sign In / List Property / Dashboard go
// to real routes. Swap in real hrefs as those pages get built.
export function Header() {
  const { isAuthenticated } = useAuth();

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
          <span className="label-md flex h-full items-center border-b-2 border-primary pb-1 text-primary">
            Discover
          </span>
          <span className="label-md flex h-full items-center text-on-surface-variant">Invest</span>
          <span className="label-md flex h-full items-center text-on-surface-variant">Agents</span>
          <span className="label-md flex h-full items-center text-on-surface-variant">Help</span>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href="/agent/dashboard" className="btn-primary">
              Dashboard
            </Link>
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
