import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(new URL('/checkout', request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        customer_email: session.customer_email,
        amount_total: session.amount_total,
      });
    } else {
      return NextResponse.redirect(new URL('/checkout', request.url));
    }
  } catch (error) {
    console.error('Error retrieving session:', error);
    return NextResponse.redirect(new URL('/checkout', request.url));
  }
}
