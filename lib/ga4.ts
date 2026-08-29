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
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag(...args);
  } else {
    // gtag.js may still be loading (scripts use lazyOnload). The gtag bootstrap
    // simply pushes arguments onto window.dataLayer, so enqueue here — the event
    // is flushed as soon as analytics.js initialises. Prevents lost purchase
    // events when the success page fires before the script is ready.
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push(args);
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

// Fire the purchase event at most once per transaction id. The success page can
// re-render or be refreshed after PayPal capture; GA4 does NOT dedupe repeated
// purchase events with the same transaction_id, so we guard client-side with a
// localStorage marker.
export function trackPurchaseOnce(orderId: string, items: GA4Item[], total: number) {
  if (typeof window === 'undefined') return;
  const key = `freshlock-ga-purchase:${orderId}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, new Date().toISOString());
  } catch {
    // if storage is unavailable fall through and still fire once this render
  }
  trackPurchase(orderId, items, total);
}
