'use client';

import { useEffect } from 'react';
import { trackViewItem } from '@/lib/ga4';

export default function TrackViewItem({ product }: {
  product: { slug: string; name: string; price: number; category?: string };
}) {
  useEffect(() => {
    trackViewItem(product);
  }, [product.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
