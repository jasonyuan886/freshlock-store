import Link from 'next/link';
import { products, reviews, faqs } from '@/lib/data';

/* ───────── Hero ───────── */
function Hero() {
  return (
    <section className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-accent/20 text-accent text-sm font-semibold px-3 py-1 rounded-full mb-4">
              🇦🇺 Australia's #1 Handheld Sealer
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Seal in Freshness.<br />
              <span className="text-accent">Seal in Flavour.</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-lg">
              The FreshLock handheld vacuum sealer keeps your food fresh up to 5× longer — cordless,
              one-touch, and built for Australian kitchens.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="btn-primary text-lg">
                Shop Now
              </Link>
              <Link href="#features" className="btn-outline border-white text-white hover:bg-white hover:text-primary text-lg">
                Learn More
              </Link>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <img
              src="https://placehold.co/500x500/2A4A7F/white?text=FreshLock+Pro"
              alt="FreshLock Pro handheld vacuum sealer"
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Features ───────── */
const featureList = [
  {
    icon: '🛡️',
    title: 'Fresh 5× Longer',
    text: 'Powerful vacuum removes 95% of air, locking out oxidation and bacteria. Your food stays fresh for weeks, not days.',
  },
  {
    icon: '📦',
    title: 'Save Space',
    text: 'Vacuum-sealed bags stack neatly in your fridge, freezer or pantry. Reclaim up to 40% more storage space.',
  },
  {
    icon: '👆',
    title: 'One-Touch Simple',
    text: 'No complicated settings. Load the bag, press the button, done. Anyone in the family can use it.',
  },
  {
    icon: '🔋',
    title: 'Cordless & Portable',
    text: 'USB-C rechargeable with 40+ seals per charge. Take it to the BBQ, camping, or on the road.',
  },
];

function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="section-title">Why FreshLock?</h2>
          <p className="section-subtitle">
            Designed for real Australian kitchens — simple, powerful, and built to last.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featureList.map((f) => (
            <div
              key={f.title}
              className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-primary mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Product Showcase ───────── */
function ProductShowcase() {
  const featured = products.slice(0, 4);
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="section-title">Our Products</h2>
          <p className="section-subtitle">
            From everyday kitchen use to on-the-go freshness — we have you covered.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map((p) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition"
            >
              <div className="relative overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full aspect-square object-cover group-hover:scale-105 transition duration-300"
                />
                {p.badge && (
                  <span className="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-primary mb-1">{p.name}</h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{p.shortDescription}</p>
                <p className="text-xl font-bold text-accent">${p.price.toFixed(2)} AUD</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/products" className="btn-secondary">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────── Social Proof Bar ───────── */
function SocialProof() {
  return (
    <section className="py-12 bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ['10,000+', 'Happy Customers'],
            ['4.8 ★', 'Average Rating'],
            ['Free', 'Shipping over $79'],
            ['30-Day', 'Money-Back Guarantee'],
          ].map(([stat, label]) => (
            <div key={label}>
              <p className="text-3xl font-bold text-accent">{stat}</p>
              <p className="text-sm text-gray-300 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Reviews ───────── */
function Reviews() {
  const topReviews = reviews.slice(0, 3);
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">
            Join thousands of Australians who have transformed their food storage.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {topReviews.map((r) => (
            <div key={r.name} className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-3">
                {'★'.repeat(r.rating)}
                <span className="ml-1 text-gray-400 text-sm">{r.rating}/5</span>
              </div>
              <p className="text-gray-700 mb-4 italic">&ldquo;{r.text}&rdquo;</p>
              <p className="font-semibold text-primary text-sm">{r.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── FAQ Preview ───────── */
function FaqPreview() {
  const preview = faqs.slice(0, 4);
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-6">
          {preview.map((f) => (
            <details key={f.question} className="bg-white rounded-xl p-6 shadow-sm group">
              <summary className="font-semibold text-primary cursor-pointer list-none flex justify-between items-center">
                {f.question}
                <span className="ml-4 text-accent group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/faq" className="text-primary font-semibold hover:underline">
            View all FAQs →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────── CTA ───────── */
function Cta() {
  return (
    <section className="py-20 bg-primary text-white text-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Keep Your Food Fresh?
        </h2>
        <p className="text-gray-300 mb-8 text-lg">
          Join 10,000+ Australian households. Free shipping on orders over $79.
        </p>
        <Link href="/products" className="btn-primary text-lg">
          Shop FreshLock Now
        </Link>
      </div>
    </section>
  );
}

/* ───────── Page ───────── */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <ProductShowcase />
      <SocialProof />
      <Reviews />
      <FaqPreview />
      <Cta />
    </>
  );
}
