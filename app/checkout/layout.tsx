import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout — FreshLock Pro',
  description:
    'Complete your FreshLock order securely with PayPal. Free US shipping on orders over $89, 30-day money-back guarantee.',
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
