import { Product, Review } from './types';

export const products: Product[] = [
  {
    slug: 'freshlock-pro',
    name: 'FreshLock Pro',
    price: 89.99,
    description:
      'The FreshLock Pro is our flagship handheld vacuum sealer, engineered for the Australian kitchen. Its powerful motor creates a strong, airtight seal in seconds, keeping your food fresh up to 5× longer. The cordless, rechargeable design means you can seal meals at the bench, in the pantry, or even out camping.',
    shortDescription: 'Powerful handheld vacuum sealer — cordless, rechargeable, one-touch operation.',
    image: 'https://placehold.co/600x600/1B365D/white?text=FreshLock+Pro',
    images: [
      'https://placehold.co/600x600/1B365D/white?text=FreshLock+Pro+Front',
      'https://placehold.co/600x600/1B365D/white?text=FreshLock+Pro+Side',
      'https://placehold.co/600x600/1B365D/white?text=FreshLock+Pro+In-Use',
    ],
    features: [
      'Strong vacuum suction for airtight seal',
      'One-touch operation — no complicated settings',
      'Re-sealable — open and close bags multiple times',
      'Cordless & portable — take it anywhere',
      'USB-C rechargeable with long battery life',
      'Compact design — easy drawer storage',
    ],
    specs: {
      'Material': 'ABS + Food-grade Silicone',
      'Battery': '2000 mAh Li-ion (USB-C)',
      'Charge Time': '~2 hours',
      'Seal Width': 'Up to 30 cm',
      'Weight': '380 g',
      'Dimensions': '34 × 5.5 × 4 cm',
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
      'Everything you need to start sealing fresh. The Starter Kit bundles the FreshLock Pro handheld sealer with 20 premium vacuum seal bags in mixed sizes, so you can start preserving straight out of the box. Perfect as a gift or for first-time buyers.',
    shortDescription: 'FreshLock Pro + 20 vacuum seal bags — everything in one box.',
    image: 'https://placehold.co/600x600/1B365D/white?text=Starter+Kit',
    images: [
      'https://placehold.co/600x600/1B365D/white?text=Starter+Kit+Overview',
      'https://placehold.co/600x600/1B365D/white?text=Starter+Kit+Contents',
    ],
    features: [
      'Includes FreshLock Pro sealer',
      '20 × premium vacuum seal bags (10 medium + 10 large)',
      'USB-C charging cable included',
      'Quick-start guide',
      'Saves you $10 vs buying separately',
    ],
    specs: {
      'Includes': '1× FreshLock Pro, 20× Seal Bags, 1× USB-C Cable, 1× Quick Start Guide',
      'Bag Sizes': '10 × 20×25 cm (M), 10 × 28×35 cm (L)',
      'Warranty': '2 years (sealer), bags are single-use recyclable',
    },
    category: 'kits',
    badge: 'Best Value',
  },
  {
    slug: 'vacuum-seal-bags-30-pack',
    name: 'Vacuum Seal Bags — 30 Pack (Medium)',
    price: 29.99,
    description:
      'Premium multi-layer vacuum seal bags designed for the FreshLock system. Each bag creates an airtight barrier that locks out air and moisture, keeping meat, cheese, vegetables, and dry goods fresh for weeks. BPA-free and recyclable.',
    shortDescription: '30 × medium vacuum seal bags (20×25 cm). BPA-free & recyclable.',
    image: 'https://placehold.co/600x600/1B365D/white?text=Vacuum+Bags+30pk',
    images: [
      'https://placehold.co/600x600/1B365D/white?text=Bags+30pk+Front',
      'https://placehold.co/600x600/1B365D/white?text=Bags+30pk+Detail',
    ],
    features: [
      'Multi-layer construction for maximum freshness',
      'BPA-free & food-safe',
      'Pre-cut size: 20 × 25 cm — ideal for portions, snacks, cheese',
      'Compatible with all FreshLock sealers',
      'Recyclable material',
    ],
    specs: {
      'Quantity': '30 bags',
      'Size': '20 × 25 cm (Medium)',
      'Material': 'PA + PE multi-layer, BPA-free',
      'Microwave Safe': 'Yes (up to 100 °C)',
      'Freezer Safe': 'Yes',
    },
    category: 'bags',
  },
  {
    slug: 'vacuum-seal-bags-50-pack',
    name: 'Vacuum Seal Bags — 50 Pack (Large)',
    price: 39.99,
    description:
      'Our value-packed large bag option. At 28×35 cm these bags handle family-size portions, whole cuts of meat, bulk vegetables, and sous-vide cooking. Same premium multi-layer, BPA-free build as our medium bags.',
    shortDescription: '50 × large vacuum seal bags (28×35 cm). Great for bulk & family meals.',
    image: 'https://placehold.co/600x600/1B365D/white?text=Vacuum+Bags+50pk',
    images: [
      'https://placehold.co/600x600/1B365D/white?text=Bags+50pk+Front',
      'https://placehold.co/600x600/1B365D/white?text=Bags+50pk+Detail',
    ],
    features: [
      'Multi-layer construction for maximum freshness',
      'BPA-free & food-safe',
      'Pre-cut size: 28 × 35 cm — ideal for family meals, bulk buys',
      'Compatible with all FreshLock sealers',
      'Recyclable material',
      'Best per-bag value',
    ],
    specs: {
      'Quantity': '50 bags',
      'Size': '28 × 35 cm (Large)',
      'Material': 'PA + PE multi-layer, BPA-free',
      'Microwave Safe': 'Yes (up to 100 °C)',
      'Freezer Safe': 'Yes',
    },
    category: 'bags',
    badge: 'Value Pack',
  },
  {
    slug: 'freshlock-travel-kit',
    name: 'FreshLock Travel Kit',
    price: 69.99,
    description:
      'Take freshness on the road. The Travel Kit includes a compact FreshLock sealer in a sleek carry case plus 10 travel-size bags. Perfect for camping trips, road trips, caravanning, or keeping leftovers fresh in hotel fridges.',
    shortDescription: 'Compact sealer + carry case + 10 travel bags — freshness on the go.',
    image: 'https://placehold.co/600x600/1B365D/white?text=Travel+Kit',
    images: [
      'https://placehold.co/600x600/1B365D/white?text=Travel+Kit+Overview',
      'https://placehold.co/600x600/1B365D/white?text=Travel+Kit+Case',
    ],
    features: [
      'Compact travel-size sealer',
      'Hard-shell carry case included',
      '10 × travel-size vacuum bags (15×20 cm)',
      'USB-C charging cable',
      'Lightweight — only 260 g',
      'Fits in a glove box or backpack',
    ],
    specs: {
      'Includes': '1× Travel Sealer, 1× Carry Case, 10× Travel Bags, 1× USB-C Cable',
      'Bag Size': '15 × 20 cm (Travel)',
      'Sealer Weight': '260 g',
      'Battery': '1200 mAh Li-ion (USB-C)',
      'Warranty': '1 year',
    },
    category: 'kits',
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
    text: 'Bought the Starter Kit as a Christmas gift for my wife and she uses it every single day. The one-touch seal is so easy — even I can figure it out!',
    date: '2025-05-28',
  },
  {
    name: 'Priya K.',
    rating: 4,
    text: 'Great product. I use it for sous-vide cooking and the seal is always perfect. Only wish it came in more colours. Would definitely recommend.',
    date: '2025-05-15',
  },
  {
    name: 'David L.',
    rating: 5,
    text: 'We take the Travel Kit on every camping trip. Keeps our meat and veggies fresh for days without a proper esky. Brilliant little device.',
    date: '2025-04-30',
  },
  {
    name: 'Emma W.',
    rating: 5,
    text: 'Reduced our food waste by at least half. The bags are sturdy and the sealer is powerful. Best kitchen purchase we have made in years.',
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
      'Place your food in a FreshLock vacuum bag, lay the open end across the sealing bar, press the one-touch button, and the device extracts the air and heat-seals the bag in seconds. That is it — no complicated settings or prep required.',
  },
  {
    question: 'How much longer does food stay fresh?',
    answer:
      'Vacuum sealing removes up to 95 % of air, which slows oxidation and bacterial growth. In practice, vacuum-sealed meat lasts 3–5× longer in the fridge and 6–12 months in the freezer compared to conventional storage.',
  },
  {
    question: 'Are the bags reusable?',
    answer:
      'Our bags are designed for single-use to guarantee a perfect seal every time. However, you can re-use a bag for dry goods (e.g. rice, pasta) by cutting above the old seal and re-sealing. For raw meat or liquids we recommend a fresh bag each time.',
  },
  {
    question: 'Can I use FreshLock bags with other sealers?',
    answer:
      'FreshLock bags feature a universal textured pattern that works with most chamber and external vacuum sealers on the Australian market. However, we cannot guarantee performance with third-party devices.',
  },
  {
    question: 'Is the FreshLock Pro waterproof?',
    answer:
      'No. The sealer is splash-resistant but should not be submerged or used under running water. Wipe clean with a damp cloth only.',
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
