import Link from 'next/link';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import type { PublicProperty } from '@/types/property';

// Shared by the homepage search grid and the agent-detail page's "their
// listings" grid — one card definition so both stay visually consistent.
export function PropertyCard({ listing }: { listing: PublicProperty }) {
  const specs: string[] = [];
  if (listing.specifications.bedrooms != null) specs.push(`${listing.specifications.bedrooms} Beds`);
  if (listing.specifications.bathrooms != null) specs.push(`${listing.specifications.bathrooms} Baths`);
  if (listing.specifications.sizeSqm != null) specs.push(`${listing.specifications.sizeSqm} sqm`);

  return (
    <article className="card-property group flex flex-col">
      <div className="relative">
        <ImageCarousel images={listing.media} alt={listing.title} className="aspect-video w-full" />
        <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {listing.agentVerified && (
            <div className="flex items-center gap-1 rounded-full border border-growth-emerald-500 bg-surface-container-lowest/90 px-3 py-1 backdrop-blur-sm">
              <span className="material-symbols-outlined text-[16px] text-growth-emerald-500">verified</span>
              <span className="label-sm text-trust-blue-900">Verified Listing</span>
            </div>
          )}
          {listing.featured && (
            <div className="flex items-center gap-1 rounded-full border border-tertiary-container bg-surface-container-lowest/90 px-3 py-1 backdrop-blur-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary-container">star</span>
              <span className="label-sm text-trust-blue-900">Promoted</span>
            </div>
          )}
        </div>
        {listing.location.country !== 'Nigeria' && (
          <div className="badge-international absolute right-3 top-3 z-10 backdrop-blur-sm">
            <span className="material-symbols-outlined text-[16px]">public</span>
            International
          </div>
        )}
      </div>

      <div className="flex flex-grow flex-col p-5">
        <h3 className="mb-2 text-[20px] font-bold text-trust-blue-900">
          {listing.price.currency} {listing.price.amount.toLocaleString()}{' '}
          <span className="label-sm font-normal text-on-surface-variant">
            / {listing.price.period.replace('_', ' ')}
          </span>
        </h3>
        <p className="label-md mb-1 font-semibold text-on-surface">{listing.title}</p>
        <p className="label-sm mb-4 flex items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          {listing.location.city}
          {listing.location.district ? `, ${listing.location.district}` : ''}
          {listing.location.state ? `, ${listing.location.state}` : ''}
        </p>

        {specs.length > 0 && (
          <div className="label-sm mb-5 flex flex-wrap items-center gap-4 border-t border-border-gray-200 pt-3 text-on-surface-variant">
            {specs.map((spec) => (
              <span key={spec}>{spec}</span>
            ))}
          </div>
        )}

        <div className="mt-auto flex gap-2">
          <Link
            href={`/properties/${listing._id}`}
            className="flex-1 rounded border border-border-gray-200 bg-surface-gray-50 py-2 text-center text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
          >
            Details
          </Link>
          <Link href={`/properties/${listing._id}`} className="btn-secondary flex-1">
            Contact Agent
          </Link>
        </div>
      </div>
    </article>
  );
}
