import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/lib/cart-context';

export const metadata: Metadata = {
  title: 'FreshLock Australia — Handheld Vacuum Sealers | Keep Food Fresh 5× Longer',
  description:
    'Australia\'s #1 handheld vacuum sealer. Keep food fresh up to 5× longer with FreshLock. Cordless, one-touch operation. Free shipping on orders over $79. 30-day guarantee.',
  keywords: 'vacuum sealer, handheld vacuum sealer, food storage, FreshLock, Australia, food preservation, vacuum bags, kitchen gadgets, meal prep, food freshness',
  openGraph: {
    title: 'FreshLock Australia — Handheld Vacuum Sealers',
    description: 'Keep food fresh up to 5× longer. Cordless, one-touch operation. Free shipping Australia-wide.',
    images: ['/images/products/sealer-main.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body className="flex flex-col min-h-screen">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
