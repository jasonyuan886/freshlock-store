export interface CardBillingSource {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CardBillingSubmission {
  cardholderName: string;
  billingAddress: {
    streetAddress: string;
    locality: string;
    region: string;
    postalCode: string;
    countryCodeAlpha2: string;
  };
}

const US_REGIONS: Record<string, string> = {
  AL: 'AL', ALABAMA: 'AL', AK: 'AK', ALASKA: 'AK', AZ: 'AZ', ARIZONA: 'AZ',
  AR: 'AR', ARKANSAS: 'AR', CA: 'CA', CALIFORNIA: 'CA', CO: 'CO', COLORADO: 'CO',
  CT: 'CT', CONNECTICUT: 'CT', DE: 'DE', DELAWARE: 'DE', FL: 'FL', FLORIDA: 'FL',
  GA: 'GA', GEORGIA: 'GA', HI: 'HI', HAWAII: 'HI', ID: 'ID', IDAHO: 'ID',
  IL: 'IL', ILLINOIS: 'IL', IN: 'IN', INDIANA: 'IN', IA: 'IA', IOWA: 'IA',
  KS: 'KS', KANSAS: 'KS', KY: 'KY', KENTUCKY: 'KY', LA: 'LA', LOUISIANA: 'LA',
  ME: 'ME', MAINE: 'ME', MD: 'MD', MARYLAND: 'MD', MA: 'MA', MASSACHUSETTS: 'MA',
  MI: 'MI', MICHIGAN: 'MI', MN: 'MN', MINNESOTA: 'MN', MS: 'MS', MISSISSIPPI: 'MS',
  MO: 'MO', MISSOURI: 'MO', MT: 'MT', MONTANA: 'MT', NE: 'NE', NEBRASKA: 'NE',
  NV: 'NV', NEVADA: 'NV', NH: 'NH', 'NEW HAMPSHIRE': 'NH', NJ: 'NJ', 'NEW JERSEY': 'NJ',
  NM: 'NM', 'NEW MEXICO': 'NM', NY: 'NY', 'NEW YORK': 'NY', NC: 'NC', 'NORTH CAROLINA': 'NC',
  ND: 'ND', 'NORTH DAKOTA': 'ND', OH: 'OH', OHIO: 'OH', OK: 'OK', OKLAHOMA: 'OK',
  OR: 'OR', OREGON: 'OR', PA: 'PA', PENNSYLVANIA: 'PA', RI: 'RI', 'RHODE ISLAND': 'RI',
  SC: 'SC', 'SOUTH CAROLINA': 'SC', SD: 'SD', 'SOUTH DAKOTA': 'SD', TN: 'TN', TENNESSEE: 'TN',
  TX: 'TX', TEXAS: 'TX', UT: 'UT', UTAH: 'UT', VT: 'VT', VERMONT: 'VT',
  VA: 'VA', VIRGINIA: 'VA', WA: 'WA', WASHINGTON: 'WA', WV: 'WV', 'WEST VIRGINIA': 'WV',
  WI: 'WI', WISCONSIN: 'WI', WY: 'WY', WYOMING: 'WY',
  DC: 'DC', 'DISTRICT OF COLUMBIA': 'DC', PR: 'PR', 'PUERTO RICO': 'PR',
  GU: 'GU', GUAM: 'GU', VI: 'VI', 'VIRGIN ISLANDS': 'VI',
  AS: 'AS', 'AMERICAN SAMOA': 'AS', MP: 'MP', 'NORTHERN MARIANA ISLANDS': 'MP',
  AA: 'AA', AE: 'AE', AP: 'AP',
};

const US_REGION_CODES = new Set(Object.values(US_REGIONS));

function normalizeRegion(countryCode: string, value: string): string {
  const region = value.trim().replace(/\s+/g, ' ');
  if (countryCode !== 'US') return region;
  return US_REGIONS[region.toUpperCase()] || region.toUpperCase();
}

export function buildCardBilling(source: CardBillingSource): CardBillingSubmission {
  const countryCodeAlpha2 = (source.country || 'US').trim().toUpperCase();
  return {
    cardholderName: source.name.trim(),
    billingAddress: {
      streetAddress: source.address.trim(),
      locality: source.city.trim(),
      region: normalizeRegion(countryCodeAlpha2, source.state),
      postalCode: source.postalCode.trim().toUpperCase(),
      countryCodeAlpha2,
    },
  };
}

export function validateCardBilling(submission: CardBillingSubmission): string | null {
  const { cardholderName, billingAddress: address } = submission;
  if (!cardholderName) return 'Enter the cardholder name as it appears on the card.';
  if (!address.streetAddress || !address.locality || !address.region || !address.postalCode) {
    return 'Complete the billing address exactly as shown on your card statement.';
  }
  if (!/^[A-Z]{2}$/.test(address.countryCodeAlpha2)) {
    return 'Select the billing address country.';
  }
  if (address.countryCodeAlpha2 === 'US') {
    if (!US_REGION_CODES.has(address.region)) {
      return 'For a US billing address, enter a valid state or territory, such as IL.';
    }
    if (!/^\d{5}(?:-\d{4})?$/.test(address.postalCode)) {
      return 'For a US billing address, enter a valid ZIP code, such as 62701 or 62701-1234.';
    }
  }
  return null;
}

export function resolveCardBilling(
  shipping: CardBillingSource,
  sameAsShipping: boolean,
  separateBilling: CardBillingSource,
): { submission: CardBillingSubmission | null; error: string | null } {
  const submission = buildCardBilling(sameAsShipping ? shipping : separateBilling);
  const error = validateCardBilling(submission);
  return error ? { submission: null, error } : { submission, error: null };
}
