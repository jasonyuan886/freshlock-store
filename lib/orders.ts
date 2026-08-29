// Order persistence for FreshLock.
//
// Captured PayPal orders are written to a private GitHub repository via the
// Contents API (one JSON file per order). This gives the store a durable,
// website-side order record independent of PayPal transaction history.
//
// Configuration (Vercel env vars, server-only — never exposed to the client):
//   GITHUB_TOKEN            – a GitHub PAT with `repo` scope (REQUIRED to persist)
//   ORDERS_REPO             – target repo, default "jasonyuan886/freshlock-orders"
//   ORDERS_BRANCH           – target branch, default the repo default branch
//
// If GITHUB_TOKEN is not configured, persistOrder() logs a warning and returns
// { persisted:false, reason:'no_token' } WITHOUT throwing — the capture flow
// must never break. The merchant notification email remains the fallback
// archive in that case (order data is still emailed to support@ + owner Gmail).
//
// Idempotency: the file name is derived from the PayPal order id. Repeated
// callbacks for the same order (success-page refresh, duplicate PUT) hit the
// same path: if the file already exists we leave it untouched (no duplicate
// order, no failed write). Orders are therefore never duplicated.

export type OrderItemRecord = {
  name: string;
  price: number;
  quantity: number;
  slug?: string;
};

export type OrderAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  landing_page?: string;
  [key: string]: string | undefined;
};

export type OrderRecord = {
  order_number: string;
  paypal_order_id: string;
  paypal_capture_id?: string;
  payment_method: 'paypal' | 'stripe' | string;
  status: 'COMPLETED' | string;
  created_at: string; // ISO UTC
  customer: {
    name?: string;
    email?: string;
    phone?: string;
  };
  shipping_address?: {
    name?: string;
    address_line_1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  items: OrderItemRecord[];
  subtotal?: number;
  shipping?: number;
  total: number;
  currency: string;
  attribution?: OrderAttribution;
  source?: string; // how/where this record was created
};

const ORDERS_REPO = process.env.ORDERS_REPO || 'jasonyuan886/freshlock-orders';
const ORDERS_BRANCH = process.env.ORDERS_BRANCH || '';
const GITHUB_API = 'https://api.github.com';

// Generate a human-friendly order number: FL-YYYYMMDD-XXXXX.
// Deterministic when a PayPal order id is supplied (suffix derived from it) so
// that repeated capture callbacks for the same PayPal order yield the SAME
// order number — no duplicate orders on refresh/retry.
export function generateOrderNumber(paypalOrderId?: string): string {
  const d = new Date();
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  let suffix = '';
  if (paypalOrderId) {
    const clean = paypalOrderId.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    suffix = (clean.slice(-5) || '00000');
  } else {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let i = 0; i < 5; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `FL-${ymd}-${suffix}`;
}

async function ghFetch(path: string, token: string, init?: RequestInit) {
  return fetch(`${GITHUB_API}/repos/${ORDERS_REPO}/contents/${path}`, {
    ...init,
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'freshlock-order-persist',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.headers || {}),
    },
  });
}

function orderFilePath(order: OrderRecord): string {
  const d = order.created_at ? order.created_at.slice(0, 10).replace(/-/g, '') : 'unknown';
  const id = (order.paypal_order_id || order.order_number).replace(/[^A-Za-z0-9_-]/g, '');
  return `orders/${d}-${id}.json`;
}

export type PersistResult = {
  persisted: boolean;
  reason?: string;
  order_number?: string;
  path?: string;
};

export async function persistOrder(order: OrderRecord): Promise<PersistResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('[orders] GITHUB_TOKEN not set — skipping order persistence (merchant email remains the archive).');
    return { persisted: false, reason: 'no_token', order_number: order.order_number };
  }

  const path = orderFilePath(order);
  const content = Buffer.from(JSON.stringify(order, null, 2), 'utf-8').toString('base64');

  const branchParam = ORDERS_BRANCH ? `?ref=${encodeURIComponent(ORDERS_BRANCH)}` : '';

  try {
    // Idempotency: check whether this order file already exists.
    const existing = await ghFetch(`${path}${branchParam}`, token);
    if (existing.ok) {
      // Already persisted (e.g. repeated capture callback) — do not duplicate.
      return { persisted: true, reason: 'already_exists', order_number: order.order_number, path };
    }
    if (existing.status !== 404) {
      const txt = await existing.text().catch(() => '');
      console.error('[orders] unexpected status checking order file:', existing.status, txt.slice(0, 200));
      return { persisted: false, reason: `check_${existing.status}`, order_number: order.order_number };
    }

    // Create the file (no sha → GitHub creates a new file).
    const body: Record<string, string> = {
      message: `order: ${order.order_number} ${order.total} ${order.currency} (${order.customer.email || 'no-email'})`,
      content,
    };
    if (ORDERS_BRANCH) body.branch = ORDERS_BRANCH;

    const create = await ghFetch(path, token, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    if (create.ok) {
      return { persisted: true, order_number: order.order_number, path };
    }
    const txt = await create.text().catch(() => '');
    console.error('[orders] failed to write order file:', create.status, txt.slice(0, 300));
    return { persisted: false, reason: `write_${create.status}`, order_number: order.order_number };
  } catch (e: any) {
    console.error('[orders] persistence error:', e?.message || e);
    return { persisted: false, reason: 'error', order_number: order.order_number };
  }
}
