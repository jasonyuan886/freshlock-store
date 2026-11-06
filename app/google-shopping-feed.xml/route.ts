import { products, SHIPPING_FEE_UNDER, STARTER_KIT_SHIPS_FREE } from '@/lib/data';

// 2026-11-06 EN GMC feed 根治（对齐 JP 站 8947d9b 蓝本）：
// 原 public/google-shopping-feed.xml 静态文件 = 每次改价必漏（11-05 JP 站漂移同款病灶）。
// 现改为动态路由实时读 lib/data.ts —— price/image/name 永随站点单一数据源，不再漂移。
// 同时补录 2 个此前漏出 feed 的在售商品：lids-50-pack / freshlock-pro-lids-bundle。
// g:id 与旧静态 feed 完全一致（无后缀），GMC 历史商品数据不断档。

// Feed metadata that is NOT price/display data (marketing copy, taxonomy, shipping weights).
// PRICE / IMAGE / NAME always come live from lib/data.ts — never drifts.
const FEED_META: Record<string, {
  title: string;
  desc: string;
  mpn: string;
  category: string;
  productType: string;
  extraImages: string[];
  shipService: string;
  shipPrice: string; // static fallback; starter kit ships free
  weight: string;
  salePrice?: boolean; // emit <g:sale_price> equal to price (legacy shape)
  loyalty?: string;    // legacy loyalty_program line, keep verbatim
}> = {
  'freshlock-pro': {
    title: 'FreshLock Pro Handheld Vacuum Sealer — Cordless, USB-C, -60 kPa',
    desc: 'Cordless handheld vacuum sealer with -60 kPa suction, detachable drip tray, USB-C charging, and BPA-free starter bags. Stops freezer burn and keeps food fresh up to 5x longer. Compatible with most embossed valve bags. 80-100 seals per charge, library-quiet, weighs only 210g.',
    mpn: 'FL-PRO-001',
    category: 'Home & Garden > Kitchen & Dining > Kitchen Appliances > Vacuum Sealers',
    productType: 'Vacuum Sealers',
    extraImages: [
      '/images/products/sealer-angled.jpg',
      '/images/products/sealer-kit.jpg',
      '/images/products/sealer-box-angle.jpg',
    ],
    shipService: 'DHL Express',
    shipPrice: '5.99 USD',
    weight: '0.3 kg',
    salePrice: true,
  },
  'freshlock-starter-kit': {
    title: 'FreshLock Starter Kit — Pro Sealer + 30 BPA-Free Vacuum Bags, Ships Free',
    desc: 'Everything you need to start vacuum sealing today: FreshLock Pro handheld vacuum sealer plus 30 BPA-free embossed valve bags in 3 sizes (10 small, 10 medium, 10 large). Cordless, USB-C rechargeable, -60 kPa suction. Works with most embossed valve bags. Ships free.',
    mpn: 'FL-KIT-001',
    category: 'Home & Garden > Kitchen & Dining > Kitchen Appliances > Vacuum Sealers',
    productType: 'Vacuum Sealers',
    extraImages: [
      '/images/products/sealer-main.jpg',
      '/images/products/sealer-box-angle.jpg',
    ],
    shipService: 'DHL Express Free',
    shipPrice: '0 USD',
    weight: '0.5 kg',
    salePrice: true,
  },
  'vacuum-seal-bags-30-pack': {
    title: 'Vacuum Seal Bags 30 Pack Medium (26x28cm) — BPA-Free, Reusable, 90um',
    desc: '30 medium embossed valve bags (26x28 cm), 90 um, BPA-free. Compatible with most valve-type handheld vacuum sealers. Reusable, freezer-safe, microwave-safe, sous-vide safe. Double-track zipper with slider.',
    mpn: 'FL-BAG-M30',
    category: 'Home & Garden > Kitchen & Dining > Kitchen Storage > Food Storage Bags',
    productType: 'Food Storage Bags',
    extraImages: ['/images/products/bags-2.jpg'],
    shipService: 'DHL Express',
    shipPrice: '5.99 USD',
    weight: '0.3 kg',
    loyalty: 'freshlock_club:member:26.99 USD::::',
  },
  'vacuum-seal-bags-50-pack': {
    title: 'Vacuum Seal Bags 50 Pack Large (26x34cm) — BPA-Free, Reusable, 90um',
    desc: '50 large embossed valve bags (26x34 cm), 90 um, BPA-free. Compatible with most valve-type handheld vacuum sealers. Ideal for family meals, bulk buys, and sous-vide. Reusable, freezer-safe, microwave-safe.',
    mpn: 'FL-BAG-L50',
    category: 'Home & Garden > Kitchen & Dining > Kitchen Storage > Food Storage Bags',
    productType: 'Food Storage Bags',
    extraImages: ['/images/products/bags-5.jpg'],
    shipService: 'DHL Express',
    shipPrice: '5.99 USD',
    weight: '0.4 kg',
    loyalty: 'freshlock_club:member:35.99 USD::::',
  },
  'lids-50-pack': {
    title: 'FreshLock Mason Jar Vacuum Lids — 50 Pack (25 Wide + 25 Regular Mouth)',
    desc: '50 food-grade stainless mason jar lids with a one-way air valve: 25 wide-mouth (86 mm) + 25 regular-mouth (70 mm). Turn any standard mason jar into a vacuum container — pump with your FreshLock Pro hose attachment until the indicator dimples. Reusable, BPA-free silicone sealing ring. For refrigerated or frozen storage only; not for canning, oven, or microwave.',
    mpn: 'FL-LID-50',
    category: 'Home & Garden > Kitchen & Dining > Kitchen Storage & Organization > Food Storage',
    productType: 'Vacuum Sealer Accessories',
    extraImages: [
      '/images/products/lids-freshness.jpg',
      '/images/products/lids-valve-tech.jpg',
      '/images/products/lids-compatibility.jpg',
    ],
    shipService: 'DHL Express',
    shipPrice: '5.99 USD',
    weight: '0.4 kg',
  },
  'freshlock-pro-lids-bundle': {
    title: 'FreshLock Pro + 50 Lids Complete Jar-Sealing Kit — Save $10',
    desc: 'The complete jar-sealing setup in one box: FreshLock Pro handheld vacuum sealer (USB-C rechargeable, hose attachment for both jar mouth sizes included) plus 50 one-way air valve mason jar lids (25 wide-mouth 86 mm + 25 regular-mouth 70 mm). Seal coffee, nuts, berries, brown sugar, herbs and leftovers in seconds — no bags needed for dry goods. Saves $10 vs buying separately. Lids for refrigerated/frozen storage only; not for canning or heat.',
    mpn: 'FL-KIT-01',
    category: 'Home & Garden > Kitchen & Dining > Kitchen Appliances > Vacuum Sealers',
    productType: 'Vacuum Sealers',
    extraImages: [
      '/images/products/sealer-angled.jpg',
      '/images/products/lids-main.jpg',
      '/images/products/lids-compatibility.jpg',
    ],
    shipService: 'DHL Express',
    shipPrice: '5.99 USD',
    weight: '0.7 kg',
    salePrice: true,
  },
};

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function GET() {
  const BASE = 'https://www.freshlocksealer.com';
  const items = products
    .map((p) => {
      const m = FEED_META[p.slug];
      if (!m) return '';
      // shipping: starter kit always ships free (live from data constant)
      const shipPrice =
        p.slug === 'freshlock-starter-kit' && STARTER_KIT_SHIPS_FREE
          ? '0 USD'
          : m.shipPrice;
      const imgs = m.extraImages
        .map((u) => `        <g:additional_image_link>${esc(BASE + u)}</g:additional_image_link>`)
        .join('\n');
      const saleLine = m.salePrice
        ? `      <g:sale_price>${p.price} USD</g:sale_price>\n`
        : '';
      const loyaltyLine = m.loyalty
        ? `      <g:loyalty_program>${esc(m.loyalty)}</g:loyalty_program>\n`
        : '';
      return `    <item>
      <g:id>${p.slug}</g:id>
      <g:title>${esc(m.title)}</g:title>
      <g:description>${esc(m.desc)}</g:description>
      <g:link>${BASE}/products/${p.slug}</g:link>
      <g:image_link>${BASE}${p.image}</g:image_link>
${imgs}
      <g:availability>in_stock</g:availability>
      <g:price>${p.price} USD</g:price>
${saleLine}      <g:brand>FreshLock</g:brand>
      <g:condition>new</g:condition>
      <g:mpn>${esc(m.mpn)}</g:mpn>
      <g:google_product_category>${esc(m.category)}</g:google_product_category>
      <g:product_type>${esc(m.productType)}</g:product_type>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>${esc(m.shipService)}</g:service>
        <g:price>${shipPrice}</g:price>
      </g:shipping>
      <g:shipping_weight>${m.weight}</g:shipping_weight>
${loyaltyLine}    </item>`;
    })
    .filter(Boolean)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>FreshLock Product Feed</title>
    <link>${BASE}</link>
    <description>FreshLock handheld vacuum sealer products</description>

${items}

  </channel>
</rss>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
