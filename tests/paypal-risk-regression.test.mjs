import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const componentPath = new URL('components/PayPalButtons.tsx', root);
const successPath = new URL('app/checkout/success/page.tsx', root);
const routePath = new URL('app/api/paypal/route.ts', root);
const quietConsole = { log() {}, warn() {}, error() {}, info() {}, debug() {} };

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => typeof data === 'string' ? data : JSON.stringify(data),
  };
}

function loadTsModule(url, mocks = {}, globals = {}) {
  const source = readFileSync(url, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
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
    setTimeout: (fn) => { fn(); return 1; },
    clearTimeout() {},
    setInterval: () => 1,
    clearInterval() {},
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

let activeRuntime;
const React = {
  useState: (...args) => activeRuntime.useState(...args),
  useRef: (...args) => activeRuntime.useRef(...args),
  useEffect: (...args) => activeRuntime.useEffect(...args),
  useCallback: (...args) => activeRuntime.useCallback(...args),
  Suspense: Symbol('Suspense'),
  Fragment: Symbol('Fragment'),
};
const jsxRuntime = {
  Fragment: React.Fragment,
  jsx: (type, props, key) => ({ type, props: props || {}, key }),
  jsxs: (type, props, key) => ({ type, props: props || {}, key }),
};

function createRuntime() {
  const states = [];
  const refs = [];
  const callbacks = [];
  const effects = [];
  let stateCursor = 0;
  let refCursor = 0;
  let callbackCursor = 0;
  let effectCursor = 0;
  let pendingEffects = [];
  const sameDeps = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const runtime = {
    states,
    refs,
    useState(initial) {
      const i = stateCursor++;
      if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial;
      return [states[i], (next) => { states[i] = typeof next === 'function' ? next(states[i]) : next; }];
    },
    useRef(initial) {
      const i = refCursor++;
      if (!(i in refs)) refs[i] = { current: initial };
      return refs[i];
    },
    useCallback(fn, deps) {
      const i = callbackCursor++;
      const previous = callbacks[i];
      if (!previous || !sameDeps(previous.deps, deps)) callbacks[i] = { fn, deps };
      return callbacks[i].fn;
    },
    useEffect(fn, deps) {
      const i = effectCursor++;
      const previous = effects[i];
      if (!previous || !deps || !sameDeps(previous.deps, deps)) {
        effects[i] = { deps };
        pendingEffects.push(fn);
      }
    },
    render(component, props = {}) {
      activeRuntime = runtime;
      stateCursor = refCursor = callbackCursor = effectCursor = 0;
      return component(props);
    },
    async flushEffects() {
      activeRuntime = runtime;
      const queued = pendingEffects;
      pendingEffects = [];
      for (const effect of queued) await effect();
    },
  };
  return runtime;
}

function findNode(tree, predicate) {
  if (!tree || typeof tree !== 'object') return null;
  if (predicate(tree)) return tree;
  const children = tree.props?.children;
  for (const child of Array.isArray(children) ? children : [children]) {
    const found = findNode(child, predicate);
    if (found) return found;
  }
  return null;
}

function textOf(tree) {
  if (tree === null || tree === undefined || typeof tree === 'boolean') return '';
  if (typeof tree === 'string' || typeof tree === 'number') return String(tree);
  if (Array.isArray(tree)) return tree.map(textOf).join(' ');
  return textOf(tree.props?.children);
}

const documentMock = {
  head: { appendChild() {} },
  createElement: () => ({}),
  getElementById: () => ({ innerHTML: '' }),
};
let walletConfig;
let cardConfig;
const cardSubmitMock = { fn: async () => {} };
const paypalMock = {
  Buttons(config) {
    walletConfig = config;
    return { render: async () => {} };
  },
  CardFields(config) {
    cardConfig = config;
    return {
      isEligible: () => true,
      submit: (...args) => cardSubmitMock.fn(...args),
      NumberField: () => ({ render() {} }),
      ExpiryField: () => ({ render() {} }),
      CVVField: () => ({ render() {} }),
    };
  },
};
const sessionStorageValues = new Map();
const sessionStorageMock = {
  getItem: (key) => sessionStorageValues.has(key) ? sessionStorageValues.get(key) : null,
  setItem: (key, value) => sessionStorageValues.set(key, String(value)),
  removeItem: (key) => sessionStorageValues.delete(key),
  clear: () => sessionStorageValues.clear(),
};
const windowMock = {
  paypal: paypalMock,
  localStorage: { setItem() {}, getItem() { return null; }, removeItem() {} },
  sessionStorage: sessionStorageMock,
};
let componentFetch = async () => { throw new Error('Unexpected component fetch'); };
const componentModule = loadTsModule(componentPath, {
  react: React,
  'react/jsx-runtime': jsxRuntime,
  '@/lib/attribution': { getAttribution: () => ({ utm_source: 'test' }) },
}, {
  window: windowMock,
  document: documentMock,
  localStorage: windowMock.localStorage,
  fetch: (...args) => componentFetch(...args),
  process: { env: { NEXT_PUBLIC_PAYPAL_CLIENT_ID: 'test-client' } },
  // Real timers are required now that browser requests have finite deadlines;
  // the shared default above intentionally fires timers immediately for other fixtures.
  setTimeout: globalThis.setTimeout,
  clearTimeout: globalThis.clearTimeout,
});

const baseProps = {
  items: [{ product: { name: 'Test Sealer', price: 50, slug: 'test-sealer' }, quantity: 1 }],
  totalPrice: 55.99,
  shipping: 5.99,
  shippingMethod: 'standard',
  shippingInfo: {
    name: 'Test Buyer', address: '1 Test Street', city: 'Testville', state: 'TS',
    postalCode: '00000', country: 'US', phone: '+10000000000',
  },
  contactEmail: 'buyer@example.test',
  onSuccess() {},
  onError() {},
};

async function renderPayPalButtons(overrides = {}) {
  const runtime = createRuntime();
  const props = { ...baseProps, ...overrides };
  let tree = runtime.render(componentModule.default, props);
  await runtime.flushEffects();
  const slot = findNode(tree, (node) => node.props?.ref);
  if (slot) slot.props.ref.current = { innerHTML: '' };
  tree = runtime.render(componentModule.default, props);
  await runtime.flushEffects();
  tree = runtime.render(componentModule.default, props);
  return { runtime, props, tree };
}

function makeRoute(options = {}) {
  const persistCalls = [];
  const analyticsCalls = [];
  const emailCalls = [];
  const emailSideEffectCounts = [];
  const route = loadTsModule(routePath, {
    'next/server': {
      NextResponse: {
        json: (data, init = {}) => ({ data, status: init.status || 200, ok: (init.status || 200) < 400 }),
      },
    },
    '@/lib/orders': {
      persistOrder: async (order) => { persistCalls.push(order); return { persisted: true, reason: 'created' }; },
      generateOrderNumber: (id) => `FL-TEST-${id}`,
    },
    '@/lib/data': { products: [{ slug: 'test-sealer', price: 50 }], AIR_SHIPPING_US: 10 },
    '@/lib/ga4-server': {
      sendServerPurchaseEvent: (params) => { analyticsCalls.push(params); return Promise.resolve(); },
    },
    '@/lib/coupons': {
      lookupCoupon: (code) => String(code || '').toUpperCase() === 'SAVE10'
        ? { code: 'SAVE10', percentOff: 10, active: true }
        : null,
      couponDiscount: (coupon, subtotal) => +(subtotal * coupon.percentOff / 100).toFixed(2),
    },
    '@/lib/smtp': {
      sendEmail: async (message) => {
        emailSideEffectCounts.push({ persisted: persistCalls.length, analytics: analyticsCalls.length });
        emailCalls.push(message);
        if (options.emailError) throw new Error('mock SMTP rejection');
      },
    },
  }, {
    process: { env: { PAYPAL_CLIENT_ID: 'test-client', PAYPAL_SECRET: 'test-secret', SMTP_PASS: 'test-pass' } },
    fetch: async (url, init = {}) => {
      assert.ok(init.signal instanceof AbortSignal, `PayPal fetch must be abortable: ${url}`);
      return (options.fetch || (async () => { throw new Error('Unexpected PayPal fetch'); }))(url, init);
    },
    setTimeout: options.setTimeout || globalThis.setTimeout,
    clearTimeout: options.clearTimeout || globalThis.clearTimeout,
  });
  return { route, persistCalls, analyticsCalls, emailCalls, emailSideEffectCounts };
}

function apiRequest(body) {
  return { json: async () => body, headers: { get: () => null } };
}

function completedOrder(id = 'ORDER-1', withPayerEmail = false) {
  return {
    id,
    status: 'COMPLETED',
    payer: withPayerEmail ? { email_address: 'paypal@example.test', name: { given_name: 'Pay', surname: 'Pal' } } : {},
    purchase_units: [{
      custom_id: 'phone:+10000000000|coupon:SAVE10',
      items: [{ name: 'Test Sealer', quantity: '1', sku: 'test-sealer', unit_amount: { value: '50.00' } }],
      payments: { captures: [{ id: `CAP-${id}`, amount: { value: '55.00', currency_code: 'USD' }, create_time: '2026-11-19T00:00:00Z' }] },
    }],
  };
}

const captureBody = { orderId: 'ORDER-1', contact: { email: 'buyer@example.test', name: 'Test Buyer', phone: '+10000000000' } };

test('embedded createOrder forwards all four shipping-method × coupon combinations', async () => {
  for (const shippingMethod of ['standard', 'faster']) {
    for (const couponCode of [undefined, 'SAVE10']) {
      const bodies = [];
      componentFetch = async (url, init) => {
        assert.equal(url, '/api/paypal');
        assert.equal(init.method, 'POST');
        bodies.push(JSON.parse(init.body));
        return jsonResponse({ orderId: 'CREATED-ORDER' });
      };
      await renderPayPalButtons({ shippingMethod, couponCode });
      assert.equal(await walletConfig.createOrder(), 'CREATED-ORDER');
      assert.equal(bodies.length, 1);
      assert.equal(bodies[0].shippingMethod, shippingMethod);
      assert.equal(bodies[0].couponCode, couponCode);
      assert.equal(bodies[0].shippingCountry, 'US');
    }
  }
});

test('POST amount and breakdown match standard/faster × coupon/no-coupon totals', async () => {
  const cases = [
    ['standard', undefined, '55.99', '5.99', undefined],
    ['standard', 'SAVE10', '50.99', '5.99', '5.00'],
    ['faster', undefined, '60.00', '10.00', undefined],
    ['faster', 'SAVE10', '55.00', '10.00', '5.00'],
  ];
  for (const [shippingMethod, couponCode, total, shipping, discount] of cases) {
    let paypalBody;
    const harness = makeRoute({ fetch: async (url, init = {}) => {
      if (url.endsWith('/v1/oauth2/token')) return jsonResponse({ access_token: 'token' });
      if (url.endsWith('/v2/checkout/orders')) {
        paypalBody = JSON.parse(init.body);
        return jsonResponse({ id: 'CREATED-ORDER', links: [{ rel: 'approve', href: 'https://example.test/approve' }] });
      }
      throw new Error(`Unexpected URL ${url}`);
    } });
    const response = await harness.route.POST(apiRequest({
      items: [{ slug: 'test-sealer', name: 'Test Sealer', quantity: 1 }],
      shippingMethod, couponCode, shippingAddress: baseProps.shippingInfo,
    }));
    assert.equal(response.data.orderId, 'CREATED-ORDER');
    const amount = paypalBody.purchase_units[0].amount;
    assert.equal(amount.value, total);
    assert.equal(amount.breakdown.shipping.value, shipping);
    assert.equal(amount.breakdown.discount?.value, discount);
  }
});

let successSearch = new URLSearchParams();
let successFetch = async () => { throw new Error('Unexpected success-page fetch'); };
const successAnalytics = [];
const clearCartCalls = [];
const successModule = loadTsModule(successPath, {
  react: React,
  'react/jsx-runtime': jsxRuntime,
  'next/navigation': { useSearchParams: () => successSearch },
  'next/link': { default: (props) => jsxRuntime.jsx('a', props) },
  '@/lib/cart-context': { useCart: () => ({ clearCart: () => clearCartCalls.push(1), items: [] }) },
  '@/lib/ga4': { trackPurchaseOnce: (...args) => successAnalytics.push(args) },
  '@/lib/attribution': { getAttribution: () => ({}) },
}, {
  window: windowMock,
  localStorage: windowMock.localStorage,
  fetch: (...args) => successFetch(...args),
  setTimeout,
  clearTimeout,
});

async function renderSuccess(query) {
  successSearch = new URLSearchParams(query);
  const runtime = createRuntime();
  const shell = runtime.render(successModule.default);
  const content = shell.props.children;
  let tree = runtime.render(content.type);
  await runtime.flushEffects();
  await new Promise(setImmediate);
  tree = runtime.render(content.type);
  return { runtime, tree, content };
}

test('success page rejects bare, token-only, method-only, and session-only returns', async () => {
  for (const query of ['', 'token=ORDER-1', 'payment_method=paypal', 'session_id=cs_test_unverified']) {
    const { tree } = await renderSuccess(query);
    const text = textOf(tree);
    assert.doesNotMatch(text, /Thank You|order has been placed successfully/i, `unsafe success for ${query || 'bare URL'}`);
    assert.match(text, /verify|invalid|unable/i);
  }
});

test('normal PayPal return stays verifying until mocked capture succeeds', async () => {
  let resolveCapture;
  successFetch = () => new Promise((resolve) => { resolveCapture = resolve; });
  successSearch = new URLSearchParams('payment_method=paypal&token=ORDER-1&PayerID=PAYER');
  const runtime = createRuntime();
  const shell = runtime.render(successModule.default);
  const content = shell.props.children;
  let tree = runtime.render(content.type);
  const effects = runtime.flushEffects();
  await new Promise(setImmediate);
  tree = runtime.render(content.type);
  assert.match(textOf(tree), /Verifying/i);
  assert.doesNotMatch(textOf(tree), /Thank You/i);
  resolveCapture(jsonResponse({ success: true, orderId: 'ORDER-1', amount: 55, payerEmail: 'buyer@example.test', items: [] }));
  await effects;
  await new Promise(setImmediate);
  tree = runtime.render(content.type);
  assert.match(textOf(tree), /Thank You/i);
});

test('capture without payer email falls back to checkout contact for customer and merchant mail', async () => {
  const harness = makeRoute({ fetch: async (url) => {
    if (url.endsWith('/v1/oauth2/token')) return jsonResponse({ access_token: 'token' });
    if (url.endsWith('/ORDER-1/capture')) return jsonResponse(completedOrder('ORDER-1', false));
    if (url.endsWith('/ORDER-1')) return jsonResponse({ id: 'ORDER-1', status: 'APPROVED' });
    throw new Error(`Unexpected URL ${url}`);
  } });
  const response = await harness.route.PUT(apiRequest(captureBody));
  await new Promise(setImmediate);
  assert.equal(response.data.success, true);
  const customer = harness.emailCalls.find((mail) => mail.to === 'buyer@example.test');
  assert.ok(customer, 'customer confirmation must use contact.email fallback');
  const merchant = harness.emailCalls.find((mail) => Array.isArray(mail.to));
  assert.match(merchant?.html || '', /buyer@example\.test/);
  assert.equal(response.data.confirmationEmailStatus, 'sent');
  assert.deepEqual(harness.emailSideEffectCounts[0], { persisted: 1, analytics: 1 },
    'order persistence and GA4 must start before any potentially slow customer SMTP wait');
});

test('SMTP rejection returns failed status and success page never claims it was sent', async () => {
  const harness = makeRoute({
    emailError: true,
    fetch: async (url) => {
      if (url.endsWith('/v1/oauth2/token')) return jsonResponse({ access_token: 'token' });
      if (url.endsWith('/ORDER-1/capture')) return jsonResponse(completedOrder('ORDER-1', false));
      if (url.endsWith('/ORDER-1')) return jsonResponse({ id: 'ORDER-1', status: 'APPROVED' });
      throw new Error(`Unexpected URL ${url}`);
    },
  });
  const response = await harness.route.PUT(apiRequest(captureBody));
  assert.equal(response.data.success, true);
  assert.equal(response.data.confirmationEmailStatus, 'failed');

  successFetch = async () => jsonResponse({
    success: true,
    orderId: 'ORDER-1',
    amount: 55,
    payerEmail: 'buyer@example.test',
    confirmationEmailStatus: 'failed',
    items: [],
  });
  const { tree } = await renderSuccess('payment_method=paypal&token=ORDER-1');
  const text = textOf(tree);
  assert.match(text, /could not confirm that a confirmation email was sent/i);
  assert.doesNotMatch(text, /confirmation email has been sent/i);
});

test('embedded first-capture email failure survives success-page alreadyCaptured verification', async () => {
  sessionStorageMock.clear();
  componentFetch = async (url, init) => {
    assert.equal(url, '/api/paypal');
    assert.equal(init.method, 'PUT');
    return jsonResponse({
      success: true,
      orderId: 'ORDER-1',
      confirmationEmailStatus: 'failed',
      payerEmail: 'buyer@example.test',
    });
  };
  const successCalls = [];
  await renderPayPalButtons({ onSuccess: (orderId) => successCalls.push(orderId) });
  await walletConfig.onApprove({ orderID: 'ORDER-1' }, {});
  assert.deepEqual(successCalls, ['ORDER-1']);
  assert.equal(sessionStorageMock.getItem('freshlock_confirmation_email_ORDER-1'), 'failed');

  successFetch = async () => jsonResponse({
    success: true,
    alreadyCaptured: true,
    orderId: 'ORDER-1',
    amount: 55,
    payerEmail: 'buyer@example.test',
    confirmationEmailStatus: 'unavailable',
    items: [],
  });
  const { tree } = await renderSuccess('payment_method=paypal&token=ORDER-1');
  const text = textOf(tree);
  assert.match(text, /could not confirm that a confirmation email was sent/i);
  assert.doesNotMatch(text, /confirmation email has been sent/i);
  assert.equal(sessionStorageMock.getItem('freshlock_confirmation_email_ORDER-1'), null);
});

test('PayPal capture timeout aborts, settles, and allows a safe completed-order recheck', async () => {
  const timers = new Set();
  const fakeSetTimeout = (fn, ms) => {
    const timer = { fn, ms };
    timers.add(timer);
    return timer;
  };
  const fakeClearTimeout = (timer) => timers.delete(timer);
  let captureSignal;
  let completed = false;
  const harness = makeRoute({
    setTimeout: fakeSetTimeout,
    clearTimeout: fakeClearTimeout,
    fetch: async (url, init = {}) => {
      if (url.endsWith('/v1/oauth2/token')) return jsonResponse({ access_token: 'token' });
      if (url.endsWith('/ORDER-1/capture')) {
        return new Promise((_, reject) => {
          captureSignal = init.signal;
          init.signal.addEventListener('abort', () => reject(new Error('mock PayPal abort')), { once: true });
        });
      }
      if (url.endsWith('/ORDER-1')) {
        return jsonResponse(completed ? completedOrder('ORDER-1') : { id: 'ORDER-1', status: 'APPROVED' });
      }
      throw new Error(`Unexpected URL ${url}`);
    },
  });
  const pending = harness.route.PUT(apiRequest(captureBody));
  for (let i = 0; i < 5 && !captureSignal; i += 1) await new Promise(setImmediate);
  assert.ok(captureSignal, 'capture fetch should have started');
  const timeout = [...timers].find((timer) => timer.ms === 20_000);
  assert.ok(timeout, 'capture should have a 20-second application timeout');
  timeout.fn();
  const timedOut = await pending;
  assert.equal(timedOut.status, 500);
  assert.equal(captureSignal.aborted, true);

  completed = true;
  const retry = await harness.route.PUT(apiRequest(captureBody));
  assert.equal(retry.data.success, true);
  assert.equal(retry.data.alreadyCaptured, true);
});

test('PayPal response-body timeout aborts JSON parsing and settles the capture request', async () => {
  const timers = new Set();
  const fakeSetTimeout = (fn, ms) => {
    const timer = { fn, ms };
    timers.add(timer);
    return timer;
  };
  const fakeClearTimeout = (timer) => timers.delete(timer);
  let captureSignal;
  let completed = false;
  const harness = makeRoute({
    setTimeout: fakeSetTimeout,
    clearTimeout: fakeClearTimeout,
    fetch: async (url, init = {}) => {
      if (url.endsWith('/v1/oauth2/token')) return jsonResponse({ access_token: 'token' });
      if (url.endsWith('/ORDER-1/capture')) {
        captureSignal = init.signal;
        return {
          ok: true,
          status: 201,
          json: () => new Promise((_, reject) => {
            init.signal.addEventListener('abort', () => reject(new Error('mock PayPal body abort')), { once: true });
          }),
        };
      }
      if (url.endsWith('/ORDER-1')) {
        return jsonResponse(completed ? completedOrder('ORDER-1') : { id: 'ORDER-1', status: 'APPROVED' });
      }
      throw new Error(`Unexpected URL ${url}`);
    },
  });
  const pending = harness.route.PUT(apiRequest(captureBody));
  for (let i = 0; i < 5 && !captureSignal; i += 1) await new Promise(setImmediate);
  assert.ok(captureSignal, 'capture response headers should have arrived');
  const timeout = [...timers].find((timer) => timer.ms === 20_000);
  assert.ok(timeout, 'body parsing must remain covered by the 20-second timeout');
  timeout.fn();
  const timedOut = await pending;
  assert.equal(timedOut.status, 502);
  assert.equal(captureSignal.aborted, true);

  completed = true;
  const retry = await harness.route.PUT(apiRequest(captureBody));
  assert.equal(retry.data.success, true);
  assert.equal(retry.data.alreadyCaptured, true);
});

test('GA4 purchase is emitted only for fresh capture, not alreadyCaptured or browser repeat', async () => {
  let complete = false;
  const harness = makeRoute({ fetch: async (url) => {
    if (url.endsWith('/v1/oauth2/token')) return jsonResponse({ access_token: 'token' });
    if (url.endsWith('/ORDER-1/capture')) { complete = true; return jsonResponse(completedOrder('ORDER-1')); }
    if (url.endsWith('/ORDER-1')) return jsonResponse(complete ? completedOrder('ORDER-1') : { id: 'ORDER-1', status: 'APPROVED' });
    throw new Error(`Unexpected URL ${url}`);
  } });
  const fresh = await harness.route.PUT(apiRequest(captureBody));
  const repeated = await harness.route.PUT(apiRequest(captureBody));
  assert.equal(fresh.data.success, true);
  assert.equal(repeated.data.alreadyCaptured, true);
  assert.equal(harness.analyticsCalls.length, 1, 'fresh + alreadyCaptured must produce one server purchase event');
  successAnalytics.length = 0;
  successFetch = async () => jsonResponse({ success: true, orderId: 'ORDER-1', amount: 55, items: [] });
  await renderSuccess('payment_method=paypal&token=ORDER-1');
  assert.equal(successAnalytics.length, 0, 'server-side fresh capture is the single purchase emission point');
});

test('concurrent PUTs use one capture request and already-captured retry is idempotent success', async () => {
  let complete = false;
  let captureCalls = 0;
  let requestId;
  const harness = makeRoute({ fetch: async (url, init = {}) => {
    if (url.endsWith('/v1/oauth2/token')) return jsonResponse({ access_token: 'token' });
    if (url.endsWith('/ORDER-1/capture')) {
      captureCalls += 1;
      requestId ||= init.headers?.['PayPal-Request-Id'];
      await new Promise(setImmediate);
      if (captureCalls > 1 || complete) {
        return jsonResponse({ name: 'UNPROCESSABLE_ENTITY', details: [{ issue: 'ORDER_ALREADY_CAPTURED' }] }, 422);
      }
      complete = true;
      return jsonResponse(completedOrder('ORDER-1'));
    }
    if (url.endsWith('/ORDER-1')) return jsonResponse(complete ? completedOrder('ORDER-1') : { id: 'ORDER-1', status: 'APPROVED' });
    throw new Error(`Unexpected URL ${url}`);
  } });
  const [first, second] = await Promise.all([
    harness.route.PUT(apiRequest(captureBody)),
    harness.route.PUT(apiRequest(captureBody)),
  ]);
  await new Promise(setImmediate);
  assert.equal(first.data.success, true);
  assert.equal(second.data.success, true);
  assert.equal(captureCalls, 1, 'same-order in-flight requests must coalesce');
  assert.equal(requestId, 'freshlock-capture-ORDER-1');
  assert.equal(harness.analyticsCalls.length, 1);
  assert.equal(harness.emailCalls.filter((mail) => mail.to === 'buyer@example.test').length, 1);
});

test('ORDER_ALREADY_CAPTURED re-queries COMPLETED order without repeating side effects', async () => {
  let complete = false;
  let captureCalls = 0;
  const harness = makeRoute({ fetch: async (url, init = {}) => {
    if (url.endsWith('/v1/oauth2/token')) return jsonResponse({ access_token: 'token' });
    if (url.endsWith('/ORDER-1/capture')) {
      captureCalls += 1;
      assert.equal(init.headers?.['PayPal-Request-Id'], 'freshlock-capture-ORDER-1');
      complete = true;
      return jsonResponse({ name: 'UNPROCESSABLE_ENTITY', details: [{ issue: 'ORDER_ALREADY_CAPTURED' }] }, 422);
    }
    if (url.endsWith('/ORDER-1')) return jsonResponse(complete ? completedOrder('ORDER-1') : { id: 'ORDER-1', status: 'APPROVED' });
    throw new Error(`Unexpected URL ${url}`);
  } });
  const response = await harness.route.PUT(apiRequest(captureBody));
  assert.equal(response.data.success, true);
  assert.equal(response.data.alreadyCaptured, true);
  assert.equal(captureCalls, 1);
  assert.equal(harness.analyticsCalls.length, 0);
  assert.equal(harness.emailCalls.filter((mail) => mail.to === 'buyer@example.test').length, 0);
  assert.equal(harness.persistCalls.length, 1, 'idempotent persistence/backfill still runs');
});

test('delayed capture keeps double-clicked card submit to one submit and one PUT', async () => {
  let resolvePut;
  const putBodies = [];
  componentFetch = async (url, init) => {
    assert.equal(init.method, 'PUT');
    putBodies.push(JSON.parse(init.body));
    await new Promise((resolve) => { resolvePut = resolve; });
    return jsonResponse({ success: true, orderId: 'ORDER-1' });
  };
  let submitCalls = 0;
  cardSubmitMock.fn = async () => {
    submitCalls += 1;
    await Promise.all([
      cardConfig.onApprove({ orderID: 'ORDER-1' }),
      cardConfig.onApprove({ orderID: 'ORDER-1' }),
    ]);
  };
  const { runtime, props } = await renderPayPalButtons();
  let tree = runtime.render(componentModule.default, props);
  let button = findNode(tree, (node) => node.type === 'button' && node.props?.onClick);
  assert.ok(button);
  const firstClick = button.props.onClick();
  const secondClick = button.props.onClick();
  tree = runtime.render(componentModule.default, props);
  button = findNode(tree, (node) => node.type === 'button' && node.props?.onClick);
  assert.equal(button.props.disabled, true, 'button must remain disabled while PUT is pending');
  assert.equal(submitCalls, 1);
  assert.equal(putBodies.length, 1);
  resolvePut();
  await Promise.all([firstClick, secondClick]);
  assert.equal(submitCalls, 1);
  assert.equal(putBodies.length, 1);
});

test('capture network rejection and non-JSON response produce explicit errors, not unhandled success', async () => {
  for (const mode of ['network', 'non-json']) {
    const errors = [];
    const successes = [];
    componentFetch = async () => {
      if (mode === 'network') throw new Error('offline');
      return { ok: false, status: 500, json: async () => { throw new Error('not json'); } };
    };
    await renderPayPalButtons({ onError: (message) => errors.push(message), onSuccess: (id) => successes.push(id) });
    await assert.doesNotReject(walletConfig.onApprove({ orderID: 'ORDER-1' }));
    assert.equal(successes.length, 0);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /verify|failed|unable|contact/i);
  }
});
