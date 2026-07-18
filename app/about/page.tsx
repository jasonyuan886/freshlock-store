export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="section-title">About FreshLock</h1>
        <p className="section-subtitle">
          Helping households worldwide waste less food, save money, and eat fresher — one vacuum-sealed bag at a time.
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Our Story</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            FreshLock started with a simple observation: too much good food goes to waste. From weeknight leftovers and bulk-cooked meals to seasonal produce and marinating meats, people were throwing away perfectly good food because it spoiled before they could enjoy it — even in the fridge or freezer.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            Traditional vacuum sealers were bulky, corded, and relied on heat bars that burned bags and complicated the process. We set out to build something simpler: a compact, cordless, handheld vacuum pump that pairs with reusable valve-equipped bags. Just press the pump onto the valve, tap a button, and watch the air disappear in seconds — no heat, no fuss, no wasted bags.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Today FreshLock is used by thousands of households across the world. From busy parents batch-cooking on weekends, to campers keeping food fresh on the road, to home cooks stretching their grocery budget — FreshLock makes freshness simple, one-touch, and accessible to everyone.
          </p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Our Product</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            The FreshLock handheld vacuum sealer is designed to sit beautifully on your kitchen benchtop and work reliably every day:
          </p>
          <ul className="space-y-2 text-gray-600 list-disc pl-6">
            <li><strong>Cream-white tapered body</strong> with a soft matte finish and diamond-quilted grip pattern — ergonomic and fingerprint-resistant.</li>
            <li><strong>Brushed silver top cap</strong> with three vertically arranged one-touch buttons (vacuum / seal & stop / release) so you always know what you're pressing.</li>
            <li><strong>Transparent water-collection cup</strong> with a silver accent ring that protects the pump from moisture and is easy to clean.</li>
            <li><strong>USB-C rechargeable</strong> with a long-lasting battery — no power cord on your bench.</li>
            <li>Pair it with our <strong>textured transparent vacuum seal bags</strong> featuring a bright green zip closure and white circular air valve — reusable, BPA-free, and designed for the FreshLock pump.</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-4">
            <em>Please note: FreshLock is an air-suction (pump) vacuum system — it does not use a heat bar or heat-sealing element. Air is extracted through the valve on our bags, and the bag is sealed by the reusable zip closure.</em>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: '🌱', title: 'Reduce Food Waste', text: 'The average household throws away hundreds of dollars of food each year. Vacuum sealing extends fridge, freezer and pantry life by up to 5×.' },
            { icon: '🌍', title: 'Worldwide Shipping', text: 'We ship globally from our fulfilment centres. Orders over A$99 enjoy FREE standard shipping to Australia & NZ. Express 3-5 days also available.' },
            { icon: '♻️', title: 'Reusable & Practical', text: 'Our zip-closure vacuum bags are reusable again and again. Minimal packaging, real everyday use.' },
          ].map((v) => (
            <div key={v.title} className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="text-4xl mb-3">{v.icon}</div>
              <h3 className="font-bold text-primary mb-2">{v.title}</h3>
              <p className="text-gray-600 text-sm">{v.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-primary mb-4">Our Promise</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">✓</span>
              <span><strong>30-day satisfaction guarantee</strong> — not happy, send it back for a full refund.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">✓</span>
              <span><strong>FREE standard shipping</strong> on all orders over A$99 to Australia & New Zealand.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">✓</span>
              <span><strong>Real human support</strong> — email us anytime at support@freshlocksealer.com and we will reply within 24 hours.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">✓</span>
              <span><strong>1-year manufacturer warranty</strong> — every product is tested and backed by our dedicated support team.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
