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
  // 2026-10-30 袁总令：黑五（11-28）双档券——11-24 起生效，12-02 后我来手动关 active
  { code: 'BLACKFRIDAY25', percentOff: 0.25, active: true, description: 'Black Friday deal - 25% off, Nov 24 - Dec 1' },
  { code: 'BLACKFRIDAY30', percentOff: 0.30, active: true, description: 'Black Friday VIP - 30% off first 500 orders' },
  // 2026-10-29 袁总亲令：Wild Moon Acres（农场达人 Kristina）粉丝专属 15% 券
  { code: 'KRISTINA15', percentOff: 0.15, active: true, description: 'Wild Moon Acres partner — 15% off for followers' },
  // 2026-10-29 补：21:32 发给 Kristina 的信里承诺的码是 WILDMOON15（60 天有效），与 KRISTINA15 同权，防达人粉丝 checkout 翻车
  { code: 'WILDMOON15', percentOff: 0.15, active: true, description: 'Wild Moon Acres partner — 15% off for followers (as emailed 2026-10-29, valid 60 days)' },
];

export function lookupCoupon(rawCode: string | undefined | null): Coupon | null {
  if (!rawCode) return null;
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;
  const found = COUPONS.find((c) => c.code === code && c.active);
  if (found) return found;
  // Affiliate channel codes: any FL-{PARTNER}10 pattern gets 10% off.
  // Partner attribution happens in GA4 (affiliate_landing_view / affiliate_cta_click
  // events carry the partner param), so codes don't need per-partner rows here.
  // Onboard a new partner by giving them their own /go/{partner} link — no code
  // table change needed. Deactivate the whole affiliate channel by removing this
  // block.
  if (/^FL-[A-Z0-9-]{2,24}10$/.test(code)) {
    return { code, percentOff: 0.1, active: true, description: 'Affiliate partner code (10% off)' };
  }
  return null;
}
