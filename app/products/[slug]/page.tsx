import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { products, reviews } from '@/lib/data';
import { generateProductSchema, generateBreadcrumbSchema, SITE_URL } from '@/lib/schema';
import AddToCartClient from './AddToCartClient';
import Image from 'next/image';

type Params = { slug: string };

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) return {};
  const url = `${SITE_URL}/products/${product.slug}`;
  const title = product.name;
  const description = product.shortDescription + ' Free shipping over $79 AUD. 30-day money-back guarantee.';
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

  const related = products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 2);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <section>
            <div className="rounded-xl overflow-hidden bg-white shadow mb-4">
              <Image src={product.images[0] || product.image}
                alt={`${product.name} — ${product.shortDescription}`}
                className="w-full aspect-square object-cover"
                itemProp="image"
                width={600}
                height={600}
                priority
                sizes="(max-width: 768px) 100vw, 600px" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3" role="list">
                {product.images.slice(1).map((img, i) => (
                  <div key={i} role="listitem">
                    <Image src={img}
                      alt={`${product.name} — alternate view ${i + 2}`}
                      className="w-20 h-20 rounded-lg object-cover border-2 border-transparent"
                      loading="lazy"
                      width={80}
                      height={80} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Info */}
          <section>
            {product.badge && (
              <span className="inline-block bg-accent/10 text-accent text-sm font-semibold px-3 py-1 rounded-full mb-3">
                {product.badge}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4" itemProp="name">{product.name}</h1>
            <p className="text-3xl font-bold text-accent mb-6" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <meta itemProp="priceCurrency" content="AUD" />
              <meta itemProp="price" content={String(product.price)} />
              <meta itemProp="availability" content="https://schema.org/InStock" />
              ${product.price.toFixed(2)}{' '}
              <span className="text-sm text-gray-400 font-normal">AUD</span>
            </p>
            <p className="text-gray-600 leading-relaxed mb-8" itemProp="description">{product.description}</p>

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

            {/* Specs */}
            <section className="bg-gray-50 rounded-xl p-6 mt-6">
              <h2 className="font-semibold text-primary mb-3 text-lg">Specifications</h2>
              <dl className="grid grid-cols-2 gap-2 text-sm">
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
            <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-500" aria-label="Trust badges">
              <span>🚚 Free shipping over $79</span>
              <span>↩️ 30-day returns</span>
              <span>🔒 Secure checkout</span>
            </div>
          </section>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20" aria-labelledby="related-heading">
            <h2 id="related-heading" className="section-title mb-8">You May Also Like</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition flex"
                >
                  <Image src={p.image}
                    alt={`${p.name} - ${p.shortDescription}`}
                    className="w-32 h-32 object-cover"
                    width={128}
                    height={128}
                    loading="lazy" />
                  <div className="p-4">
                    <h3 className="font-bold text-primary mb-1">{p.name}</h3>
                    <p className="text-accent font-bold">${p.price.toFixed(2)} AUD</p>
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
