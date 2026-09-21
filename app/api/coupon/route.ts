import { NextRequest, NextResponse } from 'next/server';
import { lookupCoupon } from '@/lib/coupons';

export const runtime = 'nodejs';

// Live "is this code valid" check for the checkout page's promo field. This
// is display-only — the actual charge always re-validates the code
// server-side in /api/paypal, so a stale/forged response here can't affect
// what a buyer is charged.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const coupon = lookupCoupon(body?.code);
  if (!coupon) {
    return NextResponse.json({ valid: false });
  }
  return NextResponse.json({
    valid: true,
    code: coupon.code,
    percentOff: coupon.percentOff,
    description: coupon.description,
  });
}
