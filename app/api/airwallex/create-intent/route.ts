import { NextResponse } from 'next/server';
import { products, AIR_SHIPPING_US } from '@/lib/data';
import { lookupCoupon, couponDiscount } from '@/lib/coupons';
import { getAttribution } from '@/lib/attribution';
import {
  airwallexConfigured,
  createAirwallexPaymentIntent,
  generateOrderNumber,
  saveAirwallexOrder,
} from '@/lib/airwallex';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FREE_SHIPPING_THRESHOLD = 89;
const SHIPPING_FEE_UNDER = 5.99;
const CURRENCY = 'USD';

export async function POST(request: Request) {
  try {
    if (!airwallexConfigured()) {
      return NextResponse.json({ error: 'card_payment_not_configured' }, { status: 503 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const items: Array<{ slug?: string; quantity?: number }> = Array.isArray(body?.items) ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    // Server-side authoritative pricing — never trust client totals.
    const lineItems: Array<{ name: string; slug?: string; quantity: number; price: number }> = [];
    let subtotal = 0;
    for (const raw of items) {
      const product = products.find((p: any) => p.slug === raw.slug);
      if (!product) {
        return NextResponse.json({ error: `Unknown product: ${raw.slug}` }, { status: 400 });
      }
      const quantity = Math.max(1, Math.min(20, Number(raw.quantity) || 1));
      const price = product.price;
      subtotal += price * quantity;
      lineItems.push({ name: product.name, slug: product.slug, quantity, price });
    }
    subtotal = +subtotal.toFixed(2);

    const shippingMethod = body?.shippingMethod === 'express' ? 'express' : 'standard';
    const shipping = shippingMethod === 'express'
      ? AIR_SHIPPING_US
      : subtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : SHIPPING_FEE_UNDER;

    const couponCode: string | undefined = typeof body?.couponCode === 'string' ? body.couponCode.trim() : undefined;
    const coupon = couponCode ? lookupCoupon(couponCode) : null;
    const discount = coupon ? +couponDiscount(coupon, subtotal).toFixed(2) : 0;

    const total = +(subtotal - discount + shipping).toFixed(2);
    if (!(total > 0)) {
      return NextResponse.json({ error: 'Invalid order total.' }, { status: 400 });
    }

    const email: string = (body?.customer?.email || '').toString().trim();
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !EMAIL_RE.test(email) || email.length > 200) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const firstName: string = (body?.customer?.firstName || '').toString().trim().slice(0, 80);
    const lastName: string = (body?.customer?.lastName || '').toString().trim().slice(0, 80);
    const phone: string = (body?.customer?.phone || '').toString().trim().slice(0, 40);
    const shippingAddress = {
      address: (body?.shippingAddress?.address || '').toString().trim().slice(0, 200),
      city: (body?.shippingAddress?.city || '').toString().trim().slice(0, 80),
      state: (body?.shippingAddress?.state || '').toString().trim().slice(0, 80),
      postal_code: (body?.shippingAddress?.postalCode || '').toString().trim().slice(0, 20),
      country: (body?.shippingAddress?.country || '').toString().trim().slice(0, 80),
    };

    const orderNumber = generateOrderNumber();
    const returnUrl = `https://www.freshlocksealer.com/checkout/success?payment_method=airwallex&order_number=${encodeURIComponent(orderNumber)}`;

    let intent: { id: string; clientSecret: string; status: string };
    try {
      intent = await createAirwallexPaymentIntent({
        requestId: crypto.randomUUID(),
        amount: total,
        currency: CURRENCY,
        orderNumber,
        customer: { email, firstName, lastName, phone },
        returnUrl,
      });
    } catch (err: any) {
      console.error('airwallex create-intent error:', err?.message || err);
      return NextResponse.json({ error: 'Could not initialize card payment. Please try again or use PayPal.' }, { status: 502 });
    }

    const record = {
      order_number: orderNumber,
      airwallex_intent_id: intent.id,
      status: 'PENDING',
      payment_method: 'airwallex',
      created_at: new Date().toISOString(),
      customer: { email, first_name: firstName, last_name: lastName, phone },
      shipping_address: shippingAddress,
      shipping_method: shippingMethod,
      items: lineItems,
      subtotal,
      shipping,
      discount,
      coupon_code: coupon ? couponCode : undefined,
      total,
      currency: CURRENCY,
      attribution: getAttribution(request),
    };

    try {
      await saveAirwallexOrder(record as any);
    } catch (err) {
      console.error('airwallex order persist error:', err);
      // Non-fatal: payment can still proceed; webhook finalize will retry save.
    }

    return NextResponse.json({
      intent_id: intent.id,
      client_secret: intent.clientSecret,
      order_number: orderNumber,
      currency: CURRENCY,
    });
  } catch (err) {
    console.error('airwallex create-intent fatal:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
