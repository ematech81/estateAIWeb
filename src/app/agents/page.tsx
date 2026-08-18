'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageLoader } from '@/components/ui/PageLoader';
import { Pagination } from '@/components/ui/Pagination';
import { api, ApiClientError } from '@/lib/api';
import type { PublicAgent } from '@/lib/api';

const PAGE_SIZE = 12;

// Public directory — deliberately no contact info (phone/email) on any
// agent card here; contact goes through a listing's lead-capture form, not
// this directory (Section 13.5: never expose sensitive info unnecessarily).
export default function AgentsPage() {
  const [agents, setAgents] = useState<PublicAgent[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAgents(targetPage: number) {
    setError(null);
    try {
      const res = await api.getAgents({ page: targetPage, limit: PAGE_SIZE });
      setAgents(res.agents);
      setPage(res.page);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not load agents right now.');
      setAgents([]);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="container-app flex-grow py-stack-lg">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <h1 className="headline-lg text-trust-blue-900">Agents &amp; Agencies</h1>
            <p className="body-md mt-1 text-on-surface-variant">
              Registered agents, agencies, and property owners listing on EstateAI.
            </p>
          </div>
          {agents && total > 0 && <span className="label-md text-on-surface-variant">{total} registered</span>}
        </div>

        {agents === null && <PageLoader label="Loading agents…" />}
        {error && <p className="body-md text-error">{error}</p>}

        {agents && agents.length === 0 && (
          <div className="elevation-1 rounded-lg p-10 text-center">
            <p className="body-md text-on-surface-variant">
              No agents registered yet — be the first.
            </p>
            <Link href="/register" className="btn-primary mt-stack-md inline-flex">
              Become an Agent
            </Link>
          </div>
        )}

        {agents && agents.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={fetchAgents} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

const VERIFICATION_BADGE: Record<PublicAgent['verificationStatus'], string> = {
  verified: 'badge-verified',
  pending: 'badge-pending',
  unverified: 'badge-pending',
};

function AgentCard({ agent }: { agent: PublicAgent }) {
  return (
    <Link href={`/agents/${agent.id}`} className="card-property flex flex-col gap-stack-sm p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-[28px] text-on-surface-variant">
            {agent.role === 'agency' ? 'apartment' : 'person'}
          </span>
          <div>
            <p className="label-md font-semibold text-on-surface">{agent.name}</p>
            {agent.businessName && <p className="label-sm text-on-surface-variant">{agent.businessName}</p>}
          </div>
        </div>
        {agent.verificationStatus === 'verified' && (
          <span className={VERIFICATION_BADGE[agent.verificationStatus]}>
            <span className="material-symbols-outlined text-[14px]">verified</span>
            Verified
          </span>
        )}
      </div>

      <div className="label-sm flex items-center justify-between border-t border-border-gray-200 pt-3 text-on-surface-variant">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          {agent.primaryLocation || 'Location not set'}
        </span>
        <span>
          {agent.activeListingCount} listing{agent.activeListingCount === 1 ? '' : 's'}
        </span>
      </div>
    </Link>
  );
}
