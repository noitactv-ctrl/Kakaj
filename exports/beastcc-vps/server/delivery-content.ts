export type DeliveryParts = Record<string, string[]>;

export function appendUniqueDeliveryContent(
  parts: DeliveryParts,
  key: string,
  content: string | null | undefined,
): void {
  const original = typeof content === "string" ? content : "";
  if (!original) return;

  const values = parts[key] ?? (parts[key] = []);
  if (!values.includes(original)) {
    values.push(original);
  }
}

export function serializeDeliveryParts(parts: DeliveryParts): string {
  return JSON.stringify(parts);
}