import crypto from 'crypto';

// Admin session: value = "<exp>.<hmac>" signed with ADMIN_PASSWORD. 7-day sliding-ish expiry.
export const ADMIN_COOKIE = 'fl_admin';

export function createSessionValue(): string {
  const exp = Date.now() + 7 * 24 * 3600 * 1000;
  const sig = crypto.createHmac('sha256', process.env.ADMIN_PASSWORD || '').update(String(exp)).digest('hex');
  return `${exp}.${sig}`;
}

export function isValidSession(value: string | undefined | null): boolean {
  if (!value || !process.env.ADMIN_PASSWORD) return false;
  const [exp, sig] = value.split('.');
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < Date.now()) return false;
  const expect = crypto.createHmac('sha256', process.env.ADMIN_PASSWORD).update(exp).digest('hex');
  const a = Buffer.from(sig), b = Buffer.from(expect);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
