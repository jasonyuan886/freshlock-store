import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  products,
  AIR_SHIPPING_US,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE_UNDER,
} from '@/lib/data';
import { lookupCoupon, couponDiscount } from '@/lib/coupons';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_SITE_URL = 'https://www.freshlocksealer.com';
const STRIPE_UNAVAILABLE_MESSAGE =
  'Card payment is currently unavailable. Please use PayPal to complete your order.';

type RawCheckoutItem = {
  slug?: unknown;
  quantity?: unknown;
  product?: { slug?: unknown } | null;
} | null;

function stripeUnavailable() {
  return NextResponse.json(
    { error: STRIPE_UNAVAILABLE_MESSAGE, redirect: '/checkout' },
    { status: 503 },
  );
}

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'sk_test_your_test_key_here') return null;
  return new Stripe(key);
}

function toCents(value: number): number {
  return Math.round(value * 100);
}

function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  try {
    const parsed = new URL(configured);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return configured.replace(/\/+$/, '');
    }
  } catch {
    // Invalid optional configuration must not become a redirect target.
  }
  return DEFAULT_SITE_URL;
}

function serverImageUrl(image: string | undefined, baseUrl: string): string | undefined {
  if (!image) return undefined;
  try {
    return new URL(image, `${baseUrl}/`).toString();
  } catch {
    return undefined;
  }
}

// Keep only bounded, non-sensitive Stripe diagnostic fields. In particular, do
// not log Error.message, Error.stack, error.raw, request bodies or API keys.
function logStripeError(error: unknown) {
  const candidate = error && typeof error === 'object'
    ? error as { type?: unknown; code?: unknown; statusCode?: unknown }
    : {};
  const safeText = (value: unknown) => typeof value === 'string'
    ? value.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 80)
    : undefined;
  console.error('[stripe] checkout session creation failed', JSON.stringify({
    type: safeText(candidate.type),
    code: safeText(candidate.code),
    statusCode: typeof candidate.statusCode === 'number' ? candidate.statusCode : undefined,
  }));
}

export async function POST(request: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'sk_test_your_test_key_here') return stripeUnavailable();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return badRequest('Invalid checkout request');
  }

  const {
    items: rawItems,
    shippingInfo,
    shippingAddress,
    couponCode,
    shippingMethod,
    shippingCountry: requestedShippingCountry,
  } = body;

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return badRequest('Cart is empty');
  }
  if (shippingMethod !== 'standard' && shippingMethod !== 'faster') {
    return badRequest('Invalid shipping method');
  }

  const shippingCountry = requestedShippingCountry
    ?? shippingAddress?.country
    ?? shippingInfo?.country
    ?? 'US';
  if (typeof shippingCountry !== 'string' || !/^[a-zA-Z]{2}$/.test(shippingCountry)) {
    return badRequest('Invalid shipping country');
  }
  const normalizedShippingCountry = shippingCountry.toUpperCase();

  // Accept either the PayPal-style { slug, quantity } line or the legacy
  // Stripe-style cart line with product.slug. Every other client product field
  // is deliberately ignored; the catalog is the only source of truth.
  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const items: { product: (typeof products)[number]; quantity: number }[] = [];
  for (const raw of rawItems as RawCheckoutItem[]) {
    const rawSlug = typeof raw?.slug === 'string'
      ? raw.slug
      : (typeof raw?.product?.slug === 'string' ? raw.product.slug : undefined);
    const product = rawSlug ? productBySlug.get(rawSlug) : undefined;
    if (!product) return badRequest('Unknown product');

    const quantity = raw?.quantity;
    if (
      typeof quantity !== 'number'
      || !Number.isInteger(quantity)
      || quantity < 1
      || quantity > 99
    ) {
      return badRequest('Quantity must be an integer between 1 and 99');
    }
    items.push({ product, quantity });
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const subtotalCents = items.reduce(
    (sum, item) => sum + toCents(item.product.price) * item.quantity,
    0,
  );

  // Match PayPal: the standard free-shipping threshold uses the pre-discount
  // subtotal, and Faster Air uses the same global AIR_SHIPPING_US amount.
  const shippingCents = shippingMethod === 'faster'
    ? toCents(AIR_SHIPPING_US)
    : (subtotalCents >= toCents(FREE_SHIPPING_THRESHOLD) ? 0 : toCents(SHIPPING_FEE_UNDER));

  let coupon: ReturnType<typeof lookupCoupon> = null;
  if (couponCode !== undefined && couponCode !== null && couponCode !== '') {
    if (typeof couponCode !== 'string') return badRequest('Invalid coupon');
    coupon = lookupCoupon(couponCode);
    if (!coupon) return badRequest('Invalid or expired coupon');
  }
  const discount = coupon ? couponDiscount(coupon, subtotal) : 0;
  if (coupon && discount <= 0) {
    return badRequest('Coupon requirements are not met for this order');
  }

  const discountCents = toCents(discount);
  const merchandiseCents = subtotalCents - discountCents;
  const totalCents = merchandiseCents + shippingCents;
  // Checkout Sessions cannot contain a zero/negative price line. Refuse that
  // boundary before any upstream call instead of creating a misleading charge.
  if (merchandiseCents <= 0 || totalCents <= 0) {
    return badRequest('Coupon leaves no payable merchandise amount');
  }

  const quantityBySlug = new Map<string, number>();
  for (const item of items) {
    quantityBySlug.set(
      item.product.slug,
      (quantityBySlug.get(item.product.slug) || 0) + item.quantity,
    );
  }
  const cartItems = Array.from(quantityBySlug, ([slug, quantity]) => ({ slug, quantity }));
  const unitCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const baseUrl = siteUrl();
  const firstProduct = items[0].product;
  const image = serverImageUrl(firstProduct.image, baseUrl);
  const orderName = cartItems.length === 1
    ? `${firstProduct.name}${unitCount > 1 ? ` × ${unitCount}` : ''}`
    : `FreshLock order (${unitCount} items)`;

  const metadata: Record<string, string> = {
    cart_items: JSON.stringify(cartItems),
    line_count: String(cartItems.length),
    unit_count: String(unitCount),
    subtotal_cents: String(subtotalCents),
    discount_cents: String(discountCents),
    shipping_cents: String(shippingCents),
    total_cents: String(totalCents),
    currency: 'usd',
    shipping_method: shippingMethod,
    shipping_country: normalizedShippingCountry,
  };
  if (coupon) metadata.coupon_code = coupon.code;

  try {
    const stripe = getStripe();
    if (!stripe) return stripeUnavailable();

    // One aggregate, already-discounted merchandise line avoids per-line cent
    // allocation drift. Exactly one server-priced shipping option is added, so
    // line items + shipping equals totalCents to the cent.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: orderName,
            images: image ? [image] : undefined,
          },
          unit_amount: merchandiseCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      customer_email: typeof shippingInfo?.email === 'string' && shippingInfo.email.trim()
        ? shippingInfo.email.trim()
        : undefined,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ'],
      },
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: shippingCents, currency: 'usd' },
          display_name: shippingMethod === 'faster'
            ? 'Faster Air (3-7 business days)'
            : (shippingCents === 0
              ? 'Free Standard Shipping (7-15 business days)'
              : 'Standard Shipping (7-15 business days)'),
          delivery_estimate: shippingMethod === 'faster'
            ? {
                minimum: { unit: 'business_day', value: 3 },
                maximum: { unit: 'business_day', value: 7 },
              }
            : {
                minimum: { unit: 'business_day', value: 7 },
                maximum: { unit: 'business_day', value: 15 },
              },
        },
      }],
      metadata,
    });
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    logStripeError(error);
    return NextResponse.json(
      { error: 'Card payment is temporarily unavailable. Please use PayPal or try again later.' },
      { status: 502 },
    );
  }
}
