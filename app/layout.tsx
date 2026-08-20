import { headers } from 'next/headers';
import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FomoPurchaseNotification from '@/components/FomoPurchaseNotification';
import { CartProvider } from '@/lib/cart-context';
import { generateOrganizationSchema, generateWebsiteSchema, SITE_URL } from '@/lib/schema';

const siteName = 'FreshLock';
const title = 'FreshLock Handheld Vacuum Sealer — Stop Freezer Burn, Stay Fresh 5× Longer';
const description =
  'FreshLock vacuum sealers keep food fresh 5x longer. BPA-free, easy to use, and built for everyday kitchens. Free shipping on orders over $49. 30-day guarantee.';

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host') || 'www.freshlocksealer.com';
  const proto = h.get('x-forwarded-proto') || 'https';
  const canonicalUrl = `${proto}://${host}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    keywords:
      'handheld vacuum sealer, cordless vacuum sealer, portable vacuum sealer, food vacuum sealer, vacuum seal bags, reusable vacuum bags, BPA-free, USB-C, meal prep, freezer burn prevention, food storage, sous vide, FreshLock',
    applicationName: siteName,
    icons: {
      icon: '/favicon-32.png',
      apple: '/apple-touch-icon.png',
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
          alt: 'FreshLock Pro handheld vacuum sealer in pearl white with apple-green zip-slider bags',
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
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

const orgSchema = generateOrganizationSchema();
const websiteSchema = generateWebsiteSchema();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <head>
                                <meta name="p:domain_verify" content="35f8877a03378002c70a19e5750a86c4" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="alternate" hrefLang="en-US" href="https://www.freshlocksealer.com" />
        <link rel="alternate" hrefLang="ja-JP" href="https://jp.freshlocksealer.com" />
        <link rel="alternate" hrefLang="th-TH" href="https://th.freshlocksealer.com" />
        <link rel="alternate" hrefLang="x-default" href="https://www.freshlocksealer.com" />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-N16R0F2B1Y" strategy="lazyOnload" />
        <Script id="ga4-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-N16R0F2B1Y', { send_page_view: true });
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
          <FomoPurchaseNotification />
        </CartProvider>
      </body>
    </html>
  );
}

