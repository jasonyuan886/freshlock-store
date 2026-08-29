// Client-side marketing attribution capture.
//
// On the first landing visit we capture UTM parameters and common ad click ids
// (gclid/fbclid) into localStorage. If there are no UTM params we record the
// referrer instead. This "first-touch" attribution is later sent with the
// PayPal capture and stored alongside the order.
//
// Storage key: freshlock-attribution (JSON). Lasts ~30 days. We never overwrite
// an existing first-touch record on later visits.

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  landing_page?: string;
  captured_at?: string;
};

const STORAGE_KEY = 'freshlock-attribution';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const UTM_KEYS: (keyof Attribution)[] = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
];

function readStorage(): Attribution | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Attribution) : null;
  } catch {
    return null;
  }
}

// Called once on the root layout mount.
export function captureAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;

  const existing = readStorage();
  const now = Date.now();
  if (existing && existing.captured_at) {
    const age = now - new Date(existing.captured_at).getTime();
    if (age < MAX_AGE_MS) {
      return existing; // keep first-touch attribution
    }
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const attr: Attribution = {};
    let hasUtm = false;

    for (const key of UTM_KEYS) {
      const v = params.get(key);
      if (v) {
        (attr as Record<string, string>)[key] = v.slice(0, 200);
        hasUtm = true;
      }
    }

    if (!hasUtm) {
      // No paid-tagged traffic — fall back to referrer (only for external refs).
      const ref = document.referrer || '';
      if (ref) {
        try {
          const refHost = new URL(ref).hostname;
          const siteHost = window.location.hostname;
          if (refHost && refHost !== siteHost && !refHost.endsWith(siteHost)) {
            attr.referrer = ref.slice(0, 300);
          }
        } catch {
          attr.referrer = ref.slice(0, 300);
        }
      }
    }

    attr.landing_page = window.location.pathname.slice(0, 200);
    attr.captured_at = new Date().toISOString();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(attr));
    return attr;
  } catch {
    return null;
  }
}

// Read the stored attribution (used at checkout/success).
export function getAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;
  return readStorage();
}
