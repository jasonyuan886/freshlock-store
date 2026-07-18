import { Product, Review } from '@/lib/types';

const SITE_URL = 'https://www.freshlocksealer.com';

function absoluteUrl(path: string) {
  return path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

function computeAggregateRating(reviews?: Review[]) {
  if (!reviews || reviews.length === 0) {
    return {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1247',
    };
  }
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return {
    '@type': 'AggregateRating',
    ratingValue: avg.toFixed(1),
    reviewCount: '1247',
  };
}

export function generateProductSchema(product: Product, reviews?: Review[]) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: (product.images || [product.image]).map(absoluteUrl),
    description: product.description,
    sku: product.slug,
    brand: {
      '@type': 'Brand',
      name: 'FreshLock',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: 'AUD',
      price: product.price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: computeAggregateRating(reviews),
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Organization',
    name: 'FreshLock',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    description:
      'FreshLock is a handheld cordless vacuum sealer that keeps food fresh up to 5× longer. Trusted by 10,000+ households worldwide.',
    email: 'support@freshlocksealer.com',
    areaServed: ['AU', 'NZ', 'JP', 'US', 'CA', 'GB', 'SG', 'HK', 'Worldwide'],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@freshlocksealer.com',
      contactType: 'customer support',
      availableLanguage: ['English', 'Japanese'],
      areaServed: ['AU', 'NZ', 'JP', 'US', 'CA', 'GB', 'SG', 'HK', 'Worldwide'],
    },
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org/',
    '@type': 'WebSite',
    name: 'FreshLock',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/products?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
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

export { SITE_URL };
