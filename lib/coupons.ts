// Server-authoritative coupon codes. Never trust a discount amount/percent
// sent from the client — always look the code up here and recompute.
//
// FRESHLOCK15: "follow our TikTok, get 15% off" growth incentive. Uses the
// brand name rather than the channel name (TIKTOK15) so the code itself
// reinforces brand recall, per 2026-09-21 request. Landed cost on the hero
// SKUs (device ~35rmb, starter kit device+30 bags ~60rmb, +domestic freight
// <20rmb) is a small fraction of the $75-95 retail price, so 15% off leaves
// a large margin over hard product cost — see 2026-09-21 discussion.
// Honor-system code (no TikTok follow verification, matches how small DTC
// brands typically run this), shared in bio/video captions.

export type Coupon = {
  code: string;
  percentOff: number; // 0-1
  active: boolean;
  description: string;
};

const COUPONS: Coupon[] = [
  { code: 'FRESHLOCK15', percentOff: 0.15, active: true, description: 'Follow @freshlocksealer on TikTok — 15% off' },
];

export function lookupCoupon(rawCode: string | undefined | null): Coupon | null {
  if (!rawCode) return null;
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;
  const found = COUPONS.find((c) => c.code === code && c.active);
  return found || null;
}
