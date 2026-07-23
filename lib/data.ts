import { Product, Review } from './types';

export const products: Product[] = [
  {
    slug: 'freshlock-pro',
    name: 'FreshLock Pro',
    price: 89.99,
    description:
      'The FreshLock Pro is our flagship handheld vacuum sealer, engineered for quick, cordless food preservation. Simply attach the nozzle to the valve on any FreshLock zipper bag, press one button, and the powerful motor extracts air in seconds — creating an airtight seal that keeps food fresh up to 5× longer. The mechanical auto-drain collection cup catches liquids so they never reach the motor, and the attached apple-green zip-slider means you never lose a clip. No heat bar, no complicated setup. USB-C rechargeable and fully portable, so you can seal at the bench, in the pantry, fridge, or even at the campsite.',
    shortDescription: 'Powerful handheld vacuum pump with auto-drain cup — cordless, rechargeable, one-touch.',
    image: '/images/products/sealer-main.jpg',
    images: [
      '/images/products/sealer-main.jpg',
      '/images/products/sealer-use.jpg',
      '/images/products/sealer-kit.jpg',
    ],
    features: [
      'Powerful -60 kPa suction — extracts air through the bag valve in seconds',
      'Mechanical auto-drain collection cup — liquids never reach the motor',
      'One-touch operation — no heat bar, no complicated settings',
      'Attached apple-green zip-slider — never lose a sealing clip',
      'Cordless & portable — use anywhere in the kitchen or outdoors',
      'USB-C rechargeable with long-lasting battery',
      'Easy to clean — collection cup and air channel rinse under tap',
      'Compact design — fits easily in a kitchen drawer',
    ],
    specs: {
      'Model': 'PVS-02',
      'Suction Power': '-60 kPa',
      'Battery': '1200 mAh Li-ion (USB-C rechargeable)',
      'Input': 'DC 5V / 1A, 5W',
      'Charge Time': '~2 hours',
      'Working Time': '~40 min per charge',
      'Noise Level': '< 60 dB',
      'Material': 'ABS + Food-grade Silicone, pearl white',
      'Dimensions': 'Φ48 × 195 mm',
      'Weight': '210 g (bare unit)',
      'Certifications': 'CE, RoHS, FCC',
      'Warranty': '2 years',
    },
    category: 'devices',
    badge: 'Best Seller',
  },
  {
    slug: 'freshlock-starter-kit',
    name: 'FreshLock Starter Kit',
    price: 109.99,
    description:
      'Everything you need to start sealing fresh, beautifully presented in a premium full-colour gift box. The Starter Kit bundles the FreshLock Pro handheld vacuum sealer with 30 premium vacuum zipper bags in three sizes (10 small, 10 medium, 10 large), so you can start preserving snacks, portions, and family meals straight out of the box. Premium gift-box packaging — presentation-ready, perfect as a gift.',
    shortDescription: 'FreshLock Pro + 30 vacuum zipper bags in 3 sizes — everything to get started.',
    image: '/images/products/sealer-kit.jpg',
    images: [
      '/images/products/sealer-kit.jpg',
      '/images/products/bags-small-1.jpg',
      '/images/products/bags-med-1.jpg',
      '/images/products/bags-lrg-1.jpg',
    ],
    features: [
      'Includes FreshLock Pro handheld sealer with -60 kPa suction',
      '30 × premium vacuum zipper bags (10 small + 10 medium + 10 large)',
      'Mechanical auto-drain collection cup protects the motor',
      'USB-C charging cable included',
      'Quick-start guide',
      'Premium full-colour gift box packaging',
      'Saves you $20 vs buying separately',
    ],
    specs: {
      'Model': 'PVS-02-SK30',
      'Includes': '1× FreshLock Pro (PVS-02), 10× Small Bags (22×21 cm), 10× Medium Bags (26×28 cm), 10× Large Bags (30×34 cm), 1× USB-C Cable, 1× Quick Start Guide',
      'Bag Sizes': 'Small 22×21 cm, Medium 26×28 cm, Large 30×34 cm',
      'Bag Material': '7-layer PA/PE co-extruded, 90–110 microns, BPA-free',
      'Temperature Range': '-20°C ~ 100°C (freezer, sous-vide, microwave-safe)',
      'Sealer Weight': '210 g (bare unit)',
      'Kit Total Weight': '~1 kg (gift box)',
      'Certifications': 'CE, RoHS, FCC',
      'Warranty': '2 years (sealer), bags are reusable & recyclable',
    },
    category: 'kits',
    badge: 'Best Value',
  },
  {
    slug: 'vacuum-seal-bags-25-pack',
    name: 'Vacuum Seal Bags — 25 Pack (Small)',
    price: 22.99,
    description:
      'Our smallest bag size, perfect for single portions, snacks, cheese slices, deli meats, fishing bait, and camping portions. At 22×21 cm these compact bags seal tight without wasting space — ideal for sous-vide single steaks, individual fish fillets, trail mix portions, or keeping bait fresh on the boat. Same premium 7-layer PA/PE construction, one-way air valve, and attached apple-green zip-slider that never gets lost — no more hunting for clips. Only A$0.92 per bag, 17% cheaper than ZeroPak.',
    shortDescription: '25 × small vacuum zipper bags (22×21 cm). Perfect for snacks, portions, bait & camping.',
    image: '/images/products/bags-small-1.jpg',
    images: [
      '/images/products/bags-small-1.jpg',
      '/images/products/bags-small-2.jpg',
      '/images/products/bags-small-3.jpg',
      '/images/products/bags-small-4.jpg',
      '/images/products/bags-small-5.jpg',
    ],
    features: [
      '7-layer PA/PE co-extruded film — maximum freshness & air barrier',
      'BPA-free & food-safe — FDA / EU food-grade compliant',
      'Built-in one-way air valve + attached apple-green zip-slider (never lose a clip)',
      'Pre-cut size: 22 × 21 cm — ideal for snacks, cheese, single portions, bait',
      'Embossed texture for fast air extraction',
      'Freezer, sous-vide & microwave safe (open zipper for microwave)',
      'Compatible with all FreshLock valve-type sealers',
      'Reusable & recyclable material',
      'Only A$0.92 per bag — 17% cheaper than ZeroPak NZ',
    ],
    specs: {
      'Model': 'VSB-S25',
      'Quantity': '25 bags',
      'Size': '22 × 21 cm (Small)',
      'Material': '7-layer PA/PE co-extruded, 90–110 microns, embossed texture, BPA-free',
      'Closure': 'Double-track zipper with attached apple-green slider',
      'Valve': 'One-way air valve with silicone seal',
      'Temperature Range': '-20°C ~ 100°C',
      'Food Contact': 'FDA / EU food-grade compliant',
      'Freezer / Sous-vide / Microwave Safe': 'Yes (open zipper for microwave)',
      'Reusable': 'Yes — wash & reuse for dry goods',
    },
    category: 'bags',
  },
  {
    slug: 'vacuum-seal-bags-30-pack',
    name: 'Vacuum Seal Bags — 30 Pack (Medium)',
    price: 29.99,
    description:
      'Our most versatile bag size, designed for everyday meal prep, portion control, cheese blocks, deli meats, and family side dishes. At 26×28 cm these medium bags handle everything from a couple of chicken breasts to a generous serving of roasted vegetables. Premium 7-layer PA/PE construction blocks air and moisture, the one-way valve works in seconds with your FreshLock Pro, and the attached apple-green zip-slider stays right on the bag — no lost clips, no frustration. Reusable, BPA-free, and safe for freezer, sous-vide, and microwave.',
    shortDescription: '30 × medium vacuum zipper bags (26×28 cm). Perfect for portions, cheese & meal prep.',
    image: '/images/products/bags-med-1.jpg',
    images: [
      '/images/products/bags-med-1.jpg',
      '/images/products/bags-med-2.jpg',
      '/images/products/bags-med-3.jpg',
    ],
    features: [
      '7-layer PA/PE co-extruded film — maximum freshness & air barrier',
      'BPA-free & food-safe — FDA / EU food-grade compliant',
      'Built-in one-way air valve + attached apple-green zip-slider (never lose a clip)',
      'Pre-cut size: 26 × 28 cm — ideal for portions, cheese, family sides, meal prep',
      'Embossed texture for fast air extraction',
      'Freezer, sous-vide & microwave safe (open zipper for microwave)',
      'Compatible with all FreshLock valve-type sealers',
      'Reusable & recyclable material',
    ],
    specs: {
      'Model': 'VSB-M30',
      'Quantity': '30 bags',
      'Size': '26 × 28 cm (Medium)',
      'Material': '7-layer PA/PE co-extruded, 90–110 microns, embossed texture, BPA-free',
      'Closure': 'Double-track zipper with attached apple-green slider',
      'Valve': 'One-way air valve with silicone seal',
      'Temperature Range': '-20°C ~ 100°C',
      'Food Contact': 'FDA / EU food-grade compliant',
      'Freezer / Sous-vide / Microwave Safe': 'Yes (open zipper for microwave)',
      'Reusable': 'Yes — wash & reuse for dry goods',
    },
    category: 'bags',
  },
  {
    slug: 'vacuum-seal-bags-50-pack',
    name: 'Vacuum Seal Bags — 50 Pack (Large)',
    price: 39.99,
    description:
      'Our best-value large bag — 50 bags at just A$0.80 each. At 30×34 cm these roomy bags handle family-size portions, whole cuts of meat, bulk vegetables, large fish fillets, and sous-vide cooking for two or more. Same premium 7-layer PA/PE construction, one-way air valve, and attached apple-green zip-slider as our smaller sizes — reliable, repeatable seals every time with your FreshLock Pro. Stock up and save: 50-pack is our most economical refill option.',
    shortDescription: '50 × large vacuum zipper bags (30×34 cm). Best value for bulk & family meals.',
    image: '/images/products/bags-lrg-1.jpg',
    images: [
      '/images/products/bags-lrg-1.jpg',
      '/images/products/bags-lrg-2.jpg',
      '/images/products/bags-lrg-3.jpg',
    ],
    features: [
      '7-layer PA/PE co-extruded film — maximum freshness & air barrier',
      'BPA-free & food-safe — FDA / EU food-grade compliant',
      'Built-in one-way air valve + attached apple-green zip-slider (never lose a clip)',
      'Pre-cut size: 30 × 34 cm — ideal for family meals, bulk buys, large cuts, sous-vide',
      'Embossed texture for fast air extraction',
      'Freezer, sous-vide & microwave safe (open zipper for microwave)',
      'Compatible with all FreshLock valve-type sealers',
      'Reusable & recyclable material',
      'Best per-bag value — only A$0.80 per bag',
    ],
    specs: {
      'Model': 'VSB-L50',
      'Quantity': '50 bags',
      'Size': '30 × 34 cm (Large)',
      'Material': '7-layer PA/PE co-extruded, 90–110 microns, embossed texture, BPA-free',
      'Closure': 'Double-track zipper with attached apple-green slider',
      'Valve': 'One-way air valve with silicone seal',
      'Temperature Range': '-20°C ~ 100°C',
      'Food Contact': 'FDA / EU food-grade compliant',
      'Freezer / Sous-vide / Microwave Safe': 'Yes (open zipper for microwave)',
      'Reusable': 'Yes — wash & reuse for dry goods',
    },
    category: 'bags',
    badge: 'Value Pack',
  },
];

export const reviews: Review[] = [
  {
    name: 'Sarah M.',
    rating: 5,
    text: 'Absolutely love my FreshLock Pro! I batch-cook every Sunday and the vacuum-sealed portions last so much longer in the fridge. Game changer for meal prep.',
    date: '2025-06-12',
  },
  {
    name: 'James T.',
    rating: 5,
    text: 'Bought the Starter Kit as a Christmas gift for my wife and she uses it every single day. The one-touch pump is so easy — even I can figure it out!',
    date: '2025-05-28',
  },
  {
    name: 'Priya K.',
    rating: 4,
    text: 'Great product. I use it for sous-vide cooking and the seal is always perfect. Only wish it came in more colours. Would definitely recommend.',
    date: '2025-05-15',
  },

  {
    name: 'Emma W.',
    rating: 5,
    text: 'Reduced our food waste by at least half. The bags are sturdy and the pump is powerful. Best kitchen purchase we have made in years.',
    date: '2025-04-18',
  },
  {
    name: 'Michael R.',
    rating: 4,
    text: 'Solid build quality and the USB-C charging is really convenient. Battery lasts for weeks on normal use. Happy customer.',
    date: '2025-03-22',
  },
];

export const faqs = [
  {
    question: 'How does the FreshLock vacuum sealer work?',
    answer:
      'Place your food in a FreshLock zipper bag, press the double-track zipper closed with the attached apple-green zip-slider, set the sealer nozzle over the white circular air valve, and press the one-touch button. The pump extracts air through the valve in seconds, and the one-way valve automatically locks to maintain an airtight seal. No heat bar, no complicated prep — it is that simple.',
  },
  {
    question: 'What makes FreshLock different from other handheld sealers?',
    answer:
      'Two key differences: (1) Our mechanical auto-drain collection cup catches any liquid drawn out during sealing, so juices and marinades never reach and damage the motor. Competitors without this feature burn out quickly when sealing moist foods. (2) Every bag comes with an attached apple-green zip-slider that stays on the bag — no more losing separate sealing clips.',
  },
  {
    question: 'How much longer does food stay fresh?',
    answer:
      'Vacuum sealing removes up to 95% of air from the bag, which slows oxidation and bacterial growth. In practice, vacuum-sealed food lasts 3–5× longer in the fridge and up to 6 months in the freezer compared to conventional zipper-bag or cling-wrap storage.',
  },
  {
    question: 'Are the bags reusable?',
    answer:
      'Yes! FreshLock bags feature a double-track zipper closure, so you can open and re-seal them multiple times. For raw meat, fish, or greasy foods we recommend using a fresh bag each time for hygiene. For dry goods (rice, pasta, coffee, snacks) you can wash and reuse bags many times.',
  },
  {
    question: 'Can I use FreshLock bags with other sealers?',
    answer:
      'FreshLock bags use a standard one-way air valve that works with most handheld vacuum pump sealers. They are not compatible with heat-bar type chamber or edge sealers, as those require open-top embossed bags without a valve.',
  },
  {
    question: 'Which bag size should I choose?',
    answer:
      'Small (22×21 cm, 25-pack) is perfect for snacks, cheese slices, single portions, fishing bait, and camping. Medium (26×28 cm, 30-pack) is our most versatile size — great for meal prep, chicken breasts, deli meats, and family sides. Large (30×34 cm, 50-pack) handles family meals, whole cuts of meat, bulk vegetables, and large sous-vide portions. Not sure? The Starter Kit includes 10 of each size plus the sealer.',
  },
  {
    question: 'Is the FreshLock Pro waterproof?',
    answer:
      'No. The sealer is splash-resistant but should not be submerged or used under running water. The collection cup and air channel can be rinsed under the tap for easy cleaning, but the main unit should be wiped clean with a damp cloth only.',
  },
  {
    question: 'How long does the battery last?',
    answer:
      'The FreshLock Pro delivers approximately 40+ seals per full charge. Standby time is up to 30 days. A full USB-C charge takes around 2 hours.',
  },
  {
    question: 'Where do you ship?',
    answer:
      'We ship worldwide — including Australia, New Zealand, the US, UK, Canada, and across Europe. Standard shipping is FREE on orders over A$99 to Australia & New Zealand. Express delivery 3-5 days available at checkout.',
  },
  {
    question: 'What is your returns policy?',
    answer:
      'We offer a 30-day satisfaction guarantee. If you are not completely happy, return the product in its original packaging for a full refund or exchange. See our Returns page for full details.',
  },
];
