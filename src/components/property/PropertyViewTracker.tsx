'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api';

// Renders nothing — records one "view" when the property details page opens,
// which is where both the card's "Details" and "Contact the Agent" buttons
// land (and where a shared direct link lands too). The server ignores repeat
// views from the same visitor within 30 minutes, so refreshes don't inflate it.
export function PropertyViewTracker({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    api.trackEvent(propertyId, 'view');
  }, [propertyId]);
  return null;
}
