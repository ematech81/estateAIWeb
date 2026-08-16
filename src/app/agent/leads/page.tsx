'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AgentLayout } from '@/components/layout/AgentLayout';
import { PageLoader } from '@/components/ui/PageLoader';
import type { Lead, LeadStatus } from '@/types/lead';

const STATUSES: LeadStatus[] = ['new', 'contacted', 'closed'];

export default function AgentLeadsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    api
      .getMyLeads()
      .then((res) => setLeads(res.leads))
      .catch(() => setError('Could not load your leads. Please try logging in again.'));
  }, [isLoading, isAuthenticated, router]);

  async function handleStatusChange(id: string, status: LeadStatus) {
    const previous = leads;
    // Optimistic update — status changes are low-stakes and this is the
    // agent's own dashboard, not something that needs a confirm round-trip
    // before the UI reflects it.
    setLeads((prev) => prev?.map((l) => (l._id === id ? { ...l, status } : l)) ?? prev);
    try {
      await api.updateLeadStatus(id, status);
    } catch (err) {
      setLeads(previous);
      setError(err instanceof ApiClientError ? err.message : 'Could not update lead status.');
    }
  }

  return (
    <AgentLayout>
      <div className="container-app max-w-3xl py-12">
        <h1 className="headline-md mb-stack-lg text-on-surface">Leads</h1>

        {error && <p className="body-md mb-stack-md text-error">{error}</p>}

        {leads === null && !error && <PageLoader label="Loading your leads…" />}

        {leads?.length === 0 && (
          <div className="elevation-1 rounded-lg border-dashed p-10 text-center">
            <p className="body-md text-on-surface-variant">
              No leads yet — when someone contacts you about a listing, they&apos;ll show up here.
            </p>
          </div>
        )}

        {leads && leads.length > 0 && (
          <ul className="flex flex-col gap-stack-sm">
            {leads.map((lead) => (
              <li key={lead._id} className="card-property flex flex-col gap-stack-sm p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="body-md font-semibold text-on-surface">{lead.name}</p>
                    <p className="label-md text-on-surface-variant">
                      {typeof lead.property === 'object'
                        ? `${lead.property.title} · ${lead.property.location.city}`
                        : 'Listing'}
                    </p>
                  </div>
                  <StatusSelect status={lead.status} onChange={(s) => handleStatusChange(lead._id, s)} />
                </div>

                <div className="label-md flex flex-wrap gap-4 text-on-surface-variant">
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-trust-blue-900">
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                    {lead.email}
                  </a>
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-trust-blue-900">
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      {lead.phone}
                    </a>
                  )}
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {lead.message && <p className="body-md border-t border-border-gray-200 pt-2 text-on-surface">{lead.message}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AgentLayout>
  );
}

function StatusSelect({ status, onChange }: { status: LeadStatus; onChange: (s: LeadStatus) => void }) {
  const badgeClass: Record<LeadStatus, string> = {
    new: 'badge-action',
    contacted: 'badge-pending',
    closed: 'badge-verified',
  };
  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as LeadStatus)}
      className={`${badgeClass[status]} cursor-pointer border-none capitalize`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
