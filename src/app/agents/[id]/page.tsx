'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageLoader } from '@/components/ui/PageLoader';
import { Pagination } from '@/components/ui/Pagination';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PropertyCard } from '@/components/property/PropertyCard';
import { api, ApiClientError } from '@/lib/api';
import type { PublicAgent } from '@/lib/api';
import type { PublicProperty } from '@/types/property';

const PAGE_SIZE = 12;

const VERIFICATION_BADGE: Record<PublicAgent['verificationStatus'], string> = {
  verified: 'badge-verified',
  pending: 'badge-pending',
  unverified: 'badge-pending',
};

export default function AgentDetailPage() {
  const params = useParams<{ id: string }>();
  const [agent, setAgent] = useState<PublicAgent | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [listings, setListings] = useState<PublicProperty[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    api
      .getAgent(params.id)
      .then((res) => {
        if (!cancelled) setAgent(res.agent);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiClientError && err.status === 404) setNotFound(true);
        else setError(err instanceof ApiClientError ? err.message : 'Could not load this agent.');
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  useEffect(() => {
    if (!agent) return;
    fetchListings(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent]);

  async function fetchListings(targetPage: number) {
    const res = await api.searchListings({ agentId: params.id, page: targetPage, limit: PAGE_SIZE });
    setListings(res.listings);
    setPage(res.page);
    setTotalPages(res.totalPages);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="container-app flex-grow py-stack-lg">
        <Breadcrumb items={[{ label: 'Agents', href: '/agents' }, ...(agent ? [{ label: agent.name }] : [])]} />

        {!agent && !notFound && !error && <PageLoader label="Loading agent…" />}

        {notFound && (
          <div className="elevation-1 mx-auto max-w-xl rounded-lg p-10 text-center">
            <p className="body-md text-on-surface-variant">This agent isn&apos;t available.</p>
          </div>
        )}
        {error && (
          <div className="elevation-1 mx-auto max-w-xl rounded-lg p-10 text-center">
            <p className="body-md text-error">{error}</p>
          </div>
        )}

        {agent && (
          <>
            <div className="elevation-1 mb-stack-lg flex flex-col items-start gap-4 rounded-xl p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-[36px] text-on-surface-variant">
                  {agent.role === 'agency' ? 'apartment' : 'person'}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="headline-md text-trust-blue-900">{agent.name}</h1>
                    {agent.verificationStatus === 'verified' && (
                      <span className={VERIFICATION_BADGE[agent.verificationStatus]}>
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        Verified
                      </span>
                    )}
                  </div>
                  {agent.businessName && <p className="body-md text-on-surface-variant">{agent.businessName}</p>}
                  <p className="label-sm mt-1 flex items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    {agent.primaryLocation || 'Location not set'}
                  </p>
                </div>
              </div>
              <p className="label-md text-on-surface-variant">
                {agent.activeListingCount} active listing{agent.activeListingCount === 1 ? '' : 's'}
              </p>
            </div>

            <h2 className="headline-md mb-6 text-on-surface">Listings</h2>

            {listings === null && <PageLoader label="Loading listings…" />}

            {listings && listings.length === 0 && (
              <div className="elevation-1 rounded-lg p-10 text-center">
                <p className="body-md text-on-surface-variant">No active listings from this agent yet.</p>
              </div>
            )}

            {listings && listings.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {listings.map((listing) => (
                    <PropertyCard key={listing._id} listing={listing} />
                  ))}
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={fetchListings} />
              </>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
