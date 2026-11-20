export interface CardErrorMeta {
  issue: string;
  debugId: string;
}

function asRecord(value: unknown): Record<string, any> | null {
  return value && typeof value === 'object' ? value as Record<string, any> : null;
}

function firstDetail(error: Record<string, any>): Record<string, any> {
  const candidates = [error.details, error.data?.details, error.response?.details];
  for (const details of candidates) {
    if (Array.isArray(details)) {
      const detail = details.find((item) => asRecord(item));
      if (asRecord(detail)) return asRecord(detail)!;
    }
  }
  return {};
}

function cleanIssue(value: unknown): string {
  if (typeof value !== 'string') return '';
  const cleaned = value.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_').slice(0, 80);
  return cleaned;
}

function cleanDebugId(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 128);
}

export function extractCardErrorMeta(error: unknown): CardErrorMeta {
  const record = asRecord(error) || {};
  const detail = firstDetail(record);
  const issue = cleanIssue(
    detail.issue || record.issue || record.data?.issue || record.name,
  ) || 'UNKNOWN';
  const debugId = cleanDebugId(
    record.debugId || record.debug_id || record.data?.debug_id || record.response?.debug_id,
  );
  return { issue, debugId };
}

export function getCardErrorMessage(issue: string): string {
  switch (issue) {
    case 'INSTRUMENT_DECLINED':
      return 'Your card was declined. Check that the cardholder name and billing address exactly match your card statement, or try another card.';
    case 'CARD_EXPIRED':
      return 'This card has expired. Check the expiration date or use another card.';
    case 'INVALID_CARD_NUMBER':
    case 'CARD_NUMBER_INVALID':
      return 'Check the card number and try again.';
    case 'INVALID_CVV':
    case 'CVV_INVALID':
      return 'Check the card security code (CVV) and try again.';
    case 'BILLING_ADDRESS_INVALID':
    case 'INVALID_BILLING_ADDRESS':
      return 'Check that the billing address matches the address on your card statement.';
    default:
      return 'Card payment could not be completed. Verify your card and billing address, or try PayPal above.';
  }
}
