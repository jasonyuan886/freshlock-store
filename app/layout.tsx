import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/lib/cart-context';
import { generateOrganizationSchema, generateWebsiteSchema, SITE_URL } from '@/lib/schema';

const siteName = 'FreshLock';
const title = 'FreshLock — Handheld Vacuum Sealer | Keep Food Fresh 5× Longer';
const description =
  'FreshLock cordless handheld vacuum sealer keeps food fresh up to 5× longer with one-touch sealing. Includes reusable vacuum seal bags, USB-C rechargeable. Free shipping on orders over $79. 30-day guarantee.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: `%s | ${siteName}`,
  },
  description,
  keywords:
    'handheld vacuum sealer, vacuum sealer, portable vacuum sealer, cordless vacuum sealer, food vacuum sealer, vacuum seal bags, reusable vacuum bags, food storage, meal prep, food preservation, FreshLock, kitchen gadget',
  applicationName: siteName,
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
  alternates: {
    canonical: '/',
    languages: {
      'en': 'https://www.freshlocksealer.com',
      'ja': 'https://jp.freshlocksealer.com',
      'x-default': 'https://www.freshlocksealer.com',
    },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName,
    title,
    description,
    locale: 'en_US',
    images: [
      {
        url: '/images/products/sealer-main.jpg',
        width: 1200,
        height: 630,
        alt: 'FreshLock handheld vacuum sealer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/images/products/sealer-main.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const orgSchema = generateOrganizationSchema();
const websiteSchema = generateWebsiteSchema();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
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
