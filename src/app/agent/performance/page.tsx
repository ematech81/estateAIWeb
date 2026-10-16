'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiClientError, type PerformanceReport } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AgentLayout } from '@/components/layout/AgentLayout';
import { PageLoader } from '@/components/ui/PageLoader';
import { MetricCard } from '@/components/ui/MetricCard';
import { ViewsOverTimeChart } from '@/components/analytics/ViewsOverTimeChart';

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

export default function AgentPerformancePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [days, setDays] = useState<Range>(30);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    let cancelled = false;
    setReport(null);
    setError(null);
    api
      .getMyPerformance(days)
      .then((r) => !cancelled && setReport(r))
      .catch(
        (err) =>
          !cancelled &&
          setError(err instanceof ApiClientError ? err.message : 'Could not load your performance stats.'),
      );
    return () => {
      cancelled = true;
    };
  }, [isLoading, isAuthenticated, router, days]);

  const contactRate =
    report && report.totals.views > 0 ? Math.round((report.totals.contactReveals / report.totals.views) * 100) : null;

  return (
    <AgentLayout>
      <div className="mx-auto max-w-container-max space-y-stack-lg px-margin-mobile py-stack-lg md:px-gutter">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="headline-lg-mobile md:headline-lg font-bold text-primary">Performance</h1>
            <p className="body-md mt-1 text-on-surface-variant">
              How visitors are engaging with your listings. Visitors don&apos;t need an account, so these are
              anonymous counts.
            </p>
          </div>
          <div className="flex gap-1 rounded-lg border border-border-gray-200 bg-surface-container-lowest p-1" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDays(r)}
                aria-pressed={days === r}
                className={`label-md rounded px-3 py-1 transition-colors ${
                  days === r ? 'bg-trust-blue-900 text-white' : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {r} days
              </button>
            ))}
          </div>
        </div>

        {error && <p className="body-md text-error">{error}</p>}
        {!report && !error && <PageLoader label="Loading your performance…" />}

        {report && (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-gutter">
              <MetricCard icon="visibility" label="Views" value={report.totals.views} />
              <MetricCard icon="groups" label="Unique visitors" value={report.totals.uniqueVisitors} />
              <MetricCard icon="touch_app" label="Contact clicks" value={report.totals.contactClicks} />
              <MetricCard icon="contact_phone" label="Contact details viewed" value={report.totals.contactReveals} />
            </div>

            {contactRate != null && (
              <p className="body-md text-on-surface-variant">
                In the last {report.days} days,{' '}
                <span className="font-bold text-on-surface">{contactRate}%</span> of views ended with a visitor
                viewing your contact details.
              </p>
            )}

            <div className="rounded-xl border border-border-gray-200 bg-surface-container-lowest p-6">
              <h2 className="headline-md mb-1 font-bold text-on-surface">Views over time</h2>
              <p className="label-sm mb-4 text-on-surface-variant">Per day, last {report.days} days.</p>
              <ViewsOverTimeChart data={report.daily} />
            </div>

            <div className="rounded-xl border border-border-gray-200 bg-surface-container-lowest p-6">
              <h2 className="headline-md mb-4 font-bold text-on-surface">By listing</h2>
              {report.listings.length === 0 ? (
                <p className="body-md text-on-surface-variant">
                  You have no listings yet.{' '}
                  <Link href="/agent/listings/new" className="underline">
                    Add your first listing
                  </Link>{' '}
                  and its numbers will show up here.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left">
                    <thead>
                      <tr className="label-sm border-b border-border-gray-200 text-on-surface-variant">
                        <th className="py-2 pr-4 font-medium">Listing</th>
                        <th className="px-2 py-2 text-right font-medium">Views</th>
                        <th className="px-2 py-2 text-right font-medium">Visitors</th>
                        <th className="px-2 py-2 text-right font-medium">Contact clicks</th>
                        <th className="py-2 pl-2 text-right font-medium">Details viewed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.listings.map((l) => (
                        <tr key={l.id} className="border-b border-border-gray-200 last:border-0">
                          <td className="py-3 pr-4">
                            <Link href={`/properties/${l.id}`} className="body-md font-semibold text-on-surface hover:underline">
                              {l.title}
                            </Link>
                            <p className="label-sm text-on-surface-variant">
                              {l.city}
                              {l.status === 'inactive'
                                ? ` · ${l.unavailableReason === 'sold' || l.unavailableReason === 'rented' || l.unavailableReason === 'removed' ? l.unavailableReason : 'unavailable'}`
                                : l.status !== 'active'
                                  ? ` · ${l.status.replace('_', ' ')}`
                                  : ''}
                            </p>
                          </td>
                          <td className="body-md px-2 py-3 text-right font-bold text-on-surface">{l.views}</td>
                          <td className="body-md px-2 py-3 text-right text-on-surface">{l.uniqueVisitors}</td>
                          <td className="body-md px-2 py-3 text-right text-on-surface">{l.contactClicks}</td>
                          <td className="body-md py-3 pl-2 text-right text-on-surface">{l.contactReveals}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-surface-container-low p-6">
              <h2 className="label-md mb-2 font-bold text-on-surface">How these are counted</h2>
              <ul className="label-md list-disc space-y-1 pl-5 text-on-surface-variant">
                <li>
                  <strong>View</strong> — someone opened your listing&apos;s details page, whether from the
                  &ldquo;Details&rdquo; button, the &ldquo;Contact the Agent&rdquo; button, or a shared link.
                </li>
                <li>
                  <strong>Contact click</strong> — they clicked &ldquo;Contact the Agent&rdquo; on the details page.
                </li>
                <li>
                  <strong>Details viewed</strong> — they accepted the notice and were shown your name, phone and
                  email.
                </li>
                <li>
                  Repeat actions by the same visitor within 30 minutes count once, and your own visits to your
                  listings are not counted.
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </AgentLayout>
  );
}
