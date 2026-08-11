// GA4 E-commerce Event Tracking
// Measurement ID: G-N16R0F2B1Y

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

type GA4Item = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category?: string;
};

function safeGtag(...args: any[]) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
}

export function trackViewItem(product: { slug: string; name: string; price: number; category?: string }) {
  safeGtag('event', 'view_item', {
    currency: 'USD',
    value: product.price,
    items: [{
      item_id: product.slug,
      item_name: product.name,
      price: product.price,
      quantity: 1,
      item_category: product.category || 'sealer',
    }],
  });
}

export function trackAddToCart(product: { slug: string; name: string; price: number; category?: string }, quantity: number) {
  safeGtag('event', 'add_to_cart', {
    currency: 'USD',
    value: product.price * quantity,
    items: [{
      item_id: product.slug,
      item_name: product.name,
      price: product.price,
      quantity,
      item_category: product.category || 'sealer',
    }],
  });
}

export function trackViewCart(items: GA4Item[], total: number) {
  safeGtag('event', 'view_cart', {
    currency: 'USD',
    value: total,
    items,
  });
}

export function trackBeginCheckout(items: GA4Item[], total: number) {
  safeGtag('event', 'begin_checkout', {
    currency: 'USD',
    value: total,
    items,
  });
}

export function trackPurchase(orderId: string, items: GA4Item[], total: number) {
  safeGtag('event', 'purchase', {
    transaction_id: orderId,
    currency: 'USD',
    value: total,
    items,
  });
}
