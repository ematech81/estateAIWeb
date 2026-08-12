'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Property } from '@/types/property';

export default function AgentDashboardPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Property[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
      return;
    }
    api
      .getMyListings()
      .then((res) => setListings(res.listings))
      .catch(() => setError('Could not load your listings. Please try logging in again.'));
  }, [router]);

  return (
    <main className="min-h-screen bg-surface-gray-50">
      <div className="container-app max-w-3xl py-12">
        <div className="mb-stack-lg flex items-center justify-between">
          <h1 className="headline-md text-on-surface">Your listings</h1>
          <Link href="/agent/listings/new" className="btn-primary">
            + New listing
          </Link>
        </div>

        {error && <p className="body-md text-error">{error}</p>}

        {listings === null && !error && <p className="body-md text-on-surface-variant">Loading…</p>}

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
          <ul className="flex flex-col gap-stack-sm">
            {listings.map((listing) => (
              <li key={listing._id} className="card-property p-4">
                <div className="flex items-center justify-between">
                  <h2 className="body-md font-semibold text-on-surface">{listing.title}</h2>
                  <StatusBadge status={listing.status} />
                </div>
                <p className="label-md mt-1 text-on-surface-variant">
                  {listing.location.city}
                  {listing.location.district ? `, ${listing.location.district}` : ''} ·{' '}
                  {listing.price.currency} {listing.price.amount.toLocaleString()} /{' '}
                  {listing.price.period}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: Property['status'] }) {
  const classNames: Record<Property['status'], string> = {
    draft: 'badge-pending',
    pending_review: 'badge-pending',
    active: 'badge-verified',
    // No dedicated token for "inactive" in DESIGN.md's status set — extends
    // the badge base with the error tokens rather than inventing a new
    // color; promote to a named .badge-* class in globals.css if this shows
    // up in more places later.
    inactive: 'badge bg-error-container text-on-error-container',
  };
  return <span className={classNames[status]}>{status.replace('_', ' ')}</span>;
}
