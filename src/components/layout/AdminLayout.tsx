'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Deliberately not AgentSidebar — admin is a different role/mental model
// from agent, not an agent feature, and (for now) only covers the blog. A
// minimal top bar is honest about the current scope; it can grow into a
// real sidebar if the admin area grows beyond the blog.
export function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border-gray-200 bg-surface-container-lowest px-gutter">
        <div className="flex items-center gap-8">
          <Link href="/admin/blog" className="label-md font-bold text-primary">
            EstateAI Admin
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/admin/blog"
              className={
                pathname === '/admin/blog'
                  ? 'label-md text-trust-blue-900'
                  : 'label-md text-on-surface-variant transition-colors hover:text-trust-blue-900'
              }
            >
              Posts
            </Link>
            <Link
              href="/admin/blog/new"
              className={
                pathname === '/admin/blog/new'
                  ? 'label-md text-trust-blue-900'
                  : 'label-md text-on-surface-variant transition-colors hover:text-trust-blue-900'
              }
            >
              New Post
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="label-md text-on-surface-variant transition-colors hover:text-trust-blue-900">
            Back to site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="label-md text-on-surface-variant transition-colors hover:text-trust-blue-900"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
