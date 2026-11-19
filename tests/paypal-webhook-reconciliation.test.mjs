import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const routePath = new URL('app/api/paypal/webhook/route.ts', root);
const quietConsole = { log() {}, warn() {}, info() {}, debug() {}, error() {} };

function loadTsModule(url, mocks = {}, globals = {}) {
  const source = readFileSync(url, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: url.pathname,
  }).outputText;
  const module = { exports: {} };
  const localRequire = (id) => {
    if (id in mocks) return mocks[id];
    throw new Error(`Unexpected require in ${url.pathname}: ${id}`);
  };
  const context = {
    Buffer,
    URL,
    AbortController,
    AbortSignal,
    console: quietConsole,
    process: { env: {} },
    setTimeout,
    clearTimeout,
    ...globals,
  };
  const wrapper = vm.runInNewContext(
    `(function (exports, require, module) { ${output}\n })`,
    context,
    { filename: url.pathname },
  );
  wrapper(module.exports, localRequire, module);
  return module.exports;
}

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

function completedOrder(id = 'ORDER-1') {
  return {
    id,
    status: 'COMPLETED',
    payer: {
      email_address: 'server-payer@example.test',
      name: { given_name: 'Server', surname: 'Payer' },
    },
    purchase_units: [{
      custom_id: 'phone:+10000000000|coupon:SAVE10',
      items: [{ name: 'Server Product', quantity: '1', sku: 'server-product', unit_amount: { value: '50.00' } }],
      shipping: {
        name: { full_name: 'Server Payer' },
        address: {
          address_line_1: '1 Server Street', admin_area_2: 'Server City', admin_area_1: 'SS',
          postal_code: '00000', country_code: 'US',
        },
      },
      payments: {
        captures: [{
          id: `CAP-${id}`,
          amount: { value: '55.00', currency_code: 'USD' },
          create_time: '2026-11-19T00:00:00Z',
        }],
      },
    }],
  };
}

function webhookEvent(eventType = 'PAYMENT.CAPTURE.COMPLETED') {
  return {
    id: 'WH-EVENT-1',
    event_type: eventType,
    resource: {
      // Deliberately hostile/untrusted values: none may reach persistence.
      id: 'CAPTURE-UNTRUSTED',
      amount: { value: '0.01', currency_code: 'XXX' },
      payer: { email_address: 'event-attacker@example.test' },
      supplementary_data: { related_ids: { order_id: 'ORDER-1' } },
    },
  };
}

const transmissionHeaders = {
  'paypal-transmission-id': 'TRANSMISSION-ID',
  'paypal-transmission-time': '2026-11-19T00:00:00Z',
  'paypal-cert-url': 'https://attacker.invalid/must-not-fetch-cert',
  'paypal-auth-algo': 'SHA256withRSA',
  'paypal-transmission-sig': 'SIGNATURE',
};

function webhookRequest(event = webhookEvent(), options = {}) {
  const headers = { ...transmissionHeaders, ...(options.headers || {}) };
  for (const name of options.removeHeaders || []) delete headers[name];
  return {
    text: async () => options.raw ?? JSON.stringify(event),
    headers: { get: (name) => headers[String(name).toLowerCase()] || null },
  };
}

function makeRoute(options = {}) {
  const persistCalls = [];
  const durableWrites = [];
  const fetchCalls = [];
  const logs = [];
  const env = {
    PAYPAL_CLIENT_ID: 'test-client',
    PAYPAL_SECRET: 'test-secret',
    PAYPAL_WEBHOOK_ID: 'WH-TEST',
    ...(options.env || {}),
  };
  const defaultFetch = async (url) => {
    if (url.endsWith('/v1/oauth2/token')) return jsonResponse({ access_token: 'token' });
    if (url.endsWith('/v1/notifications/verify-webhook-signature')) {
      return jsonResponse({ verification_status: options.verificationStatus || 'SUCCESS' }, options.verificationHttpStatus || 200);
    }
    if (url.endsWith('/v2/checkout/orders/ORDER-1')) {
      return jsonResponse(options.order || completedOrder(), options.orderHttpStatus || 200);
    }
    throw new Error(`Unexpected PayPal URL ${url}`);
  };
  const route = loadTsModule(routePath, {
    'next/server': {
      NextResponse: {
        json: (data, init = {}) => ({ data, status: init.status || 200, ok: (init.status || 200) < 400 }),
      },
    },
    '@/lib/orders': {
      persistOrder: async (order) => {
        persistCalls.push(order);
        if (options.persistThrows) throw new Error('mock private persistence failure');
        const result = options.persistResults
          ? options.persistResults[Math.min(persistCalls.length - 1, options.persistResults.length - 1)]
          : options.persistResult || { persisted: true, order_number: order.order_number };
        if (result.persisted && result.reason !== 'already_exists') durableWrites.push(order);
        return result;
      },
      generateOrderNumber: (id) => `FL-TEST-${id}`,
    },
    '@/lib/coupons': {
      lookupCoupon: (code) => String(code || '').toUpperCase() === 'SAVE10'
        ? { code: 'SAVE10', percentOff: 10, active: true }
        : null,
      couponDiscount: (coupon, subtotal) => +(subtotal * coupon.percentOff / 100).toFixed(2),
    },
    // No SMTP or GA4 mocks: importing either from this webhook must fail.
  }, {
    process: { env },
    console: { ...quietConsole, error: (...args) => logs.push(args) },
    fetch: async (url, init = {}) => {
      fetchCalls.push({ url: String(url), init });
      assert.ok(init.signal instanceof AbortSignal, `PayPal fetch must be abortable: ${url}`);
      return (options.fetch || defaultFetch)(String(url), init);
    },
    setTimeout: options.setTimeout || setTimeout,
    clearTimeout: options.clearTimeout || clearTimeout,
  });
  return { route, persistCalls, durableWrites, fetchCalls, logs };
}

test('malformed JSON is a safe 400 without PayPal or persistence calls', async () => {
  const harness = makeRoute();
  const response = await harness.route.POST(webhookRequest({}, { raw: '{not-json' }));
  assert.equal(response.status, 400);
  assert.equal(response.data.status, 'malformed_json');
  assert.equal(harness.fetchCalls.length, 0);
  assert.equal(harness.persistCalls.length, 0);
  assert.doesNotMatch(JSON.stringify(response.data), /not-json/);
});

test('missing webhook or PayPal configuration fails closed before network access', async () => {
  for (const name of ['PAYPAL_WEBHOOK_ID', 'PAYPAL_CLIENT_ID', 'PAYPAL_SECRET']) {
    const harness = makeRoute({ env: { [name]: '' } });
    const response = await harness.route.POST(webhookRequest());
    assert.equal(response.status, 500, name);
    assert.equal(response.data.status, 'configuration_error');
    assert.equal(harness.fetchCalls.length, 0, name);
    assert.equal(harness.persistCalls.length, 0, name);
  }
});

test('missing transmission headers are rejected before signature verification', async () => {
  const harness = makeRoute();
  const response = await harness.route.POST(webhookRequest(webhookEvent(), { removeHeaders: ['paypal-transmission-sig'] }));
  assert.equal(response.status, 400);
  assert.equal(response.data.status, 'missing_transmission_headers');
  assert.equal(harness.fetchCalls.length, 0);
  assert.equal(harness.persistCalls.length, 0);
});

test('invalid signature is 401, never reads the order, persists, or fetches cert_url', async () => {
  const event = webhookEvent();
  const harness = makeRoute({ verificationStatus: 'FAILURE' });
  const response = await harness.route.POST(webhookRequest(event));
  assert.equal(response.status, 401);
  assert.equal(response.data.status, 'invalid_signature');
  assert.equal(harness.persistCalls.length, 0);
  assert.equal(harness.fetchCalls.some((call) => call.url.includes('attacker.invalid')), false);
  assert.equal(harness.fetchCalls.some((call) => call.url.includes('/v2/checkout/orders/')), false);
  const verify = harness.fetchCalls.find((call) => call.url.endsWith('/v1/notifications/verify-webhook-signature'));
  assert.ok(verify);
  const body = JSON.parse(verify.init.body);
  assert.equal(body.webhook_id, 'WH-TEST');
  assert.deepEqual(body.webhook_event, event);
  assert.equal(body.transmission_id, transmissionHeaders['paypal-transmission-id']);
  assert.equal(body.transmission_time, transmissionHeaders['paypal-transmission-time']);
  assert.equal(body.cert_url, transmissionHeaders['paypal-cert-url']);
  assert.equal(body.auth_algo, transmissionHeaders['paypal-auth-algo']);
  assert.equal(body.transmission_sig, transmissionHeaders['paypal-transmission-sig']);
});

test('verified non-target events return 200 ignored without order or persistence calls', async () => {
  const harness = makeRoute();
  const response = await harness.route.POST(webhookRequest(webhookEvent('BILLING.SUBSCRIPTION.CREATED')));
  assert.equal(response.status, 200);
  assert.equal(response.data.status, 'ignored');
  assert.equal(harness.persistCalls.length, 0);
  assert.equal(harness.fetchCalls.some((call) => call.url.includes('/v2/checkout/orders/')), false);
});

test('valid COMPLETED event re-reads PayPal and persists only authoritative order data', async () => {
  const event = webhookEvent();
  const harness = makeRoute();
  const response = await harness.route.POST(webhookRequest(event));
  assert.equal(response.status, 200);
  assert.equal(response.data.status, 'persisted');
  assert.equal(response.data.orderId, 'ORDER-1');
  assert.equal(harness.persistCalls.length, 1);
  const saved = harness.persistCalls[0];
  assert.equal(saved.paypal_order_id, 'ORDER-1');
  assert.equal(saved.paypal_capture_id, 'CAP-ORDER-1');
  assert.equal(saved.total, 55);
  assert.equal(saved.currency, 'USD');
  assert.equal(saved.customer.email, 'server-payer@example.test');
  assert.equal(saved.items[0].name, 'Server Product');
  assert.equal(saved.shipping_address.address_line_1, '1 Server Street');
  assert.equal(saved.discount, 5);
  assert.equal(saved.source, 'webhook-paypal-capture-completed');
  const serialized = JSON.stringify(saved);
  assert.doesNotMatch(serialized, /event-attacker|0\.01|XXX|CAPTURE-UNTRUSTED/);
  assert.equal(harness.fetchCalls.filter((call) => call.url.endsWith('/v1/oauth2/token')).length, 1);
  assert.equal(harness.fetchCalls.filter((call) => call.url.endsWith('/v1/notifications/verify-webhook-signature')).length, 1);
  assert.equal(harness.fetchCalls.filter((call) => call.url.endsWith('/v2/checkout/orders/ORDER-1')).length, 1);
});

test('a duplicate event returns already_exists and causes no duplicate durable side effect', async () => {
  const harness = makeRoute({ persistResults: [
    { persisted: true },
    { persisted: true, reason: 'already_exists' },
  ] });
  const first = await harness.route.POST(webhookRequest());
  const duplicate = await harness.route.POST(webhookRequest());
  assert.equal(first.status, 200);
  assert.equal(first.data.status, 'persisted');
  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.data.status, 'already_exists');
  assert.equal(harness.persistCalls.length, 2, 'persistOrder remains the idempotency boundary');
  assert.equal(harness.durableWrites.length, 1, 'duplicate delivery must not create a second durable order');
  // The route has no SMTP or GA4 imports, so neither side effect can repeat.
});

test('a server order that is not COMPLETED stays retryable without persistence', async () => {
  const harness = makeRoute({ order: { ...completedOrder(), status: 'APPROVED' } });
  const response = await harness.route.POST(webhookRequest());
  assert.equal(response.status, 409);
  assert.equal(response.data.status, 'order_not_completed');
  assert.equal(response.data.retryable, true);
  assert.equal(harness.persistCalls.length, 0);
});

test('a reported persistence failure returns retryable non-2xx, never fake success', async () => {
  const harness = makeRoute({ persistResult: { persisted: false, reason: 'no_token' } });
  const response = await harness.route.POST(webhookRequest());
  assert.equal(response.status, 503);
  assert.equal(response.data.status, 'persistence_failed');
  assert.equal(response.data.retryable, true);
});

test('a thrown persistence failure also returns retryable non-2xx without leaking details', async () => {
  const harness = makeRoute({ persistThrows: true });
  const response = await harness.route.POST(webhookRequest());
  assert.equal(response.status, 503);
  assert.equal(response.data.status, 'persistence_failed');
  assert.doesNotMatch(JSON.stringify(response.data), /mock private persistence failure/);
});

test('PayPal verification HTTP failure is non-2xx and cannot reach persistence', async () => {
  const harness = makeRoute({ verificationHttpStatus: 500 });
  const response = await harness.route.POST(webhookRequest());
  assert.equal(response.status, 502);
  assert.equal(response.data.status, 'verification_unavailable');
  assert.equal(harness.persistCalls.length, 0);
  assert.equal(harness.fetchCalls.some((call) => call.url.includes('/v2/checkout/orders/')), false);
});

test('PayPal order lookup rejection is retryable non-2xx without persistence', async () => {
  const harness = makeRoute({ orderHttpStatus: 500 });
  const response = await harness.route.POST(webhookRequest());
  assert.equal(response.status, 502);
  assert.equal(response.data.status, 'order_lookup_failed');
  assert.equal(harness.persistCalls.length, 0);
});

test('a verified COMPLETED event without related order ID is rejected without persistence', async () => {
  const event = webhookEvent();
  delete event.resource.supplementary_data.related_ids.order_id;
  const harness = makeRoute();
  const response = await harness.route.POST(webhookRequest(event));
  assert.equal(response.status, 400);
  assert.equal(response.data.status, 'missing_order_id');
  assert.equal(harness.persistCalls.length, 0);
  assert.equal(harness.fetchCalls.some((call) => call.url.includes('/v2/checkout/orders/')), false);
});

test('refund and dispute event branches are explicit no-op extension points', async () => {
  for (const type of ['PAYMENT.CAPTURE.REFUNDED', 'PAYMENT.CAPTURE.REVERSED', 'CUSTOMER.DISPUTE.CREATED', 'CUSTOMER.DISPUTE.UPDATED', 'CUSTOMER.DISPUTE.RESOLVED']) {
    const harness = makeRoute();
    const response = await harness.route.POST(webhookRequest(webhookEvent(type)));
    assert.equal(response.status, 200, type);
    assert.equal(response.data.status, 'ignored', type);
    assert.equal(harness.persistCalls.length, 0, type);
  }
});

test('a stalled PayPal call is aborted by a finite 20-second deadline and returns non-2xx', async () => {
  const timers = new Set();
  const fakeSetTimeout = (fn, ms) => {
    const timer = { fn, ms, cleared: false };
    timers.add(timer);
    return timer;
  };
  const fakeClearTimeout = (timer) => {
    if (timer) timer.cleared = true;
    timers.delete(timer);
  };
  let tokenSignal;
  const harness = makeRoute({
    setTimeout: fakeSetTimeout,
    clearTimeout: fakeClearTimeout,
    fetch: async (url, init) => {
      if (url.endsWith('/v1/oauth2/token')) {
        tokenSignal = init.signal;
        return new Promise((_, reject) => {
          init.signal.addEventListener('abort', () => reject(new Error('mock abort')), { once: true });
        });
      }
      throw new Error(`Unexpected URL ${url}`);
    },
  });
  const pending = harness.route.POST(webhookRequest());
  for (let i = 0; i < 5 && !tokenSignal; i += 1) await new Promise(setImmediate);
  assert.ok(tokenSignal);
  const timeout = [...timers].find((timer) => timer.ms === 20_000);
  assert.ok(timeout, 'PayPal token request must have a 20-second timeout');
  timeout.fn();
  const response = await pending;
  assert.equal(response.status, 503);
  assert.equal(response.data.status, 'paypal_unavailable');
  assert.equal(tokenSignal.aborted, true);
  assert.equal(harness.persistCalls.length, 0);
});
