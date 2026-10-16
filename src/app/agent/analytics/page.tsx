'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AgentLayout } from '@/components/layout/AgentLayout';
import { PageLoader } from '@/components/ui/PageLoader';
import { MetricCard } from '@/components/ui/MetricCard';
import { ListingsOverTimeChart } from '@/components/analytics/ListingsOverTimeChart';
import type { PropertyStatus } from '@/types/property';

interface Analytics {
  listingsByStatus: Record<string, number>;
  listingsByMonth: { month: string; count: number }[];
}

// Listing-inventory numbers, derived from Property documents the agent
// already owns. Visitor activity (views, contact clicks) lives on the
// Performance page.
const LISTING_STATUS_META: Record<PropertyStatus, { label: string; dotClassName: string }> = {
  draft: { label: 'Draft', dotClassName: 'bg-on-surface-variant/50' },
  pending_review: { label: 'Pending review', dotClassName: 'bg-tertiary-container' },
  active: { label: 'Active', dotClassName: 'bg-growth-emerald-500' },
  inactive: { label: 'Inactive', dotClassName: 'bg-error' },
};
const LISTING_STATUS_ORDER: PropertyStatus[] = ['draft', 'pending_review', 'active', 'inactive'];

export default function AgentAnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    api
      .getMyAnalytics()
      .then(setData)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : 'Could not load your analytics.'));
  }, [isLoading, isAuthenticated, router]);

  const totalListings = data ? Object.values(data.listingsByStatus).reduce((a, b) => a + b, 0) : null;
  const activeListings = data ? data.listingsByStatus.active ?? 0 : null;

  return (
    <AgentLayout>
      <div className="mx-auto max-w-container-max space-y-stack-lg px-margin-mobile py-stack-lg md:px-gutter">
        <div>
          <h1 className="headline-lg-mobile md:headline-lg font-bold text-primary">Analytics</h1>
          <p className="body-md mt-1 text-on-surface-variant">
            A real-time snapshot of your listings — nothing here is estimated.
          </p>
        </div>

        {error && <p className="body-md text-error">{error}</p>}
        {!data && !error && <PageLoader label="Loading your analytics…" />}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-4 md:gap-gutter">
              <MetricCard icon="real_estate_agent" label="Total Listings" value={totalListings} />
              <MetricCard icon="fiber_manual_record" label="Active Listings" value={activeListings} />
            </div>

            <StatusBreakdown
              title="Listings by status"
              order={LISTING_STATUS_ORDER}
              meta={LISTING_STATUS_META}
              counts={data.listingsByStatus}
            />

            <div className="rounded-xl border border-border-gray-200 bg-surface-container-lowest p-6">
              <h2 className="headline-md mb-1 font-bold text-on-surface">Listings created over time</h2>
              <p className="label-sm mb-4 text-on-surface-variant">By month, since your first listing.</p>
              <ListingsOverTimeChart data={data.listingsByMonth} />
            </div>
          </>
        )}
      </div>
    </AgentLayout>
  );
}

function StatusBreakdown<S extends string>({
  title,
  order,
  meta,
  counts,
}: {
  title: string;
  order: S[];
  meta: Record<S, { label: string; dotClassName: string }>;
  counts: Record<string, number>;
}) {
  const total = order.reduce((sum, status) => sum + (counts[status] ?? 0), 0);

  return (
    <div className="rounded-xl border border-border-gray-200 bg-surface-container-lowest p-6">
      <h2 className="headline-md mb-4 font-bold text-on-surface">{title}</h2>
      {total === 0 ? (
        <p className="body-md text-on-surface-variant">Nothing here yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {order.map((status) => {
            const count = counts[status] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <li key={status} className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta[status].dotClassName}`} />
                <span className="label-md flex-1 text-on-surface">{meta[status].label}</span>
                <span className="label-sm text-on-surface-variant">{pct}%</span>
                <span className="label-md w-8 text-right font-bold text-on-surface">{count}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
