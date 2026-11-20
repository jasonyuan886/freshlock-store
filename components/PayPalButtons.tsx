'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getAttribution } from '@/lib/attribution';
import { resolveCardBilling, type CardBillingSource } from '@/lib/card-billing';
import { extractCardErrorMeta, getCardErrorMessage } from '@/lib/card-error';
import { COUNTRIES } from '@/lib/countries';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalApprovalData {
  orderID: string;
}

interface PayPalButtonsProps {
  items: Array<{
    product: { name: string; price: number; slug: string };
    quantity: number;
  }>;
  totalPrice: number;
  shipping: number;
  shippingMethod: 'standard' | 'faster';
  couponCode?: string;
  shippingInfo: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  contactEmail?: string;
  onSuccess: (orderId: string) => void;
  onError: (message: string) => void;
}

const SDK_LOAD_TIMEOUT_MS = 15_000;
const CREATE_ORDER_TIMEOUT_MS = 50_000;
const CAPTURE_ORDER_TIMEOUT_MS = 90_000;
const CARD_ERROR_REPORT_TIMEOUT_MS = 2_500;

// One deadline covers both response headers and the JSON body. Reject before
// aborting so a fetch/mock that reacts synchronously to abort cannot turn the
// timeout into an unrelated parse/network error.
async function fetchJsonWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<{ response: Response; data: any }> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      const error = new Error(`Payment request timed out after ${timeoutMs}ms`);
      error.name = 'TimeoutError';
      reject(error);
      controller.abort();
    }, timeoutMs);
  });

  try {
    const response = await Promise.race([
      fetch(input, { ...init, signal: controller.signal }),
      timeoutPromise,
    ]);
    const data = await Promise.race([response.json(), timeoutPromise]).catch((error) => {
      if (error?.name === 'TimeoutError') throw error;
      return null;
    });
    return { response, data };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function reportCardError(
  error: unknown,
  stage: 'card-fields-error' | 'card-submit-error',
): Promise<string> {
  const meta = extractCardErrorMeta(error);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CARD_ERROR_REPORT_TIMEOUT_MS);
  try {
    const response = await fetch('/api/paypal/card-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage, issue: meta.issue, debugId: meta.debugId }),
      signal: controller.signal,
      keepalive: true,
    });
    if (!response.ok) return '';
    const data = await response.json().catch(() => null);
    return typeof data?.reference === 'string' && /^CARD-[A-Z0-9]{8}$/.test(data.reference)
      ? data.reference
      : '';
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

function withSupportReference(message: string, reference: string): string {
  return reference ? `${message} Support reference: ${reference}.` : message;
}

export default function PayPalButtons({
  items,
  totalPrice,
  shipping,
  shippingMethod,
  couponCode,
  shippingInfo,
  contactEmail,
  onSuccess,
  onError,
}: PayPalButtonsProps) {
  const buttonsRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [cardEligible, setCardEligible] = useState(false);
  const [cardSubmitting, setCardSubmitting] = useState(false);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingInfo, setBillingInfo] = useState<CardBillingSource>({
    name: '', address: '', city: '', state: '', postalCode: '', country: 'US',
  });
  const cardSubmittingRef = useRef(false);
  const cardFieldsRef = useRef<any>(null);
  const captureInFlightRef = useRef(new Map<string, Promise<void>>());

  const setCardProcessing = useCallback((processing: boolean) => {
    cardSubmittingRef.current = processing;
    setCardSubmitting(processing);
  }, []);

  // Component-scoped init guards. Deliberately NOT window globals: a remount
  // inside the SPA must be able to build a fresh set of fields, and a stale
  // global flag would leave the whole payment area blank.
  const sdkLoadStartedRef = useRef(false);
  const renderStartedRef = useRef(false);

  // Latest-props mirror. The PayPal SDK captures its callbacks exactly once at
  // render time, so every callback must read through this ref instead of a
  // closed-over prop. Without it the order is created with the empty shipping
  // address captured on first paint, and "Pay" silently does nothing.
  const latest = useRef({ items, shippingInfo, shippingMethod, couponCode, contactEmail, onSuccess, onError });
  useEffect(() => {
    latest.current = { items, shippingInfo, shippingMethod, couponCode, contactEmail, onSuccess, onError };
  });

  const handleError = useCallback((msg: string) => {
    try {
      if (latest.current.onError) latest.current.onError(msg);
    } catch (e) {}
  }, []);

  const handleSuccess = useCallback((orderId: string) => {
    try {
      if (latest.current.onSuccess) latest.current.onSuccess(orderId);
    } catch (e) {}
  }, []);

  // Block checkout until the buyer has actually supplied a deliverable address.
  // PayPal calls createOrder the moment the button is clicked, so without this
  // guard an empty form produces an empty shippingAddress, the server rejects
  // the order and PayPal surfaces the generic "payment failed" error.
  const validateShipping = useCallback(() => {
    const si = latest.current.shippingInfo;
    const missing: string[] = [];
    if (!si.name || !si.name.trim()) missing.push('full name');
    if (!si.address || !si.address.trim()) missing.push('street address');
    if (!si.city || !si.city.trim()) missing.push('city');
    if (!si.state || !si.state.trim()) missing.push('state / province');
    if (!si.postalCode || !si.postalCode.trim()) missing.push('ZIP / postal code');
    if (!si.country) missing.push('country');
    if (!(latest.current.contactEmail || '').trim()) missing.push('email');
    if (missing.length) {
      handleError(`Please complete your order details first: ${missing.join(', ')}.`);
      return false;
    }
    return true;
  }, [handleError]);

  // Stash contact+attribution (mirrors the redirect flow) and return the payload
  const buildOrderPayload = useCallback(() => {
    const si = latest.current.shippingInfo;
    const ce = latest.current.contactEmail;
    const attribution = getAttribution();
    const contact = {
      name: si.name || '',
      email: ce || '',
      phone: si.phone || '',
    };
    try {
      localStorage.setItem('freshlock-pending-contact', JSON.stringify(contact));
      localStorage.setItem('freshlock-pending-attribution', JSON.stringify(attribution));
    } catch (e) {}
    return { contact, attribution };
  }, []);

  const createOrder = useCallback(async () => {
    if (!validateShipping()) throw new Error('Incomplete shipping details');
    const cartItems = latest.current.items;
    const si = latest.current.shippingInfo;
    const { data } = await fetchJsonWithTimeout('/api/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems.map((i) => ({
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          slug: i.product.slug,
        })),
        shippingAddress: si,
        shippingMethod: latest.current.shippingMethod,
        shippingCountry: si.country,
        couponCode: latest.current.couponCode || undefined,
      }),
    }, CREATE_ORDER_TIMEOUT_MS);
    if (data?.orderId) return data.orderId;
    throw new Error(data?.error || 'Failed to create order');
  }, [validateShipping]);

  const captureOrder = useCallback(
    async (orderId: string) => {
      const inFlight = captureInFlightRef.current.get(orderId);
      if (inFlight) return inFlight;

      const capture = (async () => {
        try {
          const payload = buildOrderPayload();
          const { response: res, data } = await fetchJsonWithTimeout('/api/paypal', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              contact: payload.contact,
              attribution: payload.attribution,
            }),
          }, CAPTURE_ORDER_TIMEOUT_MS);
          if (!data) {
            handleError('Payment could not be verified because the server returned an invalid response. Please contact support before retrying.');
            return;
          }
          if (res.ok && data.success) {
            const emailStatus = data.confirmationEmailStatus;
            if (['sent', 'failed', 'not_configured', 'no_email'].includes(emailStatus)) {
              try { window.sessionStorage.setItem(`freshlock_confirmation_email_${orderId}`, emailStatus); } catch {}
            }
            handleSuccess(data.orderId || orderId);
          } else handleError(data.error || 'Payment failed. Please contact support before retrying.');
        } catch (e: any) {
          if (e?.name === 'TimeoutError') {
            handleError('Payment verification timed out. Please refresh the page to check your order status or contact support before attempting another payment.');
          } else {
            handleError('Unable to verify payment due to a network error. Please check your connection or contact support before retrying.');
          }
        } finally {
          captureInFlightRef.current.delete(orderId);
          setCardProcessing(false);
        }
      })();
      captureInFlightRef.current.set(orderId, capture);
      return capture;
    },
    [buildOrderPayload, handleSuccess, handleError, setCardProcessing]
  );

  // 1) Load the PayPal SDK exactly once per mount.
  useEffect(() => {
    if (sdkLoadStartedRef.current) return;
    sdkLoadStartedRef.current = true;

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
    if (!clientId) {
      handleError('Payment system is not configured.');
      setLoading(false);
      return;
    }
    if (window.paypal) {
      setSdkReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons,card-fields&commit=true`;
    script.async = true;
    let loadTimeout: ReturnType<typeof setTimeout> | undefined;
    let pollInterval: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const clearSdkTimers = () => {
      if (loadTimeout) clearTimeout(loadTimeout);
      if (pollInterval) clearInterval(pollInterval);
      loadTimeout = undefined;
      pollInterval = undefined;
    };
    const markSdkReady = () => {
      if (cancelled) return;
      clearSdkTimers();
      setSdkReady(true);
    };

    script.onload = () => {
      if (cancelled) return;
      if (window.paypal) {
        markSdkReady();
        return;
      }
      pollInterval = setInterval(() => {
        if (window.paypal) markSdkReady();
      }, 200);
    };
    script.onerror = () => {
      if (cancelled) return;
      clearSdkTimers();
      handleError('Failed to load payment system. Please check your connection and refresh the page.');
      setLoading(false);
    };
    // Start the deadline with the request itself: some network failures fire
    // neither onload nor onerror, which previously left checkout loading forever.
    loadTimeout = setTimeout(() => {
      if (cancelled) return;
      clearSdkTimers();
      script.onload = null;
      script.onerror = null;
      handleError('Payment system took too long to load. Please check your connection and refresh the page to try again.');
      setLoading(false);
    }, SDK_LOAD_TIMEOUT_MS);
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      clearSdkTimers();
      script.onload = null;
      script.onerror = null;
    };
  }, [handleError]);

  // 2) Render the PayPal button + inline card fields exactly once per mount.
  useEffect(() => {
    if (!sdkReady || !window.paypal) return;
    if (!buttonsRef.current) return;
    if (renderStartedRef.current) return;
    renderStartedRef.current = true;

    const clearSlot = (id: string) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '';
    };

    // Wipe any previous markup so a remount can never stack duplicate iframes.
    buttonsRef.current.innerHTML = '';
    clearSlot('fl-card-number');
    clearSlot('fl-card-expiry');
    clearSlot('fl-card-cvv');

    try {
      window.paypal
        .Buttons({
          style: {
            layout: 'vertical',
            color: 'black',
            shape: 'pill',
            label: 'paypal',
            tagline: false,
          },
          createOrder,
          onClick: (_data: any, actions: any) => {
            if (!validateShipping()) return actions.reject();
            return actions.resolve();
          },
          onCancel: () => {
            handleError(
              'PayPal checkout was cancelled. You can try again, or use the card form below.'
            );
          },
          onApprove: async (data: PayPalApprovalData) => {
            await captureOrder(data.orderID);
          },
          onError: (err: any) => {
            console.error('PayPal button error', err);
            handleError(
              'PayPal payment failed. Please try again or use the card form below.'
            );
          },
        })
        .render(buttonsRef.current)
        .catch((e: any) => {
          console.error('render paypal button', e);
          handleError('PayPal button could not load. Please use the card form below.');
        });
    } catch (e) {
      console.error('paypal buttons init', e);
    }

    // Inline card fields (CardFields / ACDC) — no PayPal account needed, no redirect
    try {
      const cf = window.paypal.CardFields?.({
        createOrder,
        onApprove: async (data: PayPalApprovalData) => {
          await captureOrder(data.orderID);
        },
        onError: async (err: any) => {
          setCardProcessing(false);
          const meta = extractCardErrorMeta(err);
          console.error('CardFields error', meta);
          const reference = await reportCardError(err, 'card-fields-error');
          handleError(withSupportReference(getCardErrorMessage(meta.issue), reference));
        },
      });
      if (cf && cf.isEligible && cf.isEligible()) {
        cardFieldsRef.current = cf;
        setCardEligible(true);
        setTimeout(() => {
          try {
            clearSlot('fl-card-number');
            clearSlot('fl-card-expiry');
            clearSlot('fl-card-cvv');
            cf.NumberField({ placeholder: 'Card number' }).render('#fl-card-number');
            cf.ExpiryField({ placeholder: 'MM / YY' }).render('#fl-card-expiry');
            cf.CVVField({ placeholder: 'CVV' }).render('#fl-card-cvv');
          } catch (e) {
            console.error('card fields render', e);
            setCardEligible(false);
          }
        }, 50);
      }
    } catch (e) {
      console.error('cardfields init', e);
    }

    setLoading(false);
  }, [sdkReady, createOrder, captureOrder, handleError, validateShipping, setCardProcessing]);

  const submitCard = async () => {
    if (cardSubmittingRef.current) return;
    if (!validateShipping()) return;
    if (!cardFieldsRef.current) {
      handleError('Card form is not ready yet. Please refresh the page and try again.');
      return;
    }
    const { submission, error } = resolveCardBilling(
      latest.current.shippingInfo,
      billingSameAsShipping,
      billingInfo,
    );
    if (error || !submission) {
      handleError(error || 'Please check the card billing address.');
      return;
    }
    setCardProcessing(true);
    buildOrderPayload();
    try {
      await cardFieldsRef.current.submit(submission);
    } catch (e) {
      if (captureInFlightRef.current.size === 0) setCardProcessing(false);
      const meta = extractCardErrorMeta(e);
      console.error('Card submit error', meta);
      const reference = await reportCardError(e, 'card-submit-error');
      handleError(withSupportReference(getCardErrorMessage(meta.issue), reference));
    }
  };

  const updateBillingField = (field: keyof CardBillingSource, value: string) => {
    setBillingInfo((current) => ({ ...current, [field]: value }));
  };

  const billingInputClass = 'w-full h-11 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#005B52] focus:border-transparent';

  return (
    <div className="w-full">
      {loading && (
        <p className="text-sm text-gray-500">Loading secure payment options…</p>
      )}

      {/* PayPal account button */}
      <div ref={buttonsRef} className="min-h-[40px]" />

      {cardEligible && (
        <div className="mt-4">
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-500">or pay with card</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="space-y-2">
            <div
              id="fl-card-number"
              className="min-h-10 border border-gray-300 rounded-md bg-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <div
                id="fl-card-expiry"
                className="min-h-10 border border-gray-300 rounded-md bg-white"
              />
              <div
                id="fl-card-cvv"
                className="min-h-10 border border-gray-300 rounded-md bg-white"
              />
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-gray-200 p-3">
            <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                name="billingSameAsShipping"
                checked={billingSameAsShipping}
                disabled={cardSubmitting}
                onChange={(event) => setBillingSameAsShipping(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#005B52] focus:ring-[#005B52]"
              />
              <span>
                <span className="font-medium">Billing address is the same as shipping</span>
                <span className="mt-0.5 block text-xs text-gray-500">
                  Uncheck this if your card statement uses a different cardholder name or address.
                </span>
              </span>
            </label>

            {!billingSameAsShipping && (
              <fieldset className="mt-3 space-y-3" disabled={cardSubmitting}>
                <legend className="sr-only">Card billing address</legend>
                <p className="text-xs text-gray-500">
                  Enter the cardholder name and billing address exactly as shown on your card statement.
                </p>
                <div>
                  <label htmlFor="billingName" className="block text-xs font-medium text-gray-600 mb-1">Cardholder name *</label>
                  <input
                    id="billingName"
                    name="billingName"
                    type="text"
                    required
                    autoComplete="cc-name"
                    placeholder="Name as shown on card"
                    value={billingInfo.name}
                    onChange={(event) => updateBillingField('name', event.target.value)}
                    className={billingInputClass}
                  />
                </div>
                <div>
                  <label htmlFor="billingAddress" className="block text-xs font-medium text-gray-600 mb-1">Billing street address *</label>
                  <input
                    id="billingAddress"
                    name="billingAddress"
                    type="text"
                    required
                    autoComplete="billing street-address"
                    placeholder="Street address on your card statement"
                    value={billingInfo.address}
                    onChange={(event) => updateBillingField('address', event.target.value)}
                    className={billingInputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="billingCity" className="block text-xs font-medium text-gray-600 mb-1">City *</label>
                    <input
                      id="billingCity"
                      name="billingCity"
                      type="text"
                      required
                      autoComplete="billing address-level2"
                      value={billingInfo.city}
                      onChange={(event) => updateBillingField('city', event.target.value)}
                      className={billingInputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="billingState" className="block text-xs font-medium text-gray-600 mb-1">State / province *</label>
                    <input
                      id="billingState"
                      name="billingState"
                      type="text"
                      required
                      autoComplete="billing address-level1"
                      placeholder="e.g. IL"
                      value={billingInfo.state}
                      onChange={(event) => updateBillingField('state', event.target.value)}
                      className={billingInputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="billingPostalCode" className="block text-xs font-medium text-gray-600 mb-1">ZIP / postal code *</label>
                    <input
                      id="billingPostalCode"
                      name="billingPostalCode"
                      type="text"
                      required
                      autoComplete="billing postal-code"
                      placeholder="e.g. 62701"
                      value={billingInfo.postalCode}
                      onChange={(event) => updateBillingField('postalCode', event.target.value)}
                      className={billingInputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="billingCountry" className="block text-xs font-medium text-gray-600 mb-1">Country *</label>
                    <select
                      id="billingCountry"
                      name="billingCountry"
                      required
                      autoComplete="billing country"
                      value={billingInfo.country}
                      onChange={(event) => updateBillingField('country', event.target.value)}
                      className={`${billingInputClass} bg-white`}
                    >
                      {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>{country.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>
            )}
          </div>

          <button
            type="button"
            onClick={submitCard}
            disabled={cardSubmitting}
            className="mt-3 w-full h-11 rounded-md bg-gray-900 text-white font-semibold text-sm disabled:opacity-60"
          >
            {cardSubmitting ? 'Processing…' : `Pay $${totalPrice.toFixed(2)}`}
          </button>

          <p className="mt-2 text-[11px] text-gray-500">
            Cards processed securely by PayPal. No PayPal account needed.
          </p>
        </div>
      )}
    </div>
  );
}
