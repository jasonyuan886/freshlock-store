import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const componentPath = new URL('components/PayPalButtons.tsx', root);
const successPagePath = new URL('app/checkout/success/page.tsx', root);
const routePath = new URL('app/api/paypal/route.ts', root);

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
    Buffer, URL, AbortController, AbortSignal,
    console: { log() {}, warn() {}, error() {}, info() {}, debug() {} },
    process: { env: {} }, setTimeout, clearTimeout, setInterval, clearInterval,
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

function createFakeTimers() {
  const timers = new Set();
  const make = (type) => (fn, ms) => {
    const timer = { fn, ms, type, cleared: false };
    timers.add(timer);
    return timer;
  };
  const clear = (timer) => {
    if (timer) timer.cleared = true;
    timers.delete(timer);
  };
  return {
    timers,
    setTimeout: make('timeout'), setInterval: make('interval'),
    clearTimeout: clear, clearInterval: clear,
    one(type, ms) {
      const matches = [...timers].filter((timer) => timer.type === type && timer.ms === ms);
      assert.equal(matches.length, 1, `expected one ${type} timer for ${ms}ms; got ${matches.length}`);
      return matches[0];
    },
  };
}

let activeRuntime;
const React = {
  useState: (...args) => activeRuntime.useState(...args),
  useRef: (...args) => activeRuntime.useRef(...args),
  useEffect: (...args) => activeRuntime.useEffect(...args),
  useCallback: (...args) => activeRuntime.useCallback(...args),
  Fragment: Symbol('Fragment'),
};
const jsxRuntime = {
  Fragment: React.Fragment,
  jsx: (type, props, key) => ({ type, props: props || {}, key }),
  jsxs: (type, props, key) => ({ type, props: props || {}, key }),
};

function createRuntime() {
  const states = [], refs = [], callbacks = [], effects = [];
  let stateCursor = 0, refCursor = 0, callbackCursor = 0, effectCursor = 0;
  let pendingEffects = [];
  const sameDeps = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const runtime = {
    states, refs,
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

const baseProps = {
  items: [{ product: { name: 'Test Sealer', price: 50, slug: 'test-sealer' }, quantity: 1 }],
  totalPrice: 55.99, shipping: 5.99, shippingMethod: 'standard',
  shippingInfo: {
    name: 'Test Buyer', address: '1 Test Street', city: 'Testville', state: 'TS',
    postalCode: '00000', country: 'US', phone: '+10000000000',
  },
  contactEmail: 'buyer@example.test', onSuccess() {}, onError() {},
};

function makePayPalMock(configs) {
  return {
    Buttons(config) { configs.wallet = config; return { render: async () => {} }; },
    CardFields(config) {
      configs.card = config;
      return {
        isEligible: () => true, submit: async () => {},
        NumberField: () => ({ render() {} }), ExpiryField: () => ({ render() {} }), CVVField: () => ({ render() {} }),
      };
    },
  };
}

function makeComponent({ paypal = true, fetchImpl } = {}) {
  const timers = createFakeTimers(), configs = {}, scripts = [];
  const windowMock = {
    paypal: paypal ? makePayPalMock(configs) : undefined,
    localStorage: { setItem() {}, getItem() { return null; }, removeItem() {} },
    sessionStorage: { setItem() {}, getItem() { return null; }, removeItem() {} },
  };
  const documentMock = {
    head: { appendChild(script) { scripts.push(script); } },
    createElement: () => ({}), getElementById: () => ({ innerHTML: '' }),
  };
  const module = loadTsModule(componentPath, {
    react: React, 'react/jsx-runtime': jsxRuntime,
    '@/lib/attribution': { getAttribution: () => ({ utm_source: 'test' }) },
  }, {
    window: windowMock, document: documentMock, localStorage: windowMock.localStorage,
    fetch: fetchImpl || (async () => { throw new Error('Unexpected component fetch'); }),
    process: { env: { NEXT_PUBLIC_PAYPAL_CLIENT_ID: 'test-client' } },
    setTimeout: timers.setTimeout, clearTimeout: timers.clearTimeout,
    setInterval: timers.setInterval, clearInterval: timers.clearInterval,
  });
  return { timers, configs, scripts, windowMock, module };
}

async function renderComponent(harness, overrides = {}) {
  const runtime = createRuntime();
  const props = { ...baseProps, ...overrides };
  let tree = runtime.render(harness.module.default, props);
  await runtime.flushEffects();
  const slot = findNode(tree, (node) => node.props?.ref);
  if (slot) slot.props.ref.current = { innerHTML: '' };
  tree = runtime.render(harness.module.default, props);
  await runtime.flushEffects();
  tree = runtime.render(harness.module.default, props);
  return { runtime, props, tree };
}

function makeSuccessPage({ fetchImpl } = {}) {
  const timers = createFakeTimers(), clearCartCalls = [];
  const storage = { setItem() {}, getItem() { return null; }, removeItem() {} };
  const windowMock = { localStorage: storage, sessionStorage: storage };
  const searchParams = new URLSearchParams('payment_method=paypal&token=ORDER-RETURN');
  const clearCart = () => { clearCartCalls.push(1); };
  const module = loadTsModule(successPagePath, {
    react: React, 'react/jsx-runtime': jsxRuntime,
    'next/navigation': { useSearchParams: () => searchParams },
    'next/link': { default: (props) => jsxRuntime.jsx('a', props) },
    '@/lib/cart-context': { useCart: () => ({ clearCart }) },
    '@/lib/attribution': { getAttribution: () => ({}) },
  }, {
    window: windowMock, localStorage: storage,
    fetch: fetchImpl || (async () => { throw new Error('Unexpected success-page fetch'); }),
    setTimeout: timers.setTimeout, clearTimeout: timers.clearTimeout,
    setInterval: timers.setInterval, clearInterval: timers.clearInterval,
  });
  return { timers, module, clearCartCalls };
}

async function renderSuccessPage(harness) {
  const runtime = createRuntime();
  const shell = runtime.render(harness.module.default);
  const content = shell.props.children;
  const tree = runtime.render(content.type);
  await runtime.flushEffects();
  await new Promise(setImmediate);
  return { runtime, content, tree };
}

function neverSettlingFetch(url, init, observed, body = false) {
  assert.equal(url, '/api/paypal');
  observed.started = true;
  observed.signal = init.signal;
  if (body) return Promise.resolve({ ok: true, status: 200, json: () => new Promise(() => {}) });
  return new Promise(() => {});
}

for (const method of ['POST', 'PUT']) {
  for (const body of [false, true]) {
    const phase = method === 'POST' ? 'createOrder fetch' : 'capture fetch';
    const budget = method === 'POST' ? 50_000 : 90_000;
    test(`${phase}${body ? ' response JSON' : ''} has a finite abortable ${budget}ms budget`, async () => {
      const observed = {};
      const harness = makeComponent({
        fetchImpl: (url, init) => {
          assert.equal(init.method, method);
          return neverSettlingFetch(url, init, observed, body);
        },
      });
      const errors = [], successes = [];
      const { runtime } = await renderComponent(harness, {
        onError: (message) => errors.push(message), onSuccess: (id) => successes.push(id),
      });
      const operation = method === 'POST'
        ? Promise.resolve().then(() => harness.configs.wallet.createOrder())
        : Promise.resolve().then(() => harness.configs.wallet.onApprove({ orderID: 'ORDER-1' }));
      let settled = false;
      operation.finally(() => { settled = true; }).catch(() => {});
      for (let i = 0; i < 3 && !observed.started; i += 1) await new Promise(setImmediate);
      await new Promise(setImmediate);
      assert.equal(observed.started, true, `${method} should have started`);
      const timer = harness.timers.one('timeout', budget);
      assert.equal(settled, false, 'test premise: the mock remains pending until the timeout fires');
      timer.fn();
      if (method === 'POST') {
        await assert.rejects(operation, (error) => error?.name === 'TimeoutError');
      } else {
        await assert.doesNotReject(operation);
        assert.equal(errors.length, 1);
        assert.match(errors[0], /refresh/i);
        assert.match(errors[0], /contact support/i);
        assert.doesNotMatch(errors[0], /try again|retry/i);
      }
      assert.equal(observed.signal.aborted, true);
      assert.equal(timer.cleared, true, 'request timer must be cleared after settling');
      assert.deepEqual(successes, []);
      if (method === 'PUT') {
        const pendingMap = runtime.refs.find((ref) => ref.current && typeof ref.current.get === 'function' && typeof ref.current.delete === 'function');
        assert.ok(pendingMap, 'component capture map should exist');
        assert.equal(pendingMap.current.size, 0, 'timed-out capture must leave the pending map');
        assert.equal(runtime.states[3], false, 'card processing state must be cleared');
      }
    });
  }
}

for (const body of [false, true]) {
  test(`checkout return capture ${body ? 'response JSON' : 'fetch'} has a finite abortable 90000ms budget`, async () => {
    const observed = {};
    const harness = makeSuccessPage({
      fetchImpl: (url, init) => {
        assert.equal(init.method, 'PUT');
        return neverSettlingFetch(url, init, observed, body);
      },
    });
    const { runtime, content } = await renderSuccessPage(harness);
    assert.equal(observed.started, true, 'success-page capture should have started');
    assert.equal(runtime.states[1], 'verifying', 'test premise: return remains pending before its deadline');
    const timer = harness.timers.one('timeout', 90_000);
    timer.fn();
    for (let i = 0; i < 5 && runtime.states[1] === 'verifying'; i += 1) await new Promise(setImmediate);
    assert.equal(runtime.states[1], 'failed');
    assert.equal(runtime.states[0], null, 'timed-out capture must not populate successful order info');
    assert.equal(observed.signal.aborted, true);
    assert.equal(timer.cleared, true, 'return-page request timer must be cleared after settling');
    assert.match(runtime.states[2], /refresh/i);
    assert.match(runtime.states[2], /contact support/i);
    assert.doesNotMatch(runtime.states[2], /try again|retry|another payment/i);
    assert.deepEqual(harness.clearCartCalls, [], 'timed-out capture must not run success-only cart cleanup');
    const tree = runtime.render(content.type);
    assert.ok(findNode(tree, (node) => node.type === 'h1' && node.props?.children === 'Payment Issue'));
    assert.equal(findNode(tree, (node) => node.type === 'h1' && node.props?.children === 'Thank You!'), null);
  });
}

test('SDK timeout starts when the script is appended, even if neither load nor error ever fires', async () => {
  const harness = makeComponent({ paypal: false });
  const errors = [];
  const { runtime } = await renderComponent(harness, { onError: (message) => errors.push(message) });
  assert.equal(harness.scripts.length, 1);
  const timer = harness.timers.one('timeout', 15_000);
  assert.equal(runtime.states[0], true, 'test premise: component is still loading before timeout');
  timer.fn();
  await new Promise(setImmediate);
  assert.equal(runtime.states[0], false);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /refresh|connection|try again/i);
  assert.equal(timer.cleared, true);
});

test('successful SDK initialization clears both load timeout and polling interval', async () => {
  const harness = makeComponent({ paypal: false });
  await renderComponent(harness);
  const timer = harness.timers.one('timeout', 15_000);
  harness.scripts[0].onload();
  const interval = harness.timers.one('interval', 200);
  harness.windowMock.paypal = makePayPalMock(harness.configs);
  interval.fn();
  assert.equal(timer.cleared, true, 'SDK deadline must not survive successful initialization');
  assert.equal([...harness.timers.timers].filter((entry) => entry.type === 'interval').length, 0);
});

test('SDK script error clears the load deadline and stops loading', async () => {
  const harness = makeComponent({ paypal: false });
  const errors = [];
  const { runtime } = await renderComponent(harness, { onError: (message) => errors.push(message) });
  const timer = harness.timers.one('timeout', 15_000);
  harness.scripts[0].onerror();
  assert.equal(runtime.states[0], false);
  assert.equal(errors.length, 1);
  assert.equal(timer.cleared, true);
});

function jsonResponse(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}

function makeRoute(captureStatus, captureData) {
  const persistCalls = [], analyticsCalls = [], emailCalls = [], logs = [];
  const route = loadTsModule(routePath, {
    'next/server': { NextResponse: { json: (data, init = {}) => ({ data, status: init.status || 200, ok: (init.status || 200) < 400 }) } },
    '@/lib/orders': {
      persistOrder: async (order) => { persistCalls.push(order); return { persisted: true }; },
      generateOrderNumber: (id) => `FL-TEST-${id}`,
    },
    '@/lib/data': { products: [{ slug: 'test-sealer', price: 50 }], AIR_SHIPPING_US: 10 },
    '@/lib/ga4-server': { sendServerPurchaseEvent: async () => { analyticsCalls.push(1); } },
    '@/lib/coupons': { lookupCoupon: () => null, couponDiscount: () => 0 },
    '@/lib/smtp': { sendEmail: async () => { emailCalls.push(1); } },
  }, {
    process: { env: { PAYPAL_CLIENT_ID: 'test-client', PAYPAL_SECRET: 'test-secret' } },
    console: { log() {}, warn() {}, info() {}, debug() {}, error: (...args) => logs.push(args) },
    fetch: async (url) => {
      if (url.endsWith('/v1/oauth2/token')) return jsonResponse({ access_token: 'token' });
      if (url.endsWith('/ORDER-1/capture')) return jsonResponse(captureData, captureStatus);
      if (url.endsWith('/ORDER-1')) return jsonResponse({ id: 'ORDER-1', status: 'APPROVED' });
      throw new Error(`Unexpected URL ${url}`);
    },
  });
  return { route, persistCalls, analyticsCalls, emailCalls, logs };
}

function apiRequest() {
  return {
    json: async () => ({ orderId: 'ORDER-1', contact: { email: 'buyer@example.test' } }),
    headers: { get: () => null },
  };
}

test('PayPal capture JSON errors 404/422/500 become safe diagnostic 502 responses without side effects', async () => {
  for (const status of [404, 422, 500]) {
    const debugId = `DEBUG-${status}`;
    const harness = makeRoute(status, {
      name: 'PAYPAL_ERROR', debug_id: debugId, secret: 'must-not-leak',
      details: [{ issue: 'MOCK_FAILURE', description: 'sensitive upstream detail' }],
    });
    const response = await harness.route.PUT(apiRequest());
    assert.equal(response.status, 502);
    assert.equal(response.data.success, undefined);
    assert.equal(response.data.paypalStatus, status);
    assert.equal(response.data.debugId, debugId);
    assert.match(response.data.error, /contact support|refresh/i);
    assert.doesNotMatch(response.data.error, /undefined/i);
    const serialized = JSON.stringify(response.data);
    assert.doesNotMatch(serialized, /test-secret|must-not-leak|sensitive upstream detail/);
    assert.equal(harness.persistCalls.length, 0);
    assert.equal(harness.analyticsCalls.length, 0);
    assert.equal(harness.emailCalls.length, 0);
    const logText = harness.logs.flat().map(String).join(' ');
    assert.match(logText, new RegExp(String(status)));
    assert.match(logText, new RegExp(debugId));
  }
});

test('a 2xx but non-COMPLETED capture is never reported as payment success', async () => {
  const harness = makeRoute(200, { id: 'ORDER-1', status: 'PENDING', debug_id: 'DEBUG-PENDING' });
  const response = await harness.route.PUT(apiRequest());
  assert.notEqual(response.status, 200);
  assert.equal(response.data.success, undefined);
  assert.match(response.data.error, /PENDING|contact support/i);
  assert.equal(harness.persistCalls.length, 0);
  assert.equal(harness.analyticsCalls.length, 0);
  assert.equal(harness.emailCalls.length, 0);
});
