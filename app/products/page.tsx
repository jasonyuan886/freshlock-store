import type { Metadata } from 'next';
import { products } from '@/lib/data';
import ProductsClient from './ProductsClient';

export const metadata: Metadata = {
  title: 'Shop Handheld Vacuum Sealers & BPA-Free Vacuum Bags',
  description:
    'The FreshLock vacuum sealer keeps meat, veggies & leftovers fresh 5x longer. BPA-free bags, one-touch sealing, whisper-quiet. Free shipping over $49.',
  alternates: {
    canonical: '/products',
    languages: {
      'en-US': 'https://www.freshlocksealer.com/products',
      'ja-JP': 'https://jp.freshlocksealer.com/products',
      'x-default': 'https://www.freshlocksealer.com/products',
    },
  },
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
