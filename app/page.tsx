import Link from 'next/link';
import { products, reviews, faqs } from '@/lib/data';
import { generateFAQSchema } from '@/lib/schema';

const faqSchema = generateFAQSchema(faqs);

/* ───────── Hero ───────── */
function Hero() {
  return (
    <section className="bg-primary text-white" aria-labelledby="hero-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-accent/20 text-accent text-sm font-semibold px-3 py-1 rounded-full mb-4">
              🌍 Trusted in 10,000+ Kitchens Worldwide
            </span>
            <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Seal in Freshness.<br />
              <span className="text-accent">Seal in Flavour.</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-lg">
              The FreshLock <strong>handheld vacuum sealer</strong> keeps your food fresh up to 5× longer — cordless, one-touch, and built for everyday use at home, work, or outdoors.
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
              src="/images/products/sealer-main.jpg"
              alt="FreshLock Pro cordless handheld vacuum sealer with vacuum seal bags"
              className="rounded-2xl shadow-2xl"
              width={600}
              height={600}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── About / Brand ───────── */
function AboutFreshLock() {
  return (
    <section id="about" className="py-20 bg-white" aria-labelledby="about-heading">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-10">
          <h2 id="about-heading" className="section-title">About FreshLock</h2>
        </header>
        <article className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
          <p>
            <strong>FreshLock</strong> is a cordless handheld vacuum sealer designed for real people who love food and hate waste. Our mission is simple: <em>make freshness effortless</em>. Whether you&apos;re meal prepping on Sundays, storing leftovers, marinating meat, or keeping coffee and snacks crisp on a camping trip, FreshLock delivers commercial-grade vacuum sealing in the palm of your hand.
          </p>
          <p>
            Unlike bulky countertop sealers, the FreshLock Pro works with reusable zipper bags fitted with a one-way air valve — no heat bar, no learning curve, no fumbling. Press one button, and a 5 L/min pump removes 95% of the air in seconds, locking out oxygen, moisture, and freezer burn.
          </p>
          <p>
            From busy parents in the US to campers in Australia and home cooks across the UK and Canada, over 10,000 households now rely on FreshLock to keep their food tasting fresher for longer.
          </p>
        </article>
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
    text: 'USB-C rechargeable with 40+ seals per charge — compact enough for kitchen, pantry, travel or BBQ use.',
  },
];

function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 id="features-heading" className="section-title">Why FreshLock?</h2>
          <p className="section-subtitle">
            Simple, powerful, and built to last — everything you need in a handheld vacuum sealer.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featureList.map((f) => (
            <article
              key={f.title}
              className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4" aria-hidden="true">{f.icon}</div>
              <h3 className="text-lg font-bold text-primary mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.text}</p>
            </article>
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
    <section className="py-20 bg-white" aria-labelledby="products-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 id="products-heading" className="section-title">Our Products</h2>
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
                  alt={`${p.name} - ${p.shortDescription}`}
                  className="w-full aspect-square object-cover group-hover:scale-105 transition duration-300"
                  width={400}
                  height={400}
                  loading="lazy"
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

/* ───────── Social Proof ───────── */
function SocialProof() {
  return (
    <section className="py-12 bg-primary text-white" aria-label="Social proof stats">
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
    <section className="py-20 bg-gray-50" aria-labelledby="reviews-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 id="reviews-heading" className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">
            Join thousands of households worldwide who have transformed their food storage.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {topReviews.map((r) => (
            <article key={r.name} className="bg-white rounded-xl p-6 shadow-sm" itemScope itemType="https://schema.org/Review">
              <div className="flex items-center mb-3" aria-label={`Rated ${r.rating} out of 5`}>
                {'★'.repeat(r.rating)}
                <span className="ml-1 text-gray-400 text-sm">{r.rating}/5</span>
              </div>
              <p className="text-gray-700 mb-4 italic" itemProp="reviewBody">&ldquo;{r.text}&rdquo;</p>
              <p className="font-semibold text-primary text-sm" itemProp="author">{r.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── GEO Q&A Block ───────── */
const qaItems = [
  {
    q: 'How long does food stay fresh with FreshLock?',
    a: 'Vacuum-sealed food stays fresh 3–5× longer in the fridge and up to 6 months in the freezer compared with regular zipper bags or cling wrap. By removing up to 95% of the air, FreshLock slows oxidation and bacterial growth that cause spoilage and freezer burn.',
  },
  {
    q: 'How does a handheld vacuum sealer work?',
    a: 'A handheld vacuum sealer like FreshLock uses a small but powerful pump to extract air from a specially designed zipper bag fitted with a one-way air valve. Place the sealer nozzle over the valve, press one button, and air is removed in seconds — the valve automatically locks to preserve the vacuum. No heat bar, no bulky chamber, no learning curve.',
  },
  {
    q: 'Are FreshLock vacuum bags reusable?',
    a: 'Yes. FreshLock bags use a double-track zipper with a green slider, so you can open and re-seal them many times. For raw meat, fish, or greasy foods we recommend using a fresh bag each time; for dry goods such as coffee, pasta, rice or snacks, bags can be washed and reused.',
  },
];

function QABlock() {
  return (
    <section className="py-20 bg-white" aria-labelledby="qa-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h2 id="qa-heading" className="section-title">Your Questions, Answered</h2>
          <p className="section-subtitle">Quick answers to the most common questions about FreshLock.</p>
        </header>
        <div className="space-y-6">
          {qaItems.map((item) => (
            <article key={item.q} className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-primary mb-2">{item.q}</h3>
              <p className="text-gray-600 leading-relaxed">{item.a}</p>
            </article>
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
    <section className="py-20 bg-gray-50" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 id="faq-heading" className="section-title">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-6">
          {preview.map((f) => (
            <details key={f.question} className="bg-white rounded-xl p-6 shadow-sm group">
              <summary className="font-semibold text-primary cursor-pointer list-none flex justify-between items-center">
                {f.question}
                <span className="ml-4 text-accent group-open:rotate-180 transition-transform" aria-hidden="true">
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
          Join 10,000+ households worldwide. Free shipping on orders over $79 AUD.
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Hero />
      <AboutFreshLock />
      <Features />
      <ProductShowcase />
      <SocialProof />
      <Reviews />
      <QABlock />
      <FaqPreview />
      <Cta />
    </>
  );
}
