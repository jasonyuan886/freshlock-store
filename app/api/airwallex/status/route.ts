import { NextResponse } from 'next/server';
import { loadAirwallexOrder } from '@/lib/airwallex';
import { finalizeAirwallexOrder } from '@/lib/airwallex-finalize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toResponse(r: {
  paid: boolean;
  orderNumber?: string;
  orderId?: string;
  customerEmail?: string;
  confirmationEmailStatus?: string;
  totalCents?: number;
}) {
  return {
    paid: r.paid,
    orderNumber: r.orderNumber || null,
    orderId: r.orderId || null,
    customer_email: r.customerEmail || null,
    confirmation_email_status: r.confirmationEmailStatus || null,
    amount_total: r.totalCents ?? null,
  };
}

// GET /api/airwallex/status?order_number=... — used by the success page to poll
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = (searchParams.get('order_number') || '').trim();
    if (!orderNumber) {
      return NextResponse.json({ error: 'order_number required' }, { status: 400 });
    }
    const record = await loadAirwallexOrder(orderNumber);
    if (!record) {
      return NextResponse.json({ paid: false, orderNumber: null, orderId: null, customer_email: null, confirmation_email_status: null });
    }
    return NextResponse.json(
      toResponse({
        paid: record.status === 'PAID',
        orderNumber: record.order_number,
        orderId: record.airwallex_intent_id,
        customerEmail: record.customer.email,
        confirmationEmailStatus: record.confirmation_email_status,
        totalCents: Math.round(record.total * 100),
      }),
    );
  } catch (err) {
    console.error('airwallex status GET error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

// POST /api/airwallex/status { intent_id } — client-side finalize fallback
// after the drop-in reports success (webhook remains the authoritative path).
export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const intentId = (body?.intent_id || '').toString().trim();
    if (!intentId) {
      return NextResponse.json({ error: 'intent_id required' }, { status: 400 });
    }
    const result = await finalizeAirwallexOrder(intentId);
    return NextResponse.json(toResponse(result));
  } catch (err) {
    console.error('airwallex status POST error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
