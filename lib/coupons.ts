import couponsData from '@/data/coupons.json';

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

// 业务备注（原内联注释存档）：
// - WILDMOON15 与 KRISTINA15 同权（2026-10-29 达人信承诺，60 天有效）
// - BLACKFRIDAY15(percent) 已于 11-06 停用，固定金额双档替代（袁总令：优惠券不用折扣券）
// - 2026-11-23 起：日常管理走 /admin/coupons（袁总后台手动建码/停用/设期），本文件仅存数据
const COUPONS: Coupon[] = couponsData as Coupon[];

export function lookupCoupon(rawCode: string | undefined | null): Coupon | null {
  if (!rawCode) return null;
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;
  const found = COUPONS.find((c) => c.code === code && c.active);
  if (found) {
    const today = new Date().toISOString().slice(0, 10);
    if (found.notBefore && today < found.notBefore) return null;
    if (found.notAfter && today >= found.notAfter) return null;
    return found;
  }
  // Affiliate channel codes: any FL-{PARTNER}10 pattern gets 10% off.
  if (/^FL-[A-Z0-9-]{2,24}10$/.test(code)) {
    return { code, percentOff: 0.1, active: true, description: 'Affiliate partner code (10% off)' };
  }
  return null;
}

// 折扣计算唯一口径：服务端实扣与 checkout 显示共用
export function couponDiscount(c: Coupon, subtotal: number): number {
  if (c.minSubtotal && subtotal < c.minSubtotal) return 0;
  const d = c.percentOff ? subtotal * c.percentOff : Math.min(c.amountOff || 0, subtotal);
  return +d.toFixed(2);
}
