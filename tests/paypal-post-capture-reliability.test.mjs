import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const routePath = new URL('app/api/paypal/route.ts', root);
const ga4Path = new URL('lib/ga4-server.ts', root);

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
    Buffer, URL, AbortController, AbortSignal,
    console: { log() {}, warn() {}, error() {}, info() {}, debug() {} },
    process: { env: {} }, setTimeout, clearTimeout,
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
    text: async () => typeof data === 'string' ? data : JSON.stringify(data),
  };
}

function completedOrder(id = 'ORDER-1') {
  return {
    id,
    status: 'COMPLETED',
    payer: { email_address: 'buyer@example.test', name: { given_name: 'Test', surname: 'Buyer' } },
    purchase_units: [{
      items: [{ name: 'Test Sealer', quantity: '1', sku: 'test-sealer', unit_amount: { value: '50.00' } }],
      payments: { captures: [{ id: `CAP-${id}`, amount: { value: '55.99', currency_code: 'USD' } }] },
    }],
  };
}

function apiRequest() {
  return {
    json: async () => ({ orderId: 'ORDER-1', contact: { email: 'buyer@example.test', name: 'Test Buyer' } }),
    headers: { get: () => null },
  };
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

function createFakeTimers() {
  const timers = new Set();
  return {
    timers,
    setTimeout(fn, ms) {
      const timer = { fn, ms, cleared: false };
      timers.add(timer);
      return timer;
    },
    clearTimeout(timer) {
      if (timer) timer.cleared = true;
      timers.delete(timer);
    },
    one(ms) {
      const matches = [...timers].filter((timer) => timer.ms === ms);
      assert.equal(matches.length, 1, `expected one active ${ms}ms timer; got ${matches.length}`);
      return matches[0];
    },
  };
}

async function flush() {
  for (let i = 0; i < 8; i += 1) await new Promise(setImmediate);
}

function makeGa4({ env, fetchImpl, logs, timers }) {
  return loadTsModule(ga4Path, {}, {
    process: { env },
    fetch: fetchImpl || (async () => { throw new Error('Unexpected GA4 fetch'); }),
    console: {
      log() {}, info() {}, debug() {},
      warn: (...args) => logs?.push(['warn', ...args]),
      error: (...args) => logs?.push(['error', ...args]),
    },
    setTimeout: timers?.setTimeout || setTimeout,
    clearTimeout: timers?.clearTimeout || clearTimeout,
  });
}

function makeRoute(options = {}) {
  const persistCalls = [], analyticsCalls = [], emailCalls = [], logs = [];
  const timers = options.timers;
  const routeEnv = {
    PAYPAL_CLIENT_ID: 'test-client',
    PAYPAL_SECRET: 'test-paypal-placeholder',
    ...(options.smtpConfigured === false ? {} : { SMTP_PASS: 'test-smtp-placeholder' }),
  };
  const fetchImpl = options.fetch || (async (url) => {
    if (url.endsWith('/v1/oauth2/token')) return jsonResponse({ access_token: 'token' });
    if (url.endsWith('/ORDER-1/capture')) return jsonResponse(completedOrder());
    if (url.endsWith('/ORDER-1')) return jsonResponse({ id: 'ORDER-1', status: 'APPROVED' });
    throw new Error(`Unexpected fetch ${url}`);
  });
  const consoleMock = {
    log() {}, info() {}, debug() {},
    warn: (...args) => logs.push(['warn', ...args]),
    error: (...args) => logs.push(['error', ...args]),
  };
  const globals = {
    process: { env: routeEnv },
    console: consoleMock,
    fetch: fetchImpl,
    setTimeout: timers?.setTimeout || setTimeout,
    clearTimeout: timers?.clearTimeout || clearTimeout,
  };
  let sendAnalytics = options.sendAnalytics || (async () => 'sent');
  if (options.realGa4) {
    const ga4 = makeGa4({
      env: options.ga4Env || {},
      fetchImpl,
      logs,
      timers,
    });
    sendAnalytics = ga4.sendServerPurchaseEvent;
  }
  const route = loadTsModule(routePath, {
    'next/server': {
      NextResponse: { json: (data, init = {}) => ({ data, status: init.status || 200, ok: (init.status || 200) < 400 }) },
    },
    '@/lib/orders': {
      persistOrder: async (order) => { persistCalls.push(order); return { persisted: true }; },
      generateOrderNumber: (id) => `FL-TEST-${id}`,
    },
    '@/lib/data': { products: [{ slug: 'test-sealer', price: 50 }], AIR_SHIPPING_US: 10 },
    '@/lib/ga4-server': {
      sendServerPurchaseEvent: (params) => {
        analyticsCalls.push(params);
        return sendAnalytics(params);
      },
    },
    '@/lib/coupons': { lookupCoupon: () => null, couponDiscount: () => 0 },
    '@/lib/smtp': {
      sendEmail: (message) => {
        emailCalls.push(message);
        return options.sendEmail ? options.sendEmail(message) : Promise.resolve('mock-message-id');
      },
    },
  }, globals);
  return { route, persistCalls, analyticsCalls, emailCalls, logs, timers };
}

const ga4Params = {
  orderId: 'ORDER-1',
  items: [],
  value: 55.99,
  currency: 'USD',
  cookieHeader: null,
};

test('GA4 missing measurement ID reports the exact variable and returns not_configured', async () => {
  const logs = [];
  let fetchCalls = 0;
  const ga4 = makeGa4({
    env: { GA4_API_SECRET: 'configured-placeholder' },
    fetchImpl: async () => { fetchCalls += 1; return jsonResponse({}, 204); },
    logs,
  });
  const status = await ga4.sendServerPurchaseEvent(ga4Params);
  assert.equal(status, 'not_configured');
  assert.equal(fetchCalls, 0);
  const text = logs.flat().join(' ');
  assert.match(text, /GA4_MEASUREMENT_ID/);
  assert.doesNotMatch(text, /GA4_API_SECRET not configured/);
});

test('GA4 missing API secret reports the exact variable and returns not_configured', async () => {
  const logs = [];
  let fetchCalls = 0;
  const ga4 = makeGa4({
    env: { GA4_MEASUREMENT_ID: 'G-TEST' },
    fetchImpl: async () => { fetchCalls += 1; return jsonResponse({}, 204); },
    logs,
  });
  const status = await ga4.sendServerPurchaseEvent(ga4Params);
  assert.equal(status, 'not_configured');
  assert.equal(fetchCalls, 0);
  const text = logs.flat().join(' ');
  assert.match(text, /GA4_API_SECRET/);
  assert.doesNotMatch(text, /GA4_MEASUREMENT_ID not configured/);
});

test('GA4 accepted purchase returns sent', async () => {
  const ga4 = makeGa4({
    env: { GA4_MEASUREMENT_ID: 'G-TEST', GA4_API_SECRET: 'configured-placeholder' },
    fetchImpl: async () => jsonResponse({}, 204),
  });
  assert.equal(await ga4.sendServerPurchaseEvent(ga4Params), 'sent');
});

test('GA4 rejection returns failed without logging the upstream response body', async () => {
  const logs = [];
  const ga4 = makeGa4({
    env: { GA4_MEASUREMENT_ID: 'G-TEST', GA4_API_SECRET: 'configured-placeholder' },
    fetchImpl: async () => jsonResponse('sensitive-upstream-body', 400),
    logs,
  });
  assert.equal(await ga4.sendServerPurchaseEvent(ga4Params), 'failed');
  const text = logs.flat().join(' ');
  assert.match(text, /400/);
  assert.doesNotMatch(text, /sensitive-upstream-body/);
});

test('fresh capture waits for GA4 settlement and exposes its status', async () => {
  const analytics = deferred();
  const harness = makeRoute({ sendAnalytics: () => analytics.promise });
  let settled = false;
  const pending = harness.route.PUT(apiRequest());
  pending.finally(() => { settled = true; }).catch(() => {});
  await flush();
  assert.equal(harness.analyticsCalls.length, 1);
  const settledBeforeRelease = settled;
  analytics.resolve('sent');
  const response = await pending;
  assert.equal(settledBeforeRelease, false, 'capture response must not outrun the GA4 promise');
  assert.equal(response.data.success, true);
  assert.equal(response.data.analyticsStatus, 'sent');
});

test('GA4 rejection preserves payment success and returns analyticsStatus failed', async () => {
  const harness = makeRoute({ sendAnalytics: async () => { throw new Error('mock GA4 rejection'); } });
  const response = await harness.route.PUT(apiRequest());
  assert.equal(response.data.success, true);
  assert.equal(response.data.analyticsStatus, 'failed');
  assert.equal(response.data.merchantEmailStatus, 'sent');
  assert.doesNotMatch(JSON.stringify(response.data), /mock GA4 rejection|test-paypal-placeholder|test-smtp-placeholder/);
});

test('GA4 timeout aborts, settles fresh capture, and preserves payment success', async () => {
  const timers = createFakeTimers();
  let ga4Signal;
  const harness = makeRoute({
    realGa4: true,
    ga4Env: { GA4_MEASUREMENT_ID: 'G-TEST', GA4_API_SECRET: 'configured-placeholder' },
    timers,
    fetch: async (url, init = {}) => {
      if (url.endsWith('/v1/oauth2/token')) return jsonResponse({ access_token: 'token' });
      if (url.endsWith('/ORDER-1/capture')) return jsonResponse(completedOrder());
      if (url.endsWith('/ORDER-1')) return jsonResponse({ id: 'ORDER-1', status: 'APPROVED' });
      if (url.startsWith('https://www.google-analytics.com/')) {
        ga4Signal = init.signal;
        return new Promise((_, reject) => {
          init.signal?.addEventListener('abort', () => {
            const error = new Error('mock GA4 abort');
            error.name = 'AbortError';
            reject(error);
          }, { once: true });
        });
      }
      throw new Error(`Unexpected fetch ${url}`);
    },
  });
  const pending = harness.route.PUT(apiRequest());
  await flush();
  assert.ok(ga4Signal, 'GA4 fetch should have started');
  const timeout = timers.one(8000);
  timeout.fn();
  const response = await pending;
  assert.equal(ga4Signal.aborted, true);
  assert.equal(response.data.success, true);
  assert.equal(response.data.analyticsStatus, 'failed');
  assert.equal(response.data.merchantEmailStatus, 'sent');
});

test('fresh capture waits for merchant email settlement and exposes its status', async () => {
  const merchant = deferred();
  const harness = makeRoute({
    sendEmail: (message) => Array.isArray(message.to) ? merchant.promise : Promise.resolve('customer-id'),
  });
  let settled = false;
  const pending = harness.route.PUT(apiRequest());
  pending.finally(() => { settled = true; }).catch(() => {});
  await flush();
  assert.equal(harness.emailCalls.filter((mail) => Array.isArray(mail.to)).length, 1);
  const settledBeforeRelease = settled;
  merchant.resolve('merchant-id');
  const response = await pending;
  assert.equal(settledBeforeRelease, false, 'capture response must not outrun the merchant email promise');
  assert.equal(response.data.success, true);
  assert.equal(response.data.merchantEmailStatus, 'sent');
});

test('merchant email rejection preserves payment success and returns merchantEmailStatus failed', async () => {
  const harness = makeRoute({
    sendEmail: async (message) => {
      if (Array.isArray(message.to)) throw new Error('mock merchant SMTP rejection');
      return 'customer-id';
    },
  });
  const response = await harness.route.PUT(apiRequest());
  assert.equal(response.data.success, true);
  assert.equal(response.data.confirmationEmailStatus, 'sent');
  assert.equal(response.data.merchantEmailStatus, 'failed');
  assert.equal(response.data.analyticsStatus, 'sent');
  assert.doesNotMatch(JSON.stringify(response.data), /mock merchant SMTP rejection|test-paypal-placeholder|test-smtp-placeholder/);
});

test('merchant email timeout settles fresh capture and preserves payment success', async () => {
  const timers = createFakeTimers();
  const harness = makeRoute({
    timers,
    sendEmail: (message) => Array.isArray(message.to)
      ? new Promise(() => {})
      : Promise.resolve('customer-id'),
  });
  const pending = harness.route.PUT(apiRequest());
  await flush();
  assert.equal(harness.emailCalls.filter((mail) => Array.isArray(mail.to)).length, 1);
  const timeout = timers.one(8000);
  timeout.fn();
  const response = await pending;
  assert.equal(response.data.success, true);
  assert.equal(response.data.merchantEmailStatus, 'failed');
  assert.equal(response.data.confirmationEmailStatus, 'sent');
  assert.equal(response.data.analyticsStatus, 'sent');
  assert.equal(timeout.cleared, true);
});

test('missing GA4 and SMTP configuration returns explicit non-sensitive statuses', async () => {
  const harness = makeRoute({ realGa4: true, ga4Env: {}, smtpConfigured: false });
  const response = await harness.route.PUT(apiRequest());
  assert.equal(response.data.success, true);
  assert.equal(response.data.analyticsStatus, 'not_configured');
  assert.equal(response.data.confirmationEmailStatus, 'not_configured');
  assert.equal(response.data.merchantEmailStatus, 'not_configured');
  assert.equal(harness.emailCalls.length, 0);
  assert.doesNotMatch(JSON.stringify(response.data), /test-paypal-placeholder|test-smtp-placeholder/);
});

test('fresh plus alreadyCaptured emits GA4 and merchant email exactly once', async () => {
  let complete = false;
  const harness = makeRoute({ fetch: async (url) => {
    if (url.endsWith('/v1/oauth2/token')) return jsonResponse({ access_token: 'token' });
    if (url.endsWith('/ORDER-1/capture')) {
      complete = true;
      return jsonResponse(completedOrder());
    }
    if (url.endsWith('/ORDER-1')) {
      return jsonResponse(complete ? completedOrder() : { id: 'ORDER-1', status: 'APPROVED' });
    }
    throw new Error(`Unexpected fetch ${url}`);
  } });
  const fresh = await harness.route.PUT(apiRequest());
  const repeated = await harness.route.PUT(apiRequest());
  assert.equal(fresh.data.success, true);
  assert.equal(repeated.data.success, true);
  assert.equal(repeated.data.alreadyCaptured, true);
  assert.equal(harness.analyticsCalls.length, 1);
  assert.equal(harness.emailCalls.filter((mail) => Array.isArray(mail.to)).length, 1);
  assert.equal(harness.emailCalls.filter((mail) => mail.to === 'buyer@example.test').length, 1);
});
