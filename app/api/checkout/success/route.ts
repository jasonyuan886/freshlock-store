import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'sk_test_your_test_key_here') {
    return null;
  }
  return new Stripe(key);
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(new URL('/checkout', request.url));
  }

  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.redirect(new URL('/checkout', request.url));
    }
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });
    
    if (session.payment_status === 'paid') {
      const items = (session.line_items?.data || []).map((item) => ({
        name: item.description || '',
        slug: (item.price?.product as string) || '',
        price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
        quantity: item.quantity || 1,
      }));

      return NextResponse.json({
        success: true,
        customer_email: session.customer_email,
        amount_total: session.amount_total,
        session_id: sessionId,
        items,
      });
    } else {
      return NextResponse.redirect(new URL('/checkout', request.url));
    }
  } catch (error) {
    console.error('Error retrieving session:', error);
    return NextResponse.redirect(new URL('/checkout', request.url));
  }
}
