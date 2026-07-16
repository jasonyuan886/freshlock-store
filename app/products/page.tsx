import type { Metadata } from 'next';
import { products } from '@/lib/data';
import ProductsClient from './ProductsClient';

export const metadata: Metadata = {
  title: 'Shop Handheld Vacuum Sealers & Vacuum Bags',
  description:
    'Shop FreshLock handheld vacuum sealers, starter kits and reusable vacuum seal bags. Cordless, one-touch operation. Free shipping on orders over $79 AUD.',
  alternates: { canonical: '/products' },
};

const itemListSchema = {
  '@context': 'https://schema.org/',
  '@type': 'ItemList',
  itemListElement: products.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `https://www.freshlocksealer.com/products/${p.slug}`,
    name: p.name,
    image: `https://www.freshlocksealer.com${p.image}`,
  })),
};

export default function ProductsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <ProductsClient />
    </>
  );
}
