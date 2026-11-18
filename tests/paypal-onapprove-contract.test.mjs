import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const componentUrl = new URL('../components/PayPalButtons.tsx', import.meta.url);
const sourceText = readFileSync(componentUrl, 'utf8');
const sourceFile = ts.createSourceFile('PayPalButtons.tsx', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

function collect(node, predicate, matches = []) {
  if (predicate(node)) matches.push(node);
  ts.forEachChild(node, (child) => { collect(child, predicate, matches); });
  return matches;
}
function isPropertyNamed(node, name) {
  return (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) && node.name.text === name;
}
const onApproveCallbacks = collect(sourceFile, (node) =>
  ts.isPropertyAssignment(node) && isPropertyNamed(node, 'onApprove') &&
  (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)),
).map((node) => node.initializer);

test('Wallet and CardFields both capture data.orderID from the first onApprove argument', () => {
  assert.equal(onApproveCallbacks.length, 2, 'Expected Wallet and CardFields onApprove callbacks');
  for (const callback of onApproveCallbacks) {
    assert.ok(callback.parameters.length >= 1, 'onApprove must declare its data parameter');
    const dataParameter = callback.parameters[0].name.getText(sourceFile);
    const captureCalls = collect(callback, (node) =>
      ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'captureOrder',
    );
    assert.equal(captureCalls.length, 1, 'Each onApprove must call captureOrder exactly once');
    const approvedOrderId = captureCalls[0].arguments[0];
    assert.ok(approvedOrderId && ts.isPropertyAccessExpression(approvedOrderId) &&
      approvedOrderId.expression.getText(sourceFile) === dataParameter && approvedOrderId.name.text === 'orderID',
      'captureOrder must receive <first callback argument>.orderID, not actions.orderID');
  }
});

test('createOrder returns the backend PayPal orderId string', () => {
  const createOrder = collect(sourceFile, (node) =>
    ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'createOrder',
  );
  assert.equal(createOrder.length, 1, 'Expected one createOrder callback');
  const returnsOrderId = collect(createOrder[0], (node) =>
    ts.isReturnStatement(node) && node.expression && ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === 'orderId',
  );
  assert.ok(returnsOrderId.length >= 1, 'createOrder must return data.orderId to the PayPal SDK');
});
