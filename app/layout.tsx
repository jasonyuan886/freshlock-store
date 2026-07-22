import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/lib/cart-context';
import { generateOrganizationSchema, generateWebsiteSchema, SITE_URL } from '@/lib/schema';

const siteName = 'FreshLock';
const title = 'FreshLock Pro | Best Handheld Vacuum Sealer Australia for Liquids, Marinades & Fish';
const description =
  'FreshLock Pro cordless handheld vacuum sealer vacuums liquids, marinades, sauces and fish without motor damage thanks to a mechanical auto-drain cup. Every bag has an attached apple-green zip-slider (no lost clips). Reusable vacuum seal bags, USB-C rechargeable, one-touch. Free shipping Australia on orders over A$99. 30-day money-back guarantee.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: `%s | ${siteName}`,
  },
  description,
  keywords:
    'handheld vacuum sealer, best handheld vacuum sealer australia, vacuum sealer for liquids, vacuum seal marinades, vacuum seal fish, portable cordless vacuum sealer, food vacuum sealer, vacuum seal bags with zip slider, reusable vacuum bags, meal prep vacuum sealer, food storage, freezer burn prevention, sous vide vacuum sealer, FreshLock Pro',
  applicationName: siteName,
  icons: {
    icon: [{ url: '/favicon.ico', sizes: '32x32' }, { url: '/logo.svg', type: 'image/svg+xml' }],
    apple: '/logo.svg',
  },
  alternates: {
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
  verification: {
    google: 's5k1bV4GOf6JitkZAj0KewRM2B2TgAO5N_6aDIZ59cM',
  },
};

const orgSchema = generateOrganizationSchema();
const websiteSchema = generateWebsiteSchema();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-N16R0F2B1Y" strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-N16R0F2B1Y');
          `}
        </Script>
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
