'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageLoader } from '@/components/ui/PageLoader';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { api, ApiClientError } from '@/lib/api';
import type { PublicProperty } from '@/types/property';

// Truncated so a long listing title doesn't blow out the breadcrumb row.
function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const [listing, setListing] = useState<PublicProperty | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.getListing(params.id);
        if (!cancelled) setListing(res.listing);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiClientError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(err instanceof ApiClientError ? err.message : 'Could not load this property.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="container-app flex-grow py-stack-lg">
        <Breadcrumb
          items={[
            { label: 'Discover', href: '/' },
            ...(listing ? [{ label: truncate(listing.title, 60) }] : []),
          ]}
        />

        {!listing && !notFound && !error && <PageLoader label="Loading property…" />}

        {notFound && (
          <div className="elevation-1 mx-auto max-w-xl rounded-lg p-10 text-center">
            <p className="body-md text-on-surface-variant">
              This listing isn&apos;t available — it may have been removed or the link is incorrect.
            </p>
          </div>
        )}

        {error && (
          <div className="elevation-1 mx-auto max-w-xl rounded-lg p-10 text-center">
            <p className="body-md text-error">{error}</p>
          </div>
        )}

        {listing && (
          <div className="grid grid-cols-1 gap-stack-lg lg:grid-cols-3">
            <div className="flex flex-col gap-stack-md lg:col-span-2">
              <Gallery media={listing.media} title={listing.title} />

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  {listing.agentVerified && (
                    <span className="badge-verified">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      Verified Listing
                    </span>
                  )}
                  <span className="badge-pending capitalize">{listing.listingType}</span>
                </div>
                <h1 className="headline-lg text-trust-blue-900">
                  {listing.price.currency} {listing.price.amount.toLocaleString()}
                  <span className="label-md font-normal text-on-surface-variant">
                    {' '}
                    / {listing.price.period.replace('_', ' ')}
                  </span>
                </h1>
                <p className="label-md mt-1 text-on-surface">{listing.title}</p>
                <p className="label-sm mt-1 flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {listing.location.city}
                  {listing.location.district ? `, ${listing.location.district}` : ''}
                  {listing.location.state ? `, ${listing.location.state}` : ''}
                </p>
              </div>

              <SpecsRow listing={listing} />

              <div>
                <h2 className="headline-md mb-2 text-on-surface">Description</h2>
                <p className="body-md whitespace-pre-line text-on-surface-variant">{listing.description}</p>
              </div>

              {listing.specifications.amenities.length > 0 && (
                <div>
                  <h2 className="headline-md mb-2 text-on-surface">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.specifications.amenities.map((a) => (
                      <span key={a} className="badge-international">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <ContactAgentForm propertyId={listing._id} />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function Gallery({ media, title }: { media: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const hasPhotos = media.length > 0;

  return (
    <div className="flex flex-col gap-stack-sm">
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-surface-container">
        {hasPhotos ? (
          // eslint-disable-next-line @next/next/no-img-element -- agent-uploaded photos, not from a next/image-configured domain
          <img src={media[active]} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px]">image</span>
          </div>
        )}
      </div>
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {media.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              className={
                i === active
                  ? 'h-16 w-16 shrink-0 overflow-hidden rounded border-2 border-trust-blue-900'
                  : 'h-16 w-16 shrink-0 overflow-hidden rounded border border-border-gray-200 opacity-70'
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SpecsRow({ listing }: { listing: PublicProperty }) {
  const specs: string[] = [];
  if (listing.specifications.bedrooms != null) specs.push(`${listing.specifications.bedrooms} Beds`);
  if (listing.specifications.bathrooms != null) specs.push(`${listing.specifications.bathrooms} Baths`);
  if (listing.specifications.sizeSqm != null) specs.push(`${listing.specifications.sizeSqm} sqm`);
  if (specs.length === 0) return null;

  return (
    <div className="label-md flex flex-wrap gap-6 border-y border-border-gray-200 py-stack-sm text-on-surface-variant">
      {specs.map((s) => (
        <span key={s}>{s}</span>
      ))}
    </div>
  );
}

function ContactAgentForm({ propertyId }: { propertyId: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.submitLead(propertyId, { name, email, phone: phone || undefined, message: message || undefined });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="elevation-1 rounded-xl p-stack-lg text-center">
        <span className="material-symbols-outlined text-[32px] text-growth-emerald-500">check_circle</span>
        <p className="body-md mt-2 text-on-surface">
          Your message has been sent. The agent will get back to you directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="elevation-1 flex flex-col gap-stack-sm rounded-xl p-stack-lg">
      <h2 className="headline-md text-on-surface">Contact Agent</h2>
      <p className="body-md mb-1 text-on-surface-variant">
        Interested in this property? Send a message and the agent will reach out.
      </p>

      <label className="label-md flex flex-col gap-1 text-on-surface-variant">
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input-standard"
        />
      </label>
      <label className="label-md flex flex-col gap-1 text-on-surface-variant">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-standard"
        />
      </label>
      <label className="label-md flex flex-col gap-1 text-on-surface-variant">
        Phone (optional)
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-standard" />
      </label>
      <label className="label-md flex flex-col gap-1 text-on-surface-variant">
        Message (optional)
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="input-standard"
        />
      </label>

      {error && <p className="body-md text-error">{error}</p>}

      <LoadingButton type="submit" loading={submitting} loadingText="Sending…" variant="secondary" className="mt-1">
        Send Message
      </LoadingButton>
    </form>
  );
}
