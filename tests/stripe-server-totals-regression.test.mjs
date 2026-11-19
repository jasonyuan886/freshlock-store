import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const routePath = new URL('app/api/checkout/route.ts', root);

const defaultProducts = [
  {
    slug: 'test-sealer',
    name: 'Authoritative Test Sealer',
    price: 50,
    image: '/images/test-sealer.jpg',
  },
];

function loadRoute({ env = {}, products = defaultProducts, create } = {}) {
  const constructorCalls = [];
  const sessionCalls = [];
  const logs = [];

  class StripeMock {
    constructor(key) {
      constructorCalls.push(key);
      this.checkout = {
        sessions: {
          create: async (params) => {
            sessionCalls.push(params);
            if (create) return create(params);
            return { id: 'cs_test_mock', url: 'https://checkout.stripe.test/cs_test_mock' };
          },
        },
      };
    }
  }

  const source = readFileSync(routePath, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: routePath.pathname,
  }).outputText;
  const module = { exports: {} };
  const mocks = {
    stripe: StripeMock,
    'next/server': {
      NextResponse: {
        json: (data, init = {}) => ({
          data,
          status: init.status || 200,
          ok: (init.status || 200) >= 200 && (init.status || 200) < 300,
        }),
      },
    },
    '@/lib/data': {
      products,
      AIR_SHIPPING_US: 10,
      FREE_SHIPPING_THRESHOLD: 89,
      SHIPPING_FEE_UNDER: 5.99,
    },
    '@/lib/coupons': {
      lookupCoupon(rawCode) {
        const code = String(rawCode || '').trim().toUpperCase();
        if (code === 'SAVE10') return { code, percentOff: 0.1, active: true };
        if (code === 'MIN100') return { code, percentOff: 0.1, minSubtotal: 100, active: true };
        if (code === 'FULL') return { code, amountOff: 50, active: true };
        return null;
      },
      couponDiscount(coupon, subtotal) {
        if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return 0;
        const discount = coupon.percentOff
          ? subtotal * coupon.percentOff
          : Math.min(coupon.amountOff || 0, subtotal);
        return +discount.toFixed(2);
      },
    },
  };
  const context = {
    console: {
      log() {}, warn() {}, info() {}, debug() {},
      error: (...args) => logs.push(args),
    },
    process: { env: { ...env } },
    URL,
  };
  const wrapper = vm.runInNewContext(
    `(function (exports, require, module) { ${output}\n })`,
    context,
    { filename: routePath.pathname },
  );
  wrapper(module.exports, (id) => {
    if (id in mocks) return mocks[id];
    throw new Error(`Unexpected require: ${id}`);
  }, module);
  return { route: module.exports, constructorCalls, sessionCalls, logs };
}

function configuredHarness(options = {}) {
  return loadRoute({
    ...options,
    env: {
      STRIPE_SECRET_KEY: 'sk_test_configured_mock_only',
      NEXT_PUBLIC_SITE_URL: 'https://www.freshlocksealer.com',
      ...(options.env || {}),
    },
  });
}

function validBody(overrides = {}) {
  return {
    items: [{
      slug: 'test-sealer',
      quantity: 1,
      product: {
        slug: 'test-sealer',
        name: 'Attacker-controlled name',
        price: 0.01,
        image: 'https://attacker.invalid/tracker.png',
      },
    }],
    shippingMethod: 'standard',
    shippingCountry: 'US',
    shippingInfo: { email: 'buyer@example.test' },
    ...overrides,
  };
}

function apiRequest(body, { origin = 'https://attacker.invalid', malformed = false } = {}) {
  return {
    json: async () => {
      if (malformed) throw new SyntaxError('Malformed JSON with client-only detail');
      return body;
    },
    headers: { get: (name) => name.toLowerCase() === 'origin' ? origin : null },
  };
}

function moneyBreakdown(params) {
  const merchandise = params.line_items.reduce(
    (sum, item) => sum + item.price_data.unit_amount * item.quantity,
    0,
  );
  assert.equal(params.shipping_options.length, 1, 'exactly one authoritative shipping option');
  const shipping = params.shipping_options[0].shipping_rate_data.fixed_amount.amount;
  return { merchandise, shipping, total: merchandise + shipping };
}

test('unconfigured and placeholder Stripe keys return safe 503 without constructing Stripe', async () => {
  for (const STRIPE_SECRET_KEY of [undefined, 'sk_test_your_test_key_here']) {
    const harness = loadRoute({ env: { STRIPE_SECRET_KEY } });
    const response = await harness.route.POST(apiRequest(validBody()));
    assert.equal(response.status, 503);
    assert.match(response.data.error, /PayPal/i);
    assert.equal(response.data.redirect, '/checkout');
    assert.equal(harness.constructorCalls.length, 0);
    assert.equal(harness.sessionCalls.length, 0);
  }
});

test('Stripe payable totals match PayPal for all four shipping × coupon combinations', async () => {
  const cases = [
    ['standard', undefined, { merchandise: 5000, shipping: 599, total: 5599, discount: 0 }],
    ['standard', 'SAVE10', { merchandise: 4500, shipping: 599, total: 5099, discount: 500 }],
    ['faster', undefined, { merchandise: 5000, shipping: 1000, total: 6000, discount: 0 }],
    ['faster', 'SAVE10', { merchandise: 4500, shipping: 1000, total: 5500, discount: 500 }],
  ];

  for (const [shippingMethod, couponCode, expected] of cases) {
    const harness = configuredHarness();
    const response = await harness.route.POST(apiRequest(validBody({ shippingMethod, couponCode })));
    assert.equal(response.status, 200, JSON.stringify(response.data));
    assert.equal(harness.sessionCalls.length, 1);
    const params = harness.sessionCalls[0];
    assert.deepEqual(moneyBreakdown(params), {
      merchandise: expected.merchandise,
      shipping: expected.shipping,
      total: expected.total,
    });
    assert.equal(params.metadata.subtotal_cents, '5000');
    assert.equal(params.metadata.discount_cents, String(expected.discount));
    assert.equal(params.metadata.shipping_cents, String(expected.shipping));
    assert.equal(params.metadata.total_cents, String(expected.total));
    assert.equal(params.metadata.shipping_method, shippingMethod);
  }
});

test('client prices, names, images, discounts, shipping and Origin cannot alter the Session', async () => {
  const harness = configuredHarness();
  const response = await harness.route.POST(apiRequest(validBody({
    shipping: 0,
    discount: 49.99,
    total: 0.01,
  }), { origin: 'https://attacker.invalid' }));
  assert.equal(response.status, 200, JSON.stringify(response.data));
  const params = harness.sessionCalls[0];
  assert.deepEqual(moneyBreakdown(params), { merchandise: 5000, shipping: 599, total: 5599 });
  const serialized = JSON.stringify(params);
  assert.doesNotMatch(serialized, /Attacker-controlled|attacker\.invalid|tracker\.png/);
  assert.match(serialized, /Authoritative Test Sealer/);
  assert.equal(params.success_url, 'https://www.freshlocksealer.com/checkout/success?session_id={CHECKOUT_SESSION_ID}');
  assert.equal(params.cancel_url, 'https://www.freshlocksealer.com/checkout');
});

test('free standard shipping uses the pre-discount subtotal threshold and never offers paid + free together', async () => {
  const products = [
    { slug: 'at-threshold', name: 'Threshold Product', price: 89, image: '/threshold.jpg' },
    { slug: 'below-threshold', name: 'Below Threshold Product', price: 88.99, image: '/below.jpg' },
  ];
  for (const testCase of [
    { slug: 'at-threshold', couponCode: 'SAVE10', merchandise: 8010, shipping: 0, total: 8010 },
    { slug: 'below-threshold', couponCode: 'SAVE10', merchandise: 8009, shipping: 599, total: 8608 },
  ]) {
    const harness = configuredHarness({ products });
    const response = await harness.route.POST(apiRequest(validBody({
      items: [{ slug: testCase.slug, quantity: 1 }],
      couponCode: testCase.couponCode,
    })));
    assert.equal(response.status, 200, JSON.stringify(response.data));
    assert.deepEqual(moneyBreakdown(harness.sessionCalls[0]), {
      merchandise: testCase.merchandise,
      shipping: testCase.shipping,
      total: testCase.total,
    });
  }
});

test('multi-item coupon rounding is exact and Session metadata preserves server slugs and quantities', async () => {
  const products = [
    { slug: 'rounding-a', name: 'Rounding A', price: 19.99, image: '/a.jpg' },
    { slug: 'rounding-b', name: 'Rounding B', price: 20, image: '/b.jpg' },
  ];
  const harness = configuredHarness({ products });
  const response = await harness.route.POST(apiRequest(validBody({
    items: [
      { slug: 'rounding-a', quantity: 3, price: 0.01 },
      { slug: 'rounding-b', quantity: 1, product: { price: 0.01, name: 'Fake' } },
    ],
    couponCode: 'SAVE10',
    shippingMethod: 'faster',
  })));
  assert.equal(response.status, 200, JSON.stringify(response.data));
  const params = harness.sessionCalls[0];
  // 3 × $19.99 + $20.00 = $79.97; 10% = $8.00; air = $10.00.
  assert.deepEqual(moneyBreakdown(params), { merchandise: 7197, shipping: 1000, total: 8197 });
  assert.deepEqual(JSON.parse(params.metadata.cart_items), [
    { slug: 'rounding-a', quantity: 3 },
    { slug: 'rounding-b', quantity: 1 },
  ]);
  assert.equal(params.metadata.unit_count, '4');
});

test('empty, missing, non-array and malformed carts are safe 4xx without Stripe calls', async () => {
  const cases = [[], undefined, {}, 'not-an-array'];
  for (const items of cases) {
    const harness = configuredHarness();
    const response = await harness.route.POST(apiRequest(validBody({ items })));
    assert.ok(response.status >= 400 && response.status < 500, `${JSON.stringify(items)} → ${response.status}`);
    assert.equal(harness.sessionCalls.length, 0);
  }
  const malformedHarness = configuredHarness();
  const malformed = await malformedHarness.route.POST(apiRequest(null, { malformed: true }));
  assert.equal(malformed.status, 400);
  assert.equal(malformedHarness.sessionCalls.length, 0);
});

test('unknown product slugs are rejected without echoing attacker-controlled product names', async () => {
  const harness = configuredHarness();
  const response = await harness.route.POST(apiRequest(validBody({
    items: [{ slug: 'not-a-real-product', name: 'Sensitive attacker text', quantity: 1 }],
  })));
  assert.equal(response.status, 400);
  assert.doesNotMatch(JSON.stringify(response.data), /Sensitive attacker text/);
  assert.equal(harness.sessionCalls.length, 0);
});

test('non-integer, missing and out-of-range quantities are rejected instead of clamped or coerced', async () => {
  for (const quantity of [0, -1, 100, 1.5, '2', null, undefined, true]) {
    const harness = configuredHarness();
    const response = await harness.route.POST(apiRequest(validBody({
      items: [{ slug: 'test-sealer', quantity }],
    })));
    assert.ok(response.status >= 400 && response.status < 500, `quantity ${String(quantity)} → ${response.status}`);
    assert.equal(harness.sessionCalls.length, 0);
  }
});

test('missing or unsupported shipping methods and malformed countries are safe 4xx', async () => {
  for (const shippingMethod of [undefined, '', 'express', 'FREE', null]) {
    const harness = configuredHarness();
    const response = await harness.route.POST(apiRequest(validBody({ shippingMethod })));
    assert.ok(response.status >= 400 && response.status < 500);
    assert.equal(harness.sessionCalls.length, 0);
  }
  for (const shippingCountry of ['USA', 'U1', 42]) {
    const harness = configuredHarness();
    const response = await harness.route.POST(apiRequest(validBody({ shippingCountry })));
    assert.ok(response.status >= 400 && response.status < 500);
    assert.equal(harness.sessionCalls.length, 0);
  }
});

test('unknown, malformed, ineligible and fully-consuming coupons cannot create invalid Sessions', async () => {
  for (const couponCode of ['DOES-NOT-EXIST', 'MIN100', 'FULL', 42]) {
    const harness = configuredHarness();
    const response = await harness.route.POST(apiRequest(validBody({ couponCode })));
    assert.ok(response.status >= 400 && response.status < 500, `${String(couponCode)} → ${response.status}`);
    assert.equal(harness.sessionCalls.length, 0);
  }
});

test('success and cancel URLs ignore Origin and support the fixed production fallback', async () => {
  const harness = configuredHarness({ env: { NEXT_PUBLIC_SITE_URL: undefined } });
  const response = await harness.route.POST(apiRequest(validBody(), { origin: 'null' }));
  assert.equal(response.status, 200, JSON.stringify(response.data));
  const params = harness.sessionCalls[0];
  assert.equal(params.success_url, 'https://www.freshlocksealer.com/checkout/success?session_id={CHECKOUT_SESSION_ID}');
  assert.equal(params.cancel_url, 'https://www.freshlocksealer.com/checkout');
  assert.doesNotMatch(JSON.stringify(params), /attacker\.invalid/);
});

test('Stripe delivery labels and estimates match the PayPal shipping promises', async () => {
  for (const testCase of [
    { shippingMethod: 'standard', label: /Standard Shipping \(7-15 business days\)/, minimum: 7, maximum: 15 },
    { shippingMethod: 'faster', label: /Faster Air \(3-7 business days\)/, minimum: 3, maximum: 7 },
  ]) {
    const harness = configuredHarness();
    const response = await harness.route.POST(apiRequest(validBody({ shippingMethod: testCase.shippingMethod })));
    assert.equal(response.status, 200, JSON.stringify(response.data));
    const rate = harness.sessionCalls[0].shipping_options[0].shipping_rate_data;
    assert.match(rate.display_name, testCase.label);
    assert.deepEqual(
      JSON.parse(JSON.stringify(rate.delivery_estimate)),
      {
        minimum: { unit: 'business_day', value: testCase.minimum },
        maximum: { unit: 'business_day', value: testCase.maximum },
      },
    );
  }
});

test('upstream Stripe failures return generic errors and logs exclude secrets, messages and raw payloads', async () => {
  const harness = configuredHarness({
    create: async () => {
      const error = new Error('upstream exposed sk_test_must_not_leak and customer detail');
      error.type = 'StripeAPIError';
      error.code = 'mock_upstream_failure';
      error.statusCode = 502;
      error.raw = { secret: 'raw-payload-must-not-leak' };
      throw error;
    },
  });
  const response = await harness.route.POST(apiRequest(validBody()));
  assert.equal(response.status, 502);
  assert.match(response.data.error, /unavailable|try again|PayPal/i);
  const serializedResponse = JSON.stringify(response.data);
  const serializedLogs = JSON.stringify(harness.logs);
  for (const serialized of [serializedResponse, serializedLogs]) {
    assert.doesNotMatch(serialized, /must_not_leak|customer detail|upstream exposed|raw-payload/i);
    assert.doesNotMatch(serialized, /sk_test_configured_mock_only/);
  }
  assert.match(serializedLogs, /mock_upstream_failure/);
  assert.equal(harness.sessionCalls.length, 1);
});
