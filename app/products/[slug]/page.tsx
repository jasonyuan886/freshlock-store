import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { products, reviews } from '@/lib/data';
import { generateProductSchema, generateBreadcrumbSchema, SITE_URL } from '@/lib/schema';
import AddToCartClient from './AddToCartClient';
import BundleAddons from './BundleAddons';
import ProductGallery from './ProductGallery';
import Image from 'next/image';

type Params = { slug: string };

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) return {};
  const url = `${SITE_URL}/products/${product.slug}`;
  const seoTitles: Record<string, string> = {
    'freshlock-pro': 'FreshLock Pro | Best Handheld Vacuum Sealer Australia for Liquids, Marinades & Fish',
    'freshlock-starter-kit': 'FreshLock Starter Kit | Handheld Vacuum Sealer + 30 Bags Bundle Australia',
    'vacuum-seal-bags-30-pack': 'FreshLock Vacuum Seal Bags 30-Pack | Reusable Zipper Bags (26×28 cm)',
    'vacuum-seal-bags-50-pack': 'FreshLock Vacuum Seal Bags 50-Pack | Reusable Zipper Bags (26×34 cm)',
  };
  const title = seoTitles[product.slug] || `${product.name} | FreshLock Australia`;
  const description = product.shortDescription + ' Free shipping over A$99. 30-day money-back guarantee.';
  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      url,
      title: `${product.name} - Handheld Vacuum Sealer`,
      description,
      images: product.images.map((src) => ({
        url: src,
        width: 1200,
        height: 630,
        alt: product.name,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.image],
    },
  };
}

export default function ProductDetailPage({ params }: { params: Params }) {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) return notFound();

  // Tailored cross-sell: sealer → bags; bags → sealer + other bag; kits → bags
  let related;
  if (product.slug === 'freshlock-pro') {
    related = products.filter((p) => p.category === 'bags');
  } else if (product.category === 'bags') {
    const sealer = products.find((x) => x.slug === 'freshlock-pro');
    const otherBag = products.find((x) => x.category === 'bags' && x.slug !== product.slug);
    related = [sealer, otherBag].filter(Boolean) as typeof products;
  } else {
    related = products.filter((x) => x.slug !== product.slug && x.category === product.category).slice(0, 2);
  }
  const relatedHeading = product.slug === 'freshlock-pro' ? 'Complete Your Setup' : 'You May Also Need';

  const productSchema = generateProductSchema(product, reviews);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: product.name, url: `/products/${product.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'How long does food stay fresh with a vacuum sealer?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'When used with FreshLock vacuum zipper bags, food stays fresh 3–5× longer in the fridge and up to 6 months in the freezer compared with ordinary storage. Vacuum sealing removes up to 95% of the air, slowing oxidation and freezer burn.'
              }
            },
            {
              '@type': 'Question',
              name: 'Does FreshLock use heat sealing?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'No. FreshLock is a pump-style handheld vacuum sealer that extracts air through a one-way valve on reusable zipper bags. There is no heat bar — sealing is achieved by vacuum pressure only.'
              }
            },
            {
              '@type': 'Question',
              name: 'Is the battery rechargeable?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. FreshLock Pro charges via USB-C in about 2 hours and delivers 40+ seals on a full charge.'
              }
            },
            {
              '@type': 'Question',
              name: 'Are FreshLock vacuum bags reusable?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. FreshLock bags use a double-track green zipper slider so you can wash and re-seal them many times. For raw meat or fish use a fresh bag each time; dry goods bags can be reused extensively.'
              }
            }
          ]
        }) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center">
            <li><Link href="/" className="hover:text-primary">Home</Link></li>
            <li className="mx-2" aria-hidden="true">/</li>
            <li><Link href="/products" className="hover:text-primary">Products</Link></li>
            <li className="mx-2" aria-hidden="true">/</li>
            <li className="text-gray-900" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <article className="grid md:grid-cols-2 gap-12" itemScope itemType="https://schema.org/Product">
          {/* Images */}
          <ProductGallery
            images={product.images && product.images.length > 0 ? product.images : [product.image]}
            productName={product.name}
            shortDescription={product.shortDescription}
          />

          {/* Info */}
          <section>
            {product.badge && (
              <span className="inline-block bg-accent/10 text-accent text-sm font-semibold px-3 py-1 rounded-full mb-3">
                {product.badge}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4 leading-tight" itemProp="name">{product.name}</h1>
            <p className="text-2xl sm:text-3xl font-bold text-accent mb-6" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <meta itemProp="priceCurrency" content="AUD" />
              <meta itemProp="price" content={String(product.price)} />
              <meta itemProp="availability" content="https://schema.org/InStock" />
              A${product.price.toFixed(2)}
            </p>
            <p className="text-gray-600 text-base leading-relaxed mb-6 sm:mb-8" itemProp="description">{product.description}</p>

            {/* Features */}
            <section className="mb-8">
              <h2 className="font-semibold text-primary mb-3 text-lg">Key Features</h2>
              <ul className="space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-gray-600 text-sm">
                    <span className="text-accent mt-0.5" aria-hidden="true">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </section>

            <AddToCartClient product={product} />

            <BundleAddons product={product} />

            {/* Specs */}
            <section className="bg-gray-50 rounded-xl p-6 mt-6">
              <h2 className="font-semibold text-primary mb-3 text-lg">Specifications</h2>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key}>
                    <dt className="text-gray-500">{key}</dt>
                    <dd className="font-medium text-gray-900">{val}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Q&A for SEO + GEO */}
            <section className="mt-8">
              <h2 className="font-semibold text-primary mb-3 text-lg">Common Questions</h2>
              <div className="space-y-4 text-sm text-gray-600">
                <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <h3 className="font-semibold text-gray-800" itemProp="name">How long does food stay fresh with a vacuum sealer?</h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p className="leading-relaxed" itemProp="text">When used with FreshLock vacuum zipper bags, food stays fresh 3–5× longer in the fridge and up to 6 months in the freezer compared with ordinary zipper bags or cling wrap. Vacuum sealing removes up to 95% of the air, slowing oxidation and freezer burn.</p>
                  </div>
                </div>
                <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <h3 className="font-semibold text-gray-800" itemProp="name">Does FreshLock use heat sealing?</h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p className="leading-relaxed" itemProp="text">No. FreshLock is a pump-style handheld vacuum sealer that extracts air through a one-way valve on reusable zipper bags. There is no heat bar — sealing is achieved by vacuum pressure only, making it safe, simple, and bag-reusable.</p>
                  </div>
                </div>
                <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <h3 className="font-semibold text-gray-800" itemProp="name">Is the battery rechargeable?</h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p className="leading-relaxed" itemProp="text">Yes. FreshLock Pro charges via USB-C in about 2 hours and delivers 40+ seals on a full charge, enough for multiple days of everyday kitchen use.</p>
                  </div>
                </div>
                <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <h3 className="font-semibold text-gray-800" itemProp="name">Are FreshLock vacuum bags reusable?</h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p className="leading-relaxed" itemProp="text">Yes. FreshLock bags use a double-track green zipper slider so you can open, wash, and re-seal them many times. For raw meat or fish we recommend a fresh bag each time; for dry goods like coffee, rice, pasta, or snacks, bags can be reused extensively.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Trust badges */}
            <div className="mt-6 space-y-2" aria-label="Trust badges">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 rounded-full px-3 py-1.5 text-sm">🚚 Tracked Shipping 7–12 days</span>
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 rounded-full px-3 py-1.5 text-sm">🔒 Secure Checkout</span>
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 rounded-full px-3 py-1.5 text-sm">↩️ 30-Day Money Back</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500 rounded-full px-3 py-1.5 text-xs">💳 Apple Pay</span>
                <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500 rounded-full px-3 py-1.5 text-xs">Google Pay</span>
                <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500 rounded-full px-3 py-1.5 text-xs">VISA</span>
                <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500 rounded-full px-3 py-1.5 text-xs">Mastercard</span>
                <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-400 rounded-full px-3 py-1.5 text-xs">Afterpay coming soon</span>
              </div>
            </div>
          </section>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-12 sm:mt-20" aria-labelledby="related-heading">
            <h2 id="related-heading" className="section-title mb-8">{relatedHeading}</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition flex"
                >
                  <Image src={p.image}
                    alt={`${p.name} - ${p.shortDescription}`}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-l-xl flex-shrink-0"
                    width={128}
                    height={128}
                    loading="lazy" />
                  <div className="p-3 sm:p-4 flex-1 min-w-0">
                    <h3 className="font-bold text-primary mb-1 text-sm sm:text-base leading-snug line-clamp-2">{p.name}</h3>
                    <p className="text-accent font-bold">A${p.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
