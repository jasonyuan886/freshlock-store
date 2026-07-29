import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Cart | FreshLock',
  description:
    'Review your FreshLock cart before checkout. Free US shipping over $50, 60-day returns, and a 2-year warranty on every sealer.',
  robots: { index: false, follow: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
