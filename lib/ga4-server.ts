// Server-side GA4 purchase tracking via the Measurement Protocol.
//
// Why this exists: the client-side `trackPurchaseOnce` in lib/ga4.ts only
// fires from the browser on the checkout success page. Real orders are
// captured and persisted here on the server regardless, but the GA4 event
// depends on gtag.js loading, no ad blocker / privacy extension blocking
// google-analytics.com, and the tab staying open long enough to fire it.
// In practice most real purchases never reach GA4 this way, which silently
// makes purchase-based conversion data look far lower than it is. This
// server-side call is independent of the buyer's browser and always fires
// once a PayPal capture succeeds, so it acts as the reliable source of
// truth for purchase conversions.
//
// Requires GA4_API_SECRET (created in GA4 Admin > Data Streams > [stream] >
// Measurement Protocol API secrets — the read-only service account cannot
// create this, it must be done in the GA4 web console). Silently no-ops if
// the secret isn't configured, so this never blocks or breaks checkout.

type GA4Item = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category?: string;
};

function extractGaClientId(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)_ga=([^;]+)/);
  if (!match) return null;
  // _ga cookie format: GA1.1.<clientIdPart1>.<clientIdPart2>
  const parts = match[1].split('.');
  if (parts.length < 4) return null;
  return `${parts[2]}.${parts[3]}`;
}

export async function sendServerPurchaseEvent(params: {
  orderId: string;
  items: GA4Item[];
  value: number;
  currency: string;
  cookieHeader: string | null;
}) {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  if (!measurementId || !apiSecret) {
    console.warn('[ga4-server] GA4_API_SECRET not configured, skipping server-side purchase event');
    return;
  }

  // Fall back to a synthetic client_id tied to the order when the buyer has
  // no _ga cookie (ad blocker, first-party cookie blocked, etc). GA4 still
  // counts the event and the conversion; it just won't merge into an
  // existing user session/journey.
  const clientId = extractGaClientId(params.cookieHeader) || `order.${params.orderId}`;

  const body = {
    client_id: clientId,
    events: [
      {
        name: 'purchase',
        params: {
          transaction_id: params.orderId,
          currency: params.currency,
          value: params.value,
          items: params.items,
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) {
      console.error('[ga4-server] purchase event rejected:', res.status, await res.text().catch(() => ''));
    }
  } catch (e: any) {
    console.error('[ga4-server] purchase event send error:', e?.message || e);
  }
}
