'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { LoadingButton } from '@/components/ui/LoadingButton';

type Contact = { name: string; email: string; phone?: string; businessName?: string };
type Step = 'closed' | 'disclaimer' | 'details';

// Two-step contact flow: a "Contact the Agent" button opens a disclaimer
// (EstateAI only connects people, it isn't a party to the deal); only after
// "Continue" do we fetch and reveal the agent's details.
export function ContactAgentButton({ propertyId }: { propertyId: string }) {
  const [step, setStep] = useState<Step>('closed');
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = useCallback(() => {
    setStep('closed');
    setError(null);
  }, []);

  useEffect(() => {
    if (step === 'closed') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [step, close]);

  async function handleContinue() {
    setError(null);
    // Already fetched earlier in this visit — no need to hit the API again.
    if (contact) {
      setStep('details');
      return;
    }
    setLoading(true);
    try {
      const { contact: fetched } = await api.getListingContact(propertyId);
      setContact(fetched);
      setStep('details');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not load the agent’s details. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="elevation-1 flex flex-col gap-stack-sm rounded-xl p-stack-lg">
        <h2 className="headline-md text-on-surface">Interested in this property?</h2>
        <p className="body-md text-on-surface-variant">Get in touch with the agent directly to ask questions or arrange a viewing.</p>
        <button type="button" onClick={() => setStep('disclaimer')} className="btn-secondary mt-1">
          Contact the Agent
        </button>
      </div>

      {step !== 'closed' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-agent-title"
            className="w-full max-w-md rounded-xl bg-surface-container-lowest p-stack-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {step === 'disclaimer' && (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[28px] text-tertiary-container">info</span>
                  <h3 id="contact-agent-title" className="headline-md text-on-surface">
                    Before you continue
                  </h3>
                </div>
                <div className="body-md flex flex-col gap-3 text-on-surface-variant">
                  <p>
                    EstateAI is a platform that connects property owners and agents with prospective buyers and
                    tenants. We are not a party to any agreement, payment or transaction between you and the agent.
                  </p>
                  <p>
                    EstateAI is not responsible for the accuracy of listings or for anything that happens between you
                    and the agent, including payments, viewings and contracts. Please verify the property and the
                    agent’s identity yourself, and avoid paying any money before inspecting the property.
                  </p>
                </div>
                {error && <p className="body-md mt-3 text-error">{error}</p>}
                <div className="mt-stack-md flex gap-3">
                  <button
                    type="button"
                    onClick={close}
                    className="flex-1 rounded border border-border-gray-200 bg-surface-gray-50 py-2 text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    variant="secondary"
                    loading={loading}
                    loadingText="Loading…"
                    onClick={handleContinue}
                    className="flex-1"
                  >
                    Continue
                  </LoadingButton>
                </div>
              </>
            )}

            {step === 'details' && contact && (
              <>
                <h3 id="contact-agent-title" className="headline-md mb-1 text-on-surface">
                  Agent details
                </h3>
                <p className="body-md mb-stack-sm text-on-surface-variant">
                  Mention this property when you get in touch.
                </p>
                <dl className="flex flex-col gap-3">
                  <ContactRow icon="person" label="Name" value={contact.name} />
                  {contact.businessName && <ContactRow icon="business" label="Business" value={contact.businessName} />}
                  {contact.phone && (
                    <ContactRow icon="call" label="Phone" value={contact.phone} href={`tel:${contact.phone}`} />
                  )}
                  <ContactRow icon="mail" label="Email" value={contact.email} href={`mailto:${contact.email}`} />
                </dl>
                <button type="button" onClick={close} className="btn-secondary mt-stack-md w-full">
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ContactRow({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-[22px] text-on-surface-variant">{icon}</span>
      <div className="min-w-0">
        <dt className="label-sm text-on-surface-variant">{label}</dt>
        <dd className="body-md break-words text-on-surface">
          {href ? (
            <a href={href} className="underline">
              {value}
            </a>
          ) : (
            value
          )}
        </dd>
      </div>
    </div>
  );
}
