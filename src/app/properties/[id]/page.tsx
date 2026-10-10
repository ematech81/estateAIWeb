import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { ContactAgentButton } from '@/components/property/ContactAgentButton';
import { getPublishedListingById } from '@/lib/publicPropertyApi';
import type { PublicProperty } from '@/types/property';

type Params = Promise<{ id: string }>;

// Truncated so a long listing title doesn't blow out the breadcrumb row.
function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const listing = await getPublishedListingById(id);
  if (!listing) {
    return { title: 'Property not found | EstateAI' };
  }

  const description = listing.description.slice(0, 160);
  return {
    title: `${listing.title} | EstateAI`,
    description,
    alternates: { canonical: `/properties/${listing._id}` },
    openGraph: {
      title: listing.title,
      description,
      type: 'website',
      images: listing.media[0] ? [listing.media[0]] : undefined,
    },
    // The one place "Google search appearance" (a Premium-only feature per
    // the pricing tiers) actually becomes real, not just a sort order —
    // Free/Basic listings are explicitly told not to be indexed.
    robots: listing.googleIndexable ? undefined : { index: false, follow: false },
  };
}

export default async function PropertyDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  // Next dedupes identical fetch() calls made during the same request, so
  // this and generateMetadata's fetch above don't cost two real network
  // round-trips to the API.
  const listing = await getPublishedListingById(id);
  if (!listing) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="container-app flex-grow py-stack-lg">
        <Breadcrumb items={[{ label: 'Discover', href: '/' }, { label: truncate(listing.title, 60) }]} />

        <div className="grid grid-cols-1 gap-stack-lg lg:grid-cols-3">
          <div className="flex flex-col gap-stack-md lg:col-span-2">
            <PropertyGallery media={listing.media} title={listing.title} />

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                {listing.agentVerified && (
                  <span className="badge-verified">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Verified Listing
                  </span>
                )}
                {listing.featured && (
                  <span className="badge-verified !border-tertiary-container !text-tertiary-container">
                    <span className="material-symbols-outlined text-[16px]">star</span>
                    Promoted
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
            <ContactAgentButton propertyId={listing._id} />
          </div>
        </div>
      </main>

      <Footer />
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
