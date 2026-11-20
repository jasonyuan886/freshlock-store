import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const root = new URL('../', import.meta.url);
const componentPath = new URL('components/PayPalButtons.tsx', root);
const quietConsole = { log() {}, warn() {}, error() {}, info() {}, debug() {} };

function loadTsModule(url, mocks = {}, globals = {}) {
  const source = fs.readFileSync(url, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    },
    fileName: url.pathname,
  }).outputText;
  const module = { exports: {} };
  const localRequire = (id) => {
    if (id in mocks) return mocks[id];
    throw new Error(`Unexpected require in ${url.pathname}: ${id}`);
  };
  const context = {
    Buffer, URL, AbortController, AbortSignal, console: quietConsole,
    process: { env: {} }, setTimeout, clearTimeout, setInterval, clearInterval,
    ...globals,
  };
  const wrapper = vm.runInNewContext(
    `(function (exports, require, module) { ${output}\n })`, context,
    { filename: url.pathname },
  );
  wrapper(module.exports, localRequire, module);
  return module.exports;
}

const billing = loadTsModule(new URL('lib/card-billing.ts', root));
const cardError = loadTsModule(new URL('lib/card-error.ts', root));
const countries = loadTsModule(new URL('lib/countries.ts', root));
const componentSource = fs.readFileSync(componentPath, 'utf8');

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
  return {
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
      activeRuntime = this;
      stateCursor = refCursor = callbackCursor = effectCursor = 0;
      return component(props);
    },
    async flushEffects() {
      activeRuntime = this;
      const queued = pendingEffects;
      pendingEffects = [];
      for (const effect of queued) await effect();
    },
  };
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
    name: 'Example Buyer', address: '123 Shipping Street', city: 'Springfield', state: 'Illinois',
    postalCode: '62701', country: 'US', phone: '',
  },
  contactEmail: 'buyer@example.test', onSuccess() {}, onError() {},
};

function createComponentHarness() {
  const configs = {};
  const submissions = [];
  const consoleErrors = [];
  let fetchImpl = async () => { throw new Error('Unexpected component fetch'); };
  const paypal = {
    Buttons(config) { configs.wallet = config; return { render: async () => {} }; },
    CardFields(config) {
      configs.card = config;
      return {
        isEligible: () => true,
        submit: async (payload) => {
          submissions.push(payload);
          await configs.card.createOrder();
        },
        NumberField: () => ({ render() {} }), ExpiryField: () => ({ render() {} }), CVVField: () => ({ render() {} }),
      };
    },
  };
  const windowMock = {
    paypal,
    localStorage: { setItem() {}, getItem() { return null; }, removeItem() {} },
    sessionStorage: { setItem() {}, getItem() { return null; }, removeItem() {} },
  };
  const documentMock = {
    head: { appendChild() {} }, createElement: () => ({}), getElementById: () => ({ innerHTML: '' }),
  };
  const module = loadTsModule(componentPath, {
    react: React, 'react/jsx-runtime': jsxRuntime,
    '@/lib/attribution': { getAttribution: () => ({ utm_source: 'test' }) },
    '@/lib/card-billing': billing,
    '@/lib/card-error': cardError,
    '@/lib/countries': countries,
  }, {
    window: windowMock, document: documentMock, localStorage: windowMock.localStorage,
    fetch: (...args) => fetchImpl(...args),
    process: { env: { NEXT_PUBLIC_PAYPAL_CLIENT_ID: 'test-client' } },
    console: { ...quietConsole, error: (...args) => consoleErrors.push(args) },
  });
  const runtime = createRuntime();
  const props = { ...baseProps, shippingInfo: { ...baseProps.shippingInfo } };
  const rerender = () => runtime.render(module.default, props);
  const render = async () => {
    let tree = rerender();
    await runtime.flushEffects();
    const slot = findNode(tree, (node) => node.props?.ref);
    if (slot) slot.props.ref.current = { innerHTML: '' };
    tree = rerender();
    await runtime.flushEffects();
    tree = rerender();
    return tree;
  };
  return {
    props, runtime, render, rerender, configs, submissions, consoleErrors,
    setFetch(fn) { fetchImpl = fn; },
  };
}

function response(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}

test('same-as-shipping card billing normalizes a full US state name without changing the address', () => {
  const result = billing.resolveCardBilling(baseProps.shippingInfo, true, {
    name: '', address: '', city: '', state: '', postalCode: '', country: 'US',
  });
  assert.equal(result.error, null);
  assert.deepEqual(JSON.parse(JSON.stringify(result.submission)), {
    cardholderName: 'Example Buyer',
    billingAddress: {
      streetAddress: '123 Shipping Street', locality: 'Springfield', region: 'IL',
      postalCode: '62701', countryCodeAlpha2: 'US',
    },
  });
});

test('independent card billing uses the card statement address, not the shipping address', () => {
  const separate = {
    name: 'Card Holder', address: '456 Billing Avenue', city: 'Chicago',
    state: 'IL', postalCode: '60601-1234', country: 'us',
  };
  const result = billing.resolveCardBilling(baseProps.shippingInfo, false, separate);
  assert.equal(result.error, null);
  assert.equal(result.submission.cardholderName, 'Card Holder');
  assert.equal(result.submission.billingAddress.streetAddress, '456 Billing Avenue');
  assert.equal(result.submission.billingAddress.locality, 'Chicago');
  assert.equal(result.submission.billingAddress.countryCodeAlpha2, 'US');
  assert.equal(baseProps.shippingInfo.address, '123 Shipping Street');
});

test('card-only validation rejects missing billing fields, invalid US states and invalid ZIP codes', () => {
  const missing = billing.resolveCardBilling(baseProps.shippingInfo, false, {
    name: '', address: '', city: '', state: '', postalCode: '', country: 'US',
  });
  assert.ok(missing.error);
  assert.equal(missing.submission, null);
  const badState = billing.buildCardBilling({ ...baseProps.shippingInfo, state: 'Not a state' });
  assert.match(billing.validateCardBilling(badState), /state|territory/i);
  const badZip = billing.buildCardBilling({ ...baseProps.shippingInfo, postalCode: 'ABCDE' });
  assert.match(billing.validateCardBilling(badZip), /ZIP/i);
});

test('card error extraction keeps issue/debug ID but never uses raw error messages', () => {
  const raw = {
    message: 'do-not-copy-4111111111111111-or-customer@example.test',
    details: [{ issue: 'INSTRUMENT_DECLINED', description: 'private raw description' }],
    debug_id: 'debug-123',
  };
  const meta = cardError.extractCardErrorMeta(raw);
  assert.deepEqual(JSON.parse(JSON.stringify(meta)), { issue: 'INSTRUMENT_DECLINED', debugId: 'debug-123' });
  assert.doesNotMatch(JSON.stringify(meta), /4111|customer|description|do-not-copy/);
  assert.match(cardError.getCardErrorMessage(meta.issue), /billing address/i);
  assert.match(cardError.getCardErrorMessage('UNKNOWN'), /PayPal/i);
});

test('CardFields submits normalized shipping billing by default and creates exactly one order', async () => {
  const harness = createComponentHarness();
  const createBodies = [];
  harness.setFetch(async (url, init) => {
    assert.equal(url, '/api/paypal');
    createBodies.push(JSON.parse(init.body));
    return response({ orderId: 'ORDER-CARD-1' });
  });
  const tree = await harness.render();
  const submitButton = findNode(tree, (node) => node.type === 'button' && node.props?.onClick);
  assert.ok(submitButton, 'card submit button exists');
  await submitButton.props.onClick();
  assert.equal(createBodies.length, 1);
  assert.equal(harness.submissions.length, 1);
  assert.equal(harness.submissions[0].billingAddress.region, 'IL');
  assert.equal(harness.submissions[0].billingAddress.streetAddress, baseProps.shippingInfo.address);
});

test('unchecking same-as-shipping sends the independently entered statement address to CardFields', async () => {
  const harness = createComponentHarness();
  harness.setFetch(async () => response({ orderId: 'ORDER-CARD-2' }));
  let tree = await harness.render();
  const checkbox = findNode(tree, (node) => node.props?.name === 'billingSameAsShipping');
  assert.ok(checkbox, 'explicit same-as-shipping choice is present');
  checkbox.props.onChange({ target: { checked: false } });
  tree = harness.rerender();
  const values = {
    billingName: 'Statement Holder', billingAddress: '456 Billing Avenue', billingCity: 'Chicago',
    billingState: 'IL', billingPostalCode: '60601', billingCountry: 'US',
  };
  for (const [name, value] of Object.entries(values)) {
    const field = findNode(tree, (node) => node.props?.name === name);
    assert.ok(field, `${name} is rendered`);
    field.props.onChange({ target: { value } });
  }
  tree = harness.rerender();
  const submitButton = findNode(tree, (node) => node.type === 'button' && node.props?.onClick);
  await submitButton.props.onClick();
  assert.equal(harness.submissions.length, 1);
  assert.equal(harness.submissions[0].cardholderName, 'Statement Holder');
  assert.equal(harness.submissions[0].billingAddress.streetAddress, '456 Billing Avenue');
  assert.notEqual(harness.submissions[0].billingAddress.streetAddress, baseProps.shippingInfo.address);
});

test('invalid independent billing stops before createOrder while wallet createOrder remains independent', async () => {
  const harness = createComponentHarness();
  let createCalls = 0;
  const errors = [];
  harness.props.onError = (message) => errors.push(message);
  harness.setFetch(async () => {
    createCalls += 1;
    return response({ orderId: 'WALLET-UNAFFECTED' });
  });
  let tree = await harness.render();
  findNode(tree, (node) => node.props?.name === 'billingSameAsShipping')
    .props.onChange({ target: { checked: false } });
  tree = harness.rerender();
  const submitButton = findNode(tree, (node) => node.type === 'button' && node.props?.onClick);
  await submitButton.props.onClick();
  assert.equal(createCalls, 0);
  assert.equal(harness.submissions.length, 0);
  assert.match(errors.join(' '), /cardholder|billing/i);

  const walletOrder = await harness.configs.wallet.createOrder();
  assert.equal(walletOrder, 'WALLET-UNAFFECTED');
  assert.equal(createCalls, 1, 'wallet never runs card billing validation');
});

test('CardFields errors are reported as safe telemetry and shown with a support reference', async () => {
  const harness = createComponentHarness();
  const errors = [];
  const telemetryBodies = [];
  harness.props.onError = (message) => errors.push(message);
  harness.setFetch(async (url, init) => {
    assert.equal(url, '/api/paypal/card-error');
    telemetryBodies.push(JSON.parse(init.body));
    return response({ reference: 'CARD-TEST1234' });
  });
  await harness.render();
  await harness.configs.card.onError({
    message: 'raw-4111111111111111-customer@example.test',
    details: [{ issue: 'INSTRUMENT_DECLINED', description: 'private-description' }],
    debugId: 'abc123',
  });
  assert.equal(telemetryBodies.length, 1);
  assert.deepEqual(telemetryBodies[0], {
    stage: 'card-fields-error', issue: 'INSTRUMENT_DECLINED', debugId: 'abc123',
  });
  assert.match(errors[0], /CARD-TEST1234/);
  assert.match(errors[0], /billing address/i);
  assert.doesNotMatch(errors[0], /4111|customer@example|private-description/);
  assert.doesNotMatch(JSON.stringify(harness.consoleErrors), /4111|customer@example|private-description/);
});

test('wallet Buttons configuration contains no card billing collection or validation', () => {
  const sourceFile = ts.createSourceFile('PayPalButtons.tsx', componentSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let buttonsConfig;
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
      && node.expression.name.text === 'Buttons' && ts.isObjectLiteralExpression(node.arguments[0])) {
      buttonsConfig = node.arguments[0];
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  assert.ok(buttonsConfig, 'wallet Buttons config found');
  const walletText = buttonsConfig.getText(sourceFile);
  assert.doesNotMatch(walletText, /buildCardBilling|resolveCardBilling|billingSameAsShipping|billingAddress|cardholderName/);
  assert.match(walletText, /validateShipping/);
  assert.match(walletText, /data\.orderID/);
});

function loadTelemetryRoute(logs) {
  return loadTsModule(new URL('app/api/paypal/card-error/route.ts', root), {
    'next/server': { NextResponse: { json: (data, init = {}) => ({ data, status: init.status || 200 }) } },
    crypto: { randomUUID: () => '12345678-abcd-4ef0-8000-1234567890ab' },
  }, { console: { error: (...args) => logs.push(args.join(' ')) } });
}

test('card telemetry route logs only allowlisted metadata and returns a reference', async () => {
  const logs = [];
  const route = loadTelemetryRoute(logs);
  const request = new Request('https://example.test/api/paypal/card-error', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      stage: 'card-fields-error', issue: 'INSTRUMENT_DECLINED', debugId: 'abc123',
      cardNumber: '4111111111111111', email: 'customer@example.test', message: 'private-raw-message',
    }),
  });
  const result = await route.POST(request);
  assert.equal(result.status, 200);
  assert.equal(result.data.reference, 'CARD-12345678');
  assert.equal(logs.length, 1);
  assert.match(logs[0], /CARD-12345678/);
  assert.match(logs[0], /INSTRUMENT_DECLINED/);
  assert.doesNotMatch(logs[0], /4111|customer@example|private-raw-message/);
});

test('card telemetry route rejects malformed and oversized payloads without logging them', async () => {
  const logs = [];
  const route = loadTelemetryRoute(logs);
  const malformed = await route.POST(new Request('https://example.test/api/paypal/card-error', {
    method: 'POST', body: '{bad json',
  }));
  assert.equal(malformed.status, 400);
  const oversized = await route.POST(new Request('https://example.test/api/paypal/card-error', {
    method: 'POST', headers: { 'content-length': '5000' }, body: '{}',
  }));
  assert.equal(oversized.status, 413);
  assert.equal(logs.length, 0);
});
