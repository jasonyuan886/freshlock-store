import { Product } from '@/lib/types';

export function generateProductSchema(product: Product) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.images || [product.image],
    description: product.description,
    sku: product.slug,
    brand: {
      '@type': 'Brand',
      name: 'FreshLock',
    },
    offers: {
      '@type': 'Offer',
      url: `https://freshlocksealer.com/products/${product.slug}`,
      priceCurrency: 'AUD',
      price: product.price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Organization',
    name: 'FreshLock Australia',
    url: 'https://freshlocksealer.com',
    logo: 'https://freshlocksealer.com/logo.svg',
    description: 'Australia\'s leading handheld vacuum sealer brand. Keep food fresh up to 5× longer.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AU',
    },
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
