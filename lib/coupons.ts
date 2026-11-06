export type Coupon = {
  code: string;
  percentOff?: number; // 0-1，与 amountOff 二选一
  amountOff?: number;  // 固定金额立减（2026-11-06 袁总令：黑五用优惠券不用折扣券）
  minSubtotal?: number; // 可选：折前小计门槛（未达则不可用）
  active: boolean;
  notBefore?: string; // YYYY-MM-DD（含）UTC 日期闸门
  notAfter?: string;  // YYYY-MM-DD（不含）到期自动失效
  description: string;
};

const COUPONS: Coupon[] = [
  { code: 'FRESHLOCK15', percentOff: 0.15, active: true, description: 'Save 15% on your order' },
  { code: 'KRISTINA15', percentOff: 0.15, active: true, description: 'Thanks for visiting our farm stand' },
  // 2026-10-29 补：21:32 发给 Kristina 的信里承诺的码是 WILDMOON15（60 天有效），与 KRISTINA15 同权，防达人粉丝 checkout 翻车
  { code: 'WILDMOON15', percentOff: 0.15, active: true, description: 'Wild Moon Acres partner — 15% off for followers (as emailed 2026-10-29, valid 60 days)' },
  // 2026-11-06 袁总令「直接给优惠券不要折扣券」：BLACKFRIDAY15 停用，换固定金额双档
  { code: 'BLACKFRIDAY15', percentOff: 0.15, active: false, description: 'Replaced by fixed-amount BLACKFRIDAY10/25 (2026-11-06)' },
  // 黑五固定金额券：2026-11-06 袁总令提前开闸（原 11-24 生效作废）；12-02 自动失效
  { code: 'BLACKFRIDAY10', amountOff: 10, active: true, notAfter: '2026-12-02', description: 'Black Friday deal — $10 off any order (ends Dec 1)' },
  { code: 'BLACKFRIDAY25', amountOff: 25, minSubtotal: 129, active: true, notAfter: '2026-12-02', description: 'Black Friday deal — $25 off orders over $129 (ends Dec 1)' },
];

export function lookupCoupon(rawCode: string | undefined | null): Coupon | null {
  if (!rawCode) return null;
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;
  const found = COUPONS.find((c) => c.code === code && c.active);
  if (found) {
    // 日期闸门：UTC 日期自动生效/失效（袁总令 11-24 起生效，替代手动开关 active）
    const today = new Date().toISOString().slice(0, 10);
    if (found.notBefore && today < found.notBefore) return null;
    if (found.notAfter && today >= found.notAfter) return null;
    return found;
  }
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

// 折扣计算唯一口径：服务端实扣与 checkout 显示共用，percent/amount 二选一，
// minSubtotal 未达返回 0（调用方决定是否视为券不可用）
export function couponDiscount(c: Coupon, subtotal: number): number {
  if (c.minSubtotal && subtotal < c.minSubtotal) return 0;
  const d = c.percentOff ? subtotal * c.percentOff : Math.min(c.amountOff || 0, subtotal);
  return +d.toFixed(2);
}
