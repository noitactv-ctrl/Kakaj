import { createHmac, timingSafeEqual } from "crypto";
import { getRuntimeSetting } from "./settings";

const DEFAULT_API_BASE = "https://api.plisio.net/api/v1";

export type CryptoPaymentStatus = "pending" | "completed" | "failed" | "expired" | "underpaid";

export interface PlisioInvoice {
  id: string;
  url: string;
  amount?: string;
  currency?: string;
  expiresAt?: number;
  [key: string]: unknown;
}

export interface PlisioOperation {
  id: string;
  orderNumber: string;
  status: string;
  invoiceUrl?: string;
  currency?: string;
}

export class PlisioInvoiceCreationError extends Error {
  constructor(message: string, public readonly definitive: boolean) {
    super(message);
    this.name = "PlisioInvoiceCreationError";
  }
}

async function getApiKey(): Promise<string> {
  const key = await getRuntimeSetting("plisio_api_key");
  if (!key) throw new Error("PLISIO_API_KEY is not configured");
  return key;
}

async function getApiBase(): Promise<string> {
  return (await getRuntimeSetting("plisio_api_url", DEFAULT_API_BASE))!;
}

export async function createPlisioInvoice(params: {
  amountUsd: number;
  currency: string;
  orderNumber: string;
  orderName: string;
  callbackUrl: string;
  successInvoiceUrl: string;
  failInvoiceUrl: string;
}): Promise<PlisioInvoice> {
  const [apiKey, apiBase] = await Promise.all([getApiKey(), getApiBase()]);
  const endpoint = new URL(`${apiBase.replace(/\/+$/, "")}/invoices/new`);

  endpoint.searchParams.set("source_currency", "USD");
  endpoint.searchParams.set("source_amount", params.amountUsd.toFixed(2));
  endpoint.searchParams.set("currency", params.currency);
  endpoint.searchParams.set("allowed_psys_cids", params.currency);
  endpoint.searchParams.set("order_number", params.orderNumber);
  endpoint.searchParams.set("order_name", params.orderName);
  endpoint.searchParams.set("description", params.orderName);
  endpoint.searchParams.set("callback_url", params.callbackUrl);
  endpoint.searchParams.set("success_invoice_url", params.successInvoiceUrl);
  endpoint.searchParams.set("fail_invoice_url", params.failInvoiceUrl);
  endpoint.searchParams.set("expire_min", "60");
  endpoint.searchParams.set("api_key", apiKey);

  const response = await fetch(endpoint, { method: "GET" });
  const payload = await response.json().catch(() => null) as { status?: string; data?: Record<string, unknown> } | null;

  if (!response.ok || payload?.status !== "success" || !payload.data) {
    const message = typeof payload?.data?.message === "string" ? payload.data.message : `Plisio API error: ${response.status}`;
    // Only documented client errors are safe to clean up locally. A 5xx,
    // malformed reply, or thrown fetch/timeout remains ambiguous because
    // Plisio may have created the invoice before its response was lost.
    throw new PlisioInvoiceCreationError(message, response.status >= 400 && response.status < 500);
  }

  const id = String(payload.data.txn_id || "");
  const url = String(payload.data.invoice_url || "");
  if (!id || !url) throw new Error("Plisio returned an invalid invoice response");

  return {
    ...payload.data,
    id,
    url,
    amount: typeof payload.data.amount === "string" ? payload.data.amount : undefined,
    currency: typeof payload.data.currency === "string" ? payload.data.currency : params.currency,
    expiresAt: typeof payload.data.expire_utc === "number" ? payload.data.expire_utc : undefined,
  };
}

async function listPlisioOperationsPage(page: number, pageSize: number): Promise<PlisioOperation[]> {
  const [apiKey, apiBase] = await Promise.all([getApiKey(), getApiBase()]);
  const endpoint = new URL(`${apiBase.replace(/\/+$/, "")}/operations`);
  endpoint.searchParams.set("api_key", apiKey);
  endpoint.searchParams.set("page", String(page));
  // Plisio's public examples use page_size; some account/API versions expose
  // the same pagination value as limit. Send both for compatible pagination.
  endpoint.searchParams.set("page_size", String(pageSize));
  endpoint.searchParams.set("limit", String(pageSize));

  const response = await fetch(endpoint, { method: "GET" });
  const payload = await response.json().catch(() => null) as { status?: string; data?: unknown } | null;
  if (!response.ok || payload?.status !== "success") {
    throw new Error(`Unable to reconcile Plisio invoices (${response.status}).`);
  }

  const data = payload.data as Record<string, unknown> | unknown[] | null;
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data?.operations)
      ? data.operations
      : Array.isArray(data?.data)
        ? data.data
        : [];

  return rows.flatMap((row): PlisioOperation[] => {
    if (!row || typeof row !== "object") return [];
    const values = row as Record<string, unknown>;
    const id = String(values.txn_id || values.id || "");
    const orderNumber = String(values.order_number || "");
    if (!id || !orderNumber) return [];
    return [{
      id,
      orderNumber,
      status: String(values.status || ""),
      invoiceUrl: typeof values.invoice_url === "string" ? values.invoice_url : undefined,
      currency: typeof values.currency === "string"
        ? values.currency
        : typeof values.psys_cid === "string"
          ? values.psys_cid
          : undefined,
    }];
  });
}

export async function findPlisioOperationsByOrderNumbers(orderNumbers: Set<string>): Promise<PlisioOperation[]> {
  const pageSize = 100;
  const matched: PlisioOperation[] = [];
  const remaining = new Set(orderNumbers);
  const seenPageSignatures = new Set<string>();

  for (let page = 1; remaining.size > 0; page++) {
    const operations = await listPlisioOperationsPage(page, pageSize);
    const pageSignature = operations.map((operation) => operation.id).join(",");
    if (operations.length === 0 || seenPageSignatures.has(pageSignature)) break;
    seenPageSignatures.add(pageSignature);

    for (const operation of operations) {
      if (!remaining.has(operation.orderNumber)) continue;
      matched.push(operation);
      remaining.delete(operation.orderNumber);
    }
    if (operations.length < pageSize) break;
  }

  return matched;
}

/**
 * Plisio sends JSON when callback_url includes `json=true`. Their Node example
 * signs JSON.stringify(callbackBody without verify_hash) using HMAC-SHA1.
 */
export async function verifyPlisioWebhook(body: Record<string, unknown>): Promise<boolean> {
  const apiKey = await getRuntimeSetting("plisio_api_key");
  const providedHash = typeof body.verify_hash === "string" ? body.verify_hash : "";
  if (!apiKey || !providedHash) return false;

  const signedBody = { ...body };
  delete signedBody.verify_hash;
  const expectedHash = createHmac("sha1", apiKey).update(JSON.stringify(signedBody)).digest("hex");

  const expected = Buffer.from(expectedHash, "utf8");
  const provided = Buffer.from(providedHash, "utf8");
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

export function mapPlisioStatus(status: unknown): CryptoPaymentStatus {
  switch (String(status || "").trim().toLowerCase()) {
    case "completed":
      return "completed";
    case "mismatch":
    case "underpaid":
      return "underpaid";
    case "expired":
      return "expired";
    case "cancelled":
    case "canceled":
    case "cancelled duplicate":
    case "error":
    case "failed":
      return "failed";
    // new, pending, confirming and any unrecognized non-terminal state
    default:
      return "pending";
  }
}