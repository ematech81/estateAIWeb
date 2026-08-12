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
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Your listings</h1>
        <Link
          href="/agent/listings/new"
          className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
        >
          + New listing
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {listings === null && !error && <p className="text-slate-600">Loading…</p>}

      {listings?.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center">
          <p className="mb-4 text-slate-600">
            You haven&apos;t listed a property yet. Describe one in your own words and let AI
            structure it for you.
          </p>
          <Link
            href="/agent/listings/new"
            className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
          >
            Create your first listing
          </Link>
        </div>
      )}

      {listings && listings.length > 0 && (
        <ul className="flex flex-col gap-3">
          {listings.map((listing) => (
            <li key={listing._id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">{listing.title}</h2>
                <StatusBadge status={listing.status} />
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {listing.location.city}
                {listing.location.district ? `, ${listing.location.district}` : ''} ·{' '}
                {listing.price.currency} {listing.price.amount.toLocaleString()} / {listing.price.period}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: Property['status'] }) {
  const styles: Record<Property['status'], string> = {
    draft: 'bg-slate-100 text-slate-700',
    pending_review: 'bg-amber-100 text-amber-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
