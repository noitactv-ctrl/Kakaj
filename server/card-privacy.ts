const expiryPattern = /^(0[1-9]|1[0-2])[/\-]\d{2,4}$/;

function isLikelyCardholderName(value: string): boolean {
  return /^[A-Za-z][A-Za-z .'-]{1,80}$/.test(value.trim());
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
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