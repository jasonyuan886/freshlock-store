import type { Metadata } from 'next';
import CheckoutPage from './_client';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your FreshLock order.',
  alternates: { canonical: '/checkout' },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CheckoutPage />;
}
