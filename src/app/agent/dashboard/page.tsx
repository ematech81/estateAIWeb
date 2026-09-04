'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { profileCompletionPercent } from '@/lib/profileCompletion';
import { AgentLayout } from '@/components/layout/AgentLayout';
import { PageLoader } from '@/components/ui/PageLoader';
import { MetricCard } from '@/components/ui/MetricCard';
import { EmailVerificationBanner } from '@/components/agent/EmailVerificationBanner';
import type { Property } from '@/types/property';

export default function AgentDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [listings, setListings] = useState<Property[] | null>(null);
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    api
      .getMyListings()
      .then((res) => setListings(res.listings))
      .catch(() => setError('Could not load your listings. Please try logging in again.'));
    // Leads failing shouldn't block the rest of the dashboard from
    // rendering — the metric just stays blank rather than erroring the page.
    api
      .getMyLeads()
      .then((res) => setLeadCount(res.leads.length))
      .catch(() => {});
  }, [isLoading, isAuthenticated, router]);

  function handleLogout() {
    logout();
    router.push('/');
  }

  const activeCount = listings?.filter((l) => l.status === 'active').length ?? null;
  const completion = user ? profileCompletionPercent(user) : null;

  return (
    <AgentLayout>
      <div className="mx-auto max-w-container-max space-y-stack-lg px-margin-mobile py-stack-lg md:px-gutter">
        {user && !user.emailVerified && <EmailVerificationBanner />}

        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="headline-lg-mobile md:headline-lg font-bold text-primary">
              Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}
            </h2>
            <p className="body-md mt-1 text-on-surface-variant">
              Here is the overview of your real estate portfolio.
            </p>
          </div>
          {/* Logout was moved here from the public marketing Header, which no
              longer duplicates it (AgentSidebar still has its own Log out
              control too — this one's for a quick, explicit, always-visible
              exit right from the dashboard itself). Red because it's the
              one genuinely destructive-feeling action in this row. */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="label-md text-on-surface-variant transition-colors hover:text-primary"
            >
              Go to home
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="label-md text-error transition-colors hover:opacity-80"
            >
              Logout
            </button>
            <Link
              href="/agent/listings/new"
              className="flex items-center gap-2 rounded-lg bg-trust-blue-900 px-4 py-2 text-label-md text-white transition-opacity hover:opacity-90 md:hidden"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Listing
            </Link>
          </div>
        </div>

        {/* Metrics — real numbers only. The reference design's trend badges
            ("+12%") and view/like counts aren't backed by anything we track
            (no historical snapshots, no view/favorite system), so they're
            left out rather than shown as fake data. */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-gutter">
          <MetricCard icon="real_estate_agent" label="Active Listings" value={activeCount} />
          <MetricCard icon="group" label="Total Leads" value={leadCount} />

          <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-trust-blue-900 p-6 text-white">
            <div className="absolute -right-4 -top-4 opacity-10">
              <span className="material-symbols-outlined text-[120px]">verified_user</span>
            </div>
            <div className="relative z-10">
              <p className="label-md text-gray-300">Profile Completion</p>
              <p className="headline-md mt-1 font-bold">{completion ?? '…'}%</p>
              <div className="mt-4 h-2.5 w-full rounded-full bg-gray-700">
                <div
                  className="h-2.5 rounded-full bg-growth-emerald-500"
                  style={{ width: `${completion ?? 0}%` }}
                />
              </div>
              <Link href="/agent/profile" className="label-sm mt-4 inline-block text-secondary-fixed hover:underline">
                Complete profile →
              </Link>
            </div>
          </div>
        </div>

        <div>
          <h3 className="headline-md mb-6 font-bold text-primary">Your Listings</h3>

          {error && <p className="body-md text-error">{error}</p>}

          {listings === null && !error && <PageLoader label="Loading your listings…" />}

          {listings?.length === 0 && (
            <div className="elevation-1 rounded-lg border-dashed p-10 text-center">
              <p className="body-md mb-stack-md text-on-surface-variant">
                You haven&apos;t listed a property yet. Describe one in your own words and let AI
                structure it for you.
              </p>
              <Link href="/agent/listings/new" className="btn-primary">
                Create your first listing
              </Link>
            </div>
          )}

          {listings && listings.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-gutter lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AgentLayout>
  );
}

const STATUS_META: Record<Property['status'], { label: string; icon: string; className: string }> = {
  active: { label: 'Live', icon: 'fiber_manual_record', className: 'text-growth-emerald-500' },
  pending_review: { label: 'Pending', icon: 'schedule', className: 'text-tertiary-container' },
  draft: { label: 'Draft', icon: 'edit_document', className: 'text-on-surface-variant' },
  inactive: { label: 'Inactive', icon: 'visibility_off', className: 'text-error' },
};

function ListingCard({ listing }: { listing: Property }) {
  const status = STATUS_META[listing.status];
  const photo = listing.media[0];

  return (
    <div className="group overflow-hidden rounded-xl border border-border-gray-200 bg-surface-container-lowest transition-shadow duration-300 hover:shadow-lg">
      <div className="relative aspect-video bg-surface-gray-50">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- agent-uploaded photos, not from a next/image-configured domain
          <img src={photo} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="material-symbols-outlined text-[48px] text-surface-tint">image_not_supported</span>
          </div>
        )}
        <div
          className={`absolute right-2 top-2 flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-label-sm backdrop-blur-sm ${status.className}`}
        >
          <span className="material-symbols-outlined text-[14px]">{status.icon}</span>
          {status.label}
        </div>
      </div>
      <div className="p-4">
        <p className="headline-md mb-1 font-bold text-primary">
          {listing.price.currency} {listing.price.amount.toLocaleString()}
        </p>
        <p className="body-md mb-3 text-on-surface-variant">{listing.title}</p>
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="label-sm text-on-surface-variant">
            {listing.location.city} · {new Date(listing.createdAt).toLocaleDateString()}
          </span>
          <Link
            href={`/agent/listings/${listing._id}/edit`}
            title="Edit listing"
            className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-trust-blue-900"
          >
            <span className="material-symbols-outlined">edit</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
