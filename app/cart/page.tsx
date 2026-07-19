import type { Metadata } from 'next';
import CartPage from './_client';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'Your FreshLock shopping cart.',
  alternates: { canonical: '/cart' },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CartPage />;
}
