import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);

function loadCoupons() {
  const path = new URL('lib/coupons.ts', root);
  const output = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: path.pathname,
  }).outputText;
  const module = { exports: {} };
  class FixedDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : ['2026-11-20T12:00:00Z']));
    }
    static now() {
      return new Date('2026-11-20T12:00:00Z').getTime();
    }
  }
  const wrapper = vm.runInNewContext(
    `(function (exports, require, module) { ${output}\n })`,
    { Date: FixedDate },
    { filename: path.pathname },
  );
  wrapper(module.exports, (id) => { throw new Error(`Unexpected require: ${id}`); }, module);
  return module.exports;
}

test('BLACKFRIDAY10 protects a single lids pack but still rewards two packs', () => {
  const { lookupCoupon, couponDiscount } = loadCoupons();
  const coupon = lookupCoupon('blackfriday10');
  assert.ok(coupon, 'coupon is active during the promotion');
  assert.equal(coupon.amountOff, 10);
  assert.equal(coupon.minSubtotal, 39);
  assert.match(coupon.description, /\$39\+/);

  const lidsPrice = 19.99;
  const standardShipping = 5.99;
  const totalFor = (quantity) => {
    const subtotal = +(lidsPrice * quantity).toFixed(2);
    const discount = couponDiscount(coupon, subtotal);
    return { subtotal, discount, total: +(subtotal - discount + standardShipping).toFixed(2) };
  };

  assert.deepEqual(totalFor(1), { subtotal: 19.99, discount: 0, total: 25.98 });
  assert.deepEqual(totalFor(2), { subtotal: 39.98, discount: 10, total: 35.97 });
  assert.equal(couponDiscount(coupon, 38.99), 0, 'shipping never counts toward the threshold');
  assert.equal(couponDiscount(coupon, 39), 10, 'the threshold is inclusive');
});

test('BLACKFRIDAY25 keeps its existing $129 tier', () => {
  const { lookupCoupon, couponDiscount } = loadCoupons();
  const coupon = lookupCoupon('BLACKFRIDAY25');
  assert.ok(coupon);
  assert.equal(coupon.minSubtotal, 129);
  assert.equal(couponDiscount(coupon, 128.99), 0);
  assert.equal(couponDiscount(coupon, 129), 25);
});

test('all customer-facing coupon copy states the same $39 minimum', () => {
  const files = [
    'app/page.tsx',
    'components/BlackFridayBanner.tsx',
    'components/FomoCountdownTimer.tsx',
    'app/api/abandoned-cart/route.ts',
  ];
  for (const file of files) {
    const source = readFileSync(new URL(file, root), 'utf8');
    assert.match(source, /\$39\+/, `${file} must advertise the $39 minimum`);
    assert.doesNotMatch(source, /\$10 off any order|\$10 OFF Every Order|no minimum|Black Friday is ON — \$10 OFF(?!\s*\$39\+)/i, `${file} contains obsolete no-minimum copy`);
  }
});
