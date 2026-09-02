const expiryPattern = /^(0[1-9]|1[0-2])[/\-]\d{2,4}$/;
const usStates = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS",
  "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY",
  "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI",
  "DC",
]);

function isLikelyCardholderName(value: string): boolean {
  return /^[A-Za-z][A-Za-z .'-]{1,80}$/.test(value.trim());
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidZip(value: string): boolean {
  const digits = value.trim().match(/^(\d{5})(?:-\d{4})?$/)?.[1];
  if (!digits) return false;
  const number = Number(digits);
  return number >= 501 && number <= 99950;
}

function isCityCandidate(value: string): boolean {
  const city = value.trim();
  return city.length > 1
    && city.length <= 60
    && /^[A-Za-z][A-Za-z .'-]*$/.test(city)
    && !usStates.has(city.toUpperCase())
    && !/\b(?:street|road|avenue|lane|drive|boulevard|parkway|unit)\b/i.test(city);
}

function labeledValue(value: string, label: string): string {
  const match = value.match(new RegExp(`(?:^|[|,;\\n])\\s*(?:${label})\\s*[:=]\\s*([^|,;\\n]+)`, "i"));
  return match?.[1]?.trim() ?? "";
}

export type CardMetadata = {
  bin: string;
  type: string;
  state: string;
  city: string;
  zip: string;
};

export function normalizeCardNumber(value: string | null | undefined): string {
  return String(value ?? "").replace(/\D/g, "");
}

export function isValidCardState(value: string | null | undefined): boolean {
  return usStates.has(String(value ?? "").trim().toUpperCase());
}

export function isValidCardZip(value: string | null | undefined): boolean {
  return isValidZip(String(value ?? ""));
}

export function extractCardMetadata(
  extras: string | null | undefined,
  cardNumber: string | null | undefined,
  binData?: {
    bin?: string | null;
    type?: string | null;
    state?: string | null;
    city?: string | null;
    zip?: string | null;
  } | null,
): CardMetadata {
  const raw = extras ?? "";
  const fields = raw.split(/[|\t]/).map(field => field.trim());
  const stateFromLabel = (binData?.state || labeledValue(raw, "state|region")).trim().toUpperCase();
  const stateIndex = fields.findIndex(field => usStates.has(field.toUpperCase()));
  const looseState = raw
    .split(/[|\t,;\n]/)
    .map(field => field.trim().toUpperCase())
    .find(field => usStates.has(field));
  const state = usStates.has(stateFromLabel)
    ? stateFromLabel
    : stateIndex >= 0
      ? fields[stateIndex].toUpperCase()
      : looseState ?? "";

  let city = binData?.city?.trim() || labeledValue(raw, "city");
  if (!isCityCandidate(city)) {
    city = "";
    if (stateIndex >= 0) {
      for (let index = stateIndex + 1; index < fields.length; index++) {
        if (isCityCandidate(fields[index])) {
          city = fields[index];
          break;
        }
        if (isValidZip(fields[index])) break;
      }
    }
    if (!city && stateIndex >= 0) {
      for (let index = stateIndex - 1; index >= 0; index--) {
        if (isCityCandidate(fields[index])) {
          city = fields[index];
          break;
        }
      }
    }
  }

  const labeledZip = binData?.zip?.trim() || labeledValue(raw, "zip|postal(?:\\s+code)?");
  const looseZip = raw.match(/(?:^|[\s|,;])(\d{5})(?:-\d{4})?(?=$|[\s|,;])/g)
    ?.map(value => value.match(/(\d{5})/)?.[1] ?? "")
    .find(isValidZip) ?? "";
  const zip = isValidZip(labeledZip)
    ? labeledZip.match(/^(\d{5})/)?.[1] ?? ""
    : fields.find(isValidZip)?.match(/^(\d{5})/)?.[1] ?? looseZip;

  const bin = (cardNumber ?? "").replace(/\D/g, "").substring(0, 6) || binData?.bin || "";
  const type = (
    binData?.type
    || labeledValue(raw, "type")
    || fields.find(field => /^(?:debit|credit|prepaid)$/i.test(field))
    || ""
  ).trim().toUpperCase();

  return { bin, type, state, city: city.substring(0, 60), zip };
}

/**
 * Removes a cardholder name from a stock item's free-form details.
 * The supplied name is still used by the existing validation gate, but it
 * is never retained in stock records or copied into order delivery content.
 */
export function stripCardholderName(value: string | null | undefined): string {
  if (!value) return "";

  const fields = value.split("|");
  const expiryIndex = fields.findIndex(field => expiryPattern.test(field.trim()));

  if (expiryIndex >= 0) {
    const nameIndex = expiryIndex + 2;
    if (isLikelyCardholderName(fields[nameIndex] ?? "")) {
      fields.splice(nameIndex, 1);
    }
  }

  const emailIndex = fields.findIndex(isEmail);
  if (emailIndex >= 0) {
    const nameIndex = emailIndex + 1;
    if (isLikelyCardholderName(fields[nameIndex] ?? "")) {
      fields.splice(nameIndex, 1);
    }
  }

  return fields
    .join("|")
    .replace(
      /(^|[|,;\r\n]\s*)(?:name|cardholder)\s*[:=]\s*[^|,;\r\n]*/gi,
      "$1",
    )
    .replace(/\|\s*\|+/g, "|")
    .replace(/^\s*\||\|\s*$/g, "")
    .trim();
}

export function formatCardDeliveryContent(card: {
  cardNumber: string;
  expiry: string;
  cvv: string;
  country: string;
  extras?: string | null;
}): string {
  return [
    card.cardNumber,
    card.expiry,
    card.cvv,
    card.country,
    stripCardholderName(card.extras),
  ].filter(Boolean).join("|");
}