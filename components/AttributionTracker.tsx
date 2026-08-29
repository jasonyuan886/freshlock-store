'use client';

import { useEffect } from 'react';
import { captureAttribution } from '@/lib/attribution';

// Mounted once in the root layout. Captures UTM/referrer first-touch
// attribution into localStorage on the first visit.
export default function AttributionTracker() {
  useEffect(() => {
    try {
      captureAttribution();
    } catch {
      // never break rendering
    }
  }, []);
  return null;
}
