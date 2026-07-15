export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="section-title">About FreshLock</h1>
        <p className="section-subtitle">
          We started with a simple mission: help Australian households waste less food and save money.
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Our Story</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            FreshLock was born in a kitchen in Melbourne, where our founders noticed how much fresh food was going to waste each week. Despite buying quality produce, meats, and leftovers, things seemed to spoil before they could be enjoyed.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            After researching commercial vacuum sealing technology, we realised the same science could be made accessible for everyday homes — without the bulk, the cords, or the complexity. The result was FreshLock: a handheld, cordless vacuum sealer that anyone can use.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Today, FreshLock is trusted by over 10,000 Australian households. From busy families batch-cooking on weekends, to campers keeping food fresh on the road, our products are designed to make freshness simple.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: '🌱', title: 'Reduce Waste', text: 'The average Australian household throws away $2,000–$2,500 of food per year. Vacuum sealing helps change that.' },
            { icon: '🇦🇺', title: 'Australian Made', text: 'Designed and tested in Australia for Australian conditions. We understand local kitchens.' },
            { icon: '♻️', title: 'Sustainability', text: 'Our bags are recyclable and our packaging is plastic-free. We are committed to reducing our footprint.' },
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
              <span><strong>Free shipping</strong> on all orders over $79 Australia-wide.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">✓</span>
              <span><strong>Real human support</strong> — email us anytime and we will get back to you within 24 hours.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">✓</span>
              <span><strong>Quality you can trust</strong> — every product is tested and backed by a minimum 1-year warranty.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
