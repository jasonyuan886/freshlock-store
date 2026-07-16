import { Product, Review } from './types';

export const products: Product[] = [
  {
    slug: 'freshlock-pro',
    name: 'FreshLock Pro',
    price: 89.99,
    description:
      'The FreshLock Pro is our flagship handheld vacuum sealer, engineered for quick, cordless food preservation. Simply attach the nozzle to the valve on any FreshLock zipper bag, press one button, and the powerful motor extracts air in seconds — creating an airtight seal that keeps food fresh up to 5× longer. No heat bar, no complicated setup. USB-C rechargeable and fully portable, so you can seal at the bench, in the pantry, fridge, or even at the campsite.',
    shortDescription: 'Powerful handheld vacuum pump — cordless, rechargeable, one-touch valve sealing.',
    image: '/images/products/sealer-main.jpg',
    images: [
      '/images/products/sealer-main.jpg',
      '/images/products/sealer-use.jpg',
      '/images/products/sealer-kit.jpg',
    ],
    features: [
      'Powerful suction pump — extracts air through the bag valve in seconds',
      'One-touch operation — no heat bar, no complicated settings',
      'Re-sealable zipper bags — open and close multiple times',
      'Cordless & portable — use anywhere in the kitchen or outdoors',
      'USB-C rechargeable with long-lasting battery',
      'Compact design — fits easily in a kitchen drawer',
    ],
    specs: {
      'Material': 'ABS + Food-grade Silicone',
      'Battery': '2000 mAh Li-ion (USB-C)',
      'Charge Time': '~2 hours',
      'Sealing Method': 'Vacuum extraction through one-way air valve',
      'Weight': '380 g',
      'Dimensions': '22 × 5.5 cm',
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
      '/images/products/bags-1.jpg',
    ],
    features: [
      'Includes FreshLock Pro handheld sealer',
      '30 × premium vacuum zipper bags (10 small + 10 medium + 10 large)',
      'USB-C charging cable included',
      'Quick-start guide',
      'Premium full-colour gift box packaging',
      'Saves you $20 vs buying separately',
    ],
    specs: {
      'Includes': '1× FreshLock Pro, 10× Small Bags (22×21 cm), 10× Medium Bags (26×28 cm), 10× Large Bags (26×34 cm), 1× USB-C Cable, 1× Quick Start Guide',
      'Bag Sizes': 'Small 22×21 cm, Medium 26×28 cm, Large 26×34 cm',
      'Warranty': '2 years (sealer), bags are reusable & recyclable',
    },
    category: 'kits',
    badge: 'Best Value',
  },
  {
    slug: 'vacuum-seal-bags-30-pack',
    name: 'Vacuum Seal Bags — 30 Pack (Medium)',
    price: 29.99,
    description:
      'Premium multi-layer vacuum zipper bags designed for the FreshLock system. Each bag features a double-track zipper closure and a built-in one-way air valve. Attach your FreshLock sealer to the valve, extract the air, and the bag creates an airtight barrier that locks out air and moisture — keeping meat, cheese, vegetables, and dry goods fresh for weeks. BPA-free and reusable.',
    shortDescription: '30 × medium vacuum zipper bags (26×28 cm). BPA-free & reusable.',
    image: '/images/products/bags-1.jpg',
    images: [
      '/images/products/bags-1.jpg',
      '/images/products/bags-2.jpg',
    ],
    features: [
      'Multi-layer construction for maximum freshness',
      'BPA-free & food-safe',
      'Built-in one-way air valve + double-track green zipper slider',
      'Pre-cut size: 26 × 28 cm — ideal for portions, snacks, cheese',
      'Compatible with all FreshLock valve-type sealers',
      'Reusable & recyclable material',
    ],
    specs: {
      'Quantity': '30 bags',
      'Size': '26 × 28 cm (Medium)',
      'Material': 'PA + PE multi-layer, BPA-free, embossed texture',
      'Closure': 'Double-track zipper with green slider',
      'Valve': 'One-way white circular air valve',
      'Microwave Safe': 'Yes (open zipper first, up to 100 °C)',
      'Freezer Safe': 'Yes',
    },
    category: 'bags',
  },
  {
    slug: 'vacuum-seal-bags-50-pack',
    name: 'Vacuum Seal Bags — 50 Pack (Large)',
    price: 39.99,
    description:
      'Our value-packed large bag option. At 26×34 cm these bags handle family-size portions, whole cuts of meat, bulk vegetables, and sous-vide cooking. Same premium multi-layer construction, one-way air valve, and double-track green zipper slider as our medium bags — designed for reliable, repeated use with your FreshLock sealer.',
    shortDescription: '50 × large vacuum zipper bags (26×34 cm). Great for bulk & family meals.',
    image: '/images/products/bags-4.jpg',
    images: [
      '/images/products/bags-4.jpg',
      '/images/products/bags-5.jpg',
    ],
    features: [
      'Multi-layer construction for maximum freshness',
      'BPA-free & food-safe',
      'Built-in one-way air valve + double-track green zipper slider',
      'Pre-cut size: 26 × 34 cm — ideal for family meals, bulk buys, sous-vide',
      'Compatible with all FreshLock valve-type sealers',
      'Reusable & recyclable material',
      'Best per-bag value',
    ],
    specs: {
      'Quantity': '50 bags',
      'Size': '26 × 34 cm (Large)',
      'Material': 'PA + PE multi-layer, BPA-free, embossed texture',
      'Closure': 'Double-track zipper with green slider',
      'Valve': 'One-way white circular air valve',
      'Microwave Safe': 'Yes (open zipper first, up to 100 °C)',
      'Freezer Safe': 'Yes',
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
      'Place your food in a FreshLock zipper bag, press the double-track zipper closed with the green slider, set the sealer nozzle over the white circular air valve, and press the one-touch button. The pump extracts air through the valve in seconds, and the one-way valve automatically locks to maintain an airtight seal. No heat bar, no complicated prep — it is that simple.',
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
      'FreshLock bags use a standard one-way air valve that works with most handheld vacuum pump sealers on the Australian market. They are not compatible with heat-bar type chamber or edge sealers, as those require open-top embossed bags without a valve.',
  },
  {
    question: 'Is the FreshLock Pro waterproof?',
    answer:
      'No. The sealer is splash-resistant but should not be submerged or used under running water. Wipe clean with a damp cloth only. The nozzle that touches the bag valve can be wiped with a food-safe sanitiser.',
  },
  {
    question: 'How long does the battery last?',
    answer:
      'The FreshLock Pro delivers approximately 40+ seals per full charge. Standby time is up to 30 days. A full USB-C charge takes around 2 hours.',
  },
  {
    question: 'Do you ship Australia-wide?',
    answer:
      'Yes! We ship to all Australian states and territories. Standard shipping is free on orders over $79 AUD. Express shipping is available at checkout.',
  },
  {
    question: 'What is your returns policy?',
    answer:
      'We offer a 30-day satisfaction guarantee. If you are not completely happy, return the product in its original packaging for a full refund or exchange. See our Returns page for full details.',
  },
];
