import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/lib/cart-context';

export const metadata: Metadata = {
  title: 'FreshLock Australia — Handheld Vacuum Sealers',
  description:
    'Keep food fresh up to 5× longer with FreshLock handheld vacuum sealers. Free shipping Australia-wide on orders over $79. 30-day satisfaction guarantee.',
  keywords: 'vacuum sealer, handheld vacuum sealer, food storage, FreshLock, Australia',
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
