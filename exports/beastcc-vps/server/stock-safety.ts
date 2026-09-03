const paymentCardNumberPattern = /(?<!\d)[3456]\d{12,18}(?!\d)/;

export function assertSafeProductStockContent(
  value: unknown,
  options: { rejectPaymentCardCredentials?: boolean } = {},
): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Stock content is required.");
  }

  if (value.length > 250_000) {
    throw new Error("Bulk stock is limited to 250,000 characters per submission.");
  }

  if (options.rejectPaymentCardCredentials !== false && paymentCardNumberPattern.test(value)) {
    throw new Error("Payment-card credentials cannot be added as product stock.");
  }

  return value;
}