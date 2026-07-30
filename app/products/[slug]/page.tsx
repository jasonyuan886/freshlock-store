import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { products, reviews as allReviews, FREE_SHIPPING_THRESHOLD, ratingDistribution } from '@/lib/data';
import { generateProductSchema, generateBreadcrumbSchema, SITE_URL } from '@/lib/schema';
import AddToCartClient from './AddToCartClient';
import Image from 'next/image';
import PriceDisplay from '@/components/PriceDisplay';

type Params = { slug: string };

function StickyMobileATC({ product }: { product: { name: string; price: number; compareAtPrice?: number; discountBadge?: string; slug: string } }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40 px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 truncate">{product.name}</div>
        <div className="flex items-baseline gap-2">
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">${product.compareAtPrice.toFixed(2)}</span>
          )}
          <span className="text-accent font-bold">${product.price.toFixed(2)}</span>
          {product.discountBadge && (
            <span className="text-[10px] bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded-full border border-red-200">
              {product.discountBadge}
            </span>
          )}
        </div>
      </div>
      <a href="#purchase" className="btn-primary text-sm px-5 py-2 whitespace-nowrap">
        Add to Cart
      </a>
    </div>
  );
}

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) return {};
  const title = `${product.name} — Prevent Freezer Burn, BPA-Free | FreshLock`;
  const description =
    `${product.shortDescription} Free US shipping over $${FREE_SHIPPING_THRESHOLD}. 60-day returns, 2-year warranty on the unit.`;
  return {
    title,
    description,
    alternates: {
      canonical: `/products/${product.slug}`,
      languages: {
        'en-US': `https://www.freshlocksealer.com/products/${product.slug}`,
        'ja-JP': `https://jp.freshlocksealer.com/products/${product.slug}`,
        'x-default': `https://www.freshlocksealer.com/products/${product.slug}`,
      },
    },
    openGraph: {
      url: `${SITE_URL}/products/${product.slug}`,
      title,
      description,
      images: product.images.map((src) => ({
        url: src,
        width: 1200,
        height: 630,
        alt: `${product.name} — ${product.shortDescription}`,
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

function StarRating({ rating, size = 'text-base' }: { rating: number; size?: string }) {
  return (
    <span className={`text-accent ${size}`} aria-label={`Rated ${rating} out of 5`}>
      {'★'.repeat(rating)}
      <span className="text-gray-300">{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

function ReviewsSection() {
  const avg = (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1);
  const total = allReviews.length;
  return (
    <section id="reviews" className="mt-16 border-t pt-12" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-2xl font-bold text-primary mb-6">Customer Reviews</h2>

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold text-primary">{avg}</div>
          <div className="flex justify-center md:justify-start mt-1"><StarRating rating={Math.round(Number(avg))} /></div>
          <p className="text-sm text-gray-500 mt-1">{total} verified reviews</p>
        </div>
        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = (ratingDistribution as Record<number, number>)[star] || 0;
            const pct = total ? (count / total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-10 text-gray-600">{star} ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-gray-500">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {allReviews.map((r) => (
          <article key={r.name + r.date} className="bg-white border rounded-xl p-5" itemScope itemType="https://schema.org/Review">
            <div itemProp="itemReviewed" itemScope itemType="https://schema.org/Product">
              <meta itemProp="name" content="FreshLock Pro Handheld Vacuum Sealer" />
            </div>
            <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
              <meta itemProp="ratingValue" content={String(r.rating)} />
              <meta itemProp="bestRating" content="5" />
              <meta itemProp="worstRating" content="1" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <StarRating rating={r.rating} size="text-sm" />
              {r.verified && (
                <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">✓ Verified Buyer</span>
              )}
            </div>
            <p className="text-gray-700 text-sm mb-3" itemProp="reviewBody">&ldquo;{r.text}&rdquo;</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-semibold text-primary" itemProp="author" itemScope itemType="https://schema.org/Person">
                <span itemProp="name">{r.name}</span>
              </span>
              <time dateTime={r.date}>
                {new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            </div>
            {r.images && r.images.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {r.images.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`Review photo by ${r.name}`}
                    loading="lazy"
                    className="w-20 h-20 object-cover rounded border border-gray-200"
                  />
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a
          href="mailto:freshlocksealer@gmail.com?subject=FreshLock%20Product%20Review&body=Hi%20FreshLock%2C%0A%0AI'd%20like%20to%20leave%20a%20review%20of%20my%20FreshLock%20Pro..."
          className="inline-block btn-secondary"
        >
          ✍️ Write a Review
        </a>
        <p className="text-xs text-gray-500 mt-2">Reviews are from verified buyers. We do not pay for positive reviews.</p>
      </div>
    </section>
  );
}

export default function ProductDetailPage({ params }: { params: Params }) {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) return notFound();

  const related = products
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);

  const productSchema = generateProductSchema(product, allReviews);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: product.name, url: `/products/${product.slug}` },
  ]);

  const pdpFaqs = [
    {
      q: 'How do I stop freezer burn?',
      a: 'Freezer burn is caused by air reaching the food surface. FreshLock removes up to 95% of the air from the bag and the one-way valve keeps it out — dramatically reducing freezer burn on meat, fish, bread, and produce.',
    },
    {
      q: 'Is the battery rechargeable and how long does it last?',
      a: 'Yes. The 1200 mAh Li-ion battery charges via USB-C (cable included) in about 2.5 hours and delivers 80–100 seals on a full charge — enough for multiple weeks of normal kitchen use.',
    },
    {
      q: 'Can I seal soups, marinades, and juicy foods?',
      a: 'Yes. The detachable transparent drip tray under the nozzle catches liquid overflow before it can reach the motor. For very wet foods we recommend sealing with the bag held upright or pre-freezing for 30 minutes.',
    },
    {
      q: 'Do I have to buy special FreshLock bags forever?',
      a: 'No. FreshLock is compatible with most embossed valve bags (90 μm or thicker PA+PE film with a standard one-way air valve). You can use any brand that fits.',
    },
    {
      q: 'What does the warranty cover?',
      a: '2-year warranty on the main sealer unit, 6-month on accessories (cable, starter bags). Contact support@freshlocksealer.com for warranty claims.',
    },
  ];

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
          mainEntity: pdpFaqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ATF Trust badges */}
        <div className="flex flex-wrap gap-3 mb-6 text-sm" aria-label="Trust badges">
          <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold">🚚 Free Shipping ${FREE_SHIPPING_THRESHOLD}+</span>
          {product.badge === 'Best Value' || product.slug.includes('kit') ? (
            <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full text-xs font-semibold">🎁 Ships FREE</span>
          ) : null}
          <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold">↩️ 60-Day Returns</span>
          <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold">🛡️ 2-Year Warranty</span>
          <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold">🔒 Secure SSL Checkout</span>
        </div>

        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center">
            <li><Link href="/" className="hover:text-primary">Home</Link></li>
            <li className="mx-2" aria-hidden="true">/</li>
            <li><Link href="/products" className="hover:text-primary">Products</Link></li>
            <li className="mx-2" aria-hidden="true">/</li>
            <li className="text-gray-900" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <article className="grid md:grid-cols-2 gap-12" itemScope itemType="https://schema.org/Product">
          <section>
            <div className="rounded-xl overflow-hidden bg-white shadow mb-4">
              <Image src={product.images[0] || product.image}
                alt={`${product.name} — ${product.shortDescription}`}
                className="w-full aspect-square object-cover"
                itemProp="image"
                width={800}
                height={800}
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

          <section>
            {product.badge && (
              <span className="inline-block bg-accent/10 text-accent text-sm font-semibold px-3 py-1 rounded-full mb-3">
                {product.badge}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3" itemProp="name">{product.name}</h1>

            {/* Mini rating */}
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={5} size="text-sm" />
              <span className="text-sm text-gray-500">{allReviews.length} verified reviews</span>
            </div>

            <div itemProp="offers" itemScope itemType="https://schema.org/Offer" className="mb-6">
              <meta itemProp="priceCurrency" content="USD" />
              <meta itemProp="price" content={String(product.price)} />
              <meta itemProp="availability" content="https://schema.org/InStock" />
              <PriceDisplay
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                discountBadge={product.discountBadge}
                size="lg"
              />
            </div>
            <p className="text-gray-600 leading-relaxed mb-8" itemProp="description">{product.description}</p>

            <section className="mb-8">
              <h2 className="font-semibold text-primary mb-3 text-lg">Key Features</h2>
              <ul className="space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-gray-700 text-sm">
                    <span className="text-accent mt-0.5" aria-hidden="true">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </section>

            <div id="purchase"><AddToCartClient product={product} /></div>

            <div className="flex flex-wrap gap-4 mt-6 text-xs text-gray-500">
              <span>🚚 Free US shipping over ${FREE_SHIPPING_THRESHOLD}</span>
              <span>↩️ 60-day hassle-free returns</span>
              <span>🛡️ 2-year warranty</span>
              <span>🔒 Secure SSL checkout</span>
            </div>

            {/* Specs */}
            <section className="bg-gray-50 rounded-xl p-6 mt-6">
              <h2 className="font-semibold text-primary mb-3 text-lg">Specifications</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex flex-col border-b border-gray-200 py-1.5">
                    <dt className="text-gray-500 text-xs uppercase tracking-wide">{key}</dt>
                    <dd className="font-medium text-gray-900 mt-0.5">{val}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mt-8">
              <h2 className="font-semibold text-primary mb-3 text-lg">Common Questions</h2>
              <div className="space-y-4 text-sm text-gray-600">
                {pdpFaqs.map((f) => (
                  <div key={f.q} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                    <h3 className="font-semibold text-gray-800" itemProp="name">{f.q}</h3>
                    <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                      <p className="leading-relaxed mt-1" itemProp="text">{f.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              {['BPA-free', 'FCC / CE / RoHS', 'Food-safe materials', 'USB-C', 'Detachable drip tray'].map((b) => (
                <span key={b} className="bg-gray-100 text-gray-700 px-2 py-1 rounded">{b}</span>
              ))}
            </div>
          </section>
        </article>

        <ReviewsSection />

        {related.length > 0 && (
          <section className="mt-16" aria-labelledby="related-heading">
            <h2 id="related-heading" className="section-title mb-8">You May Also Like</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition"
                >
                  <Image src={p.image}
                    alt={`${p.name} — ${p.shortDescription}`}
                    className="w-full aspect-square object-cover"
                    width={400}
                    height={400}
                    loading="lazy" />
                  <div className="p-4">
                    <h3 className="font-bold text-primary mb-1">{p.name}</h3>
                    <p className="text-gray-500 text-xs line-clamp-2 mb-2">{p.shortDescription}</p>
                    <PriceDisplay
                      price={p.price}
                      compareAtPrice={p.compareAtPrice}
                      discountBadge={p.discountBadge}
                      size="sm"
                      showCurrencyLabel
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      <StickyMobileATC product={product} />
      <div className="md:hidden h-20" />
    </>
  );
}
