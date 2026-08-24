import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "./db";
import { cryptoPayments } from "@shared/schema";
import { applyPlisioPaymentStatus } from "./crypto-settlement";
import { findPlisioOperationsByOrderNumbers, mapPlisioStatus } from "./plisio";
import { getRuntimeSetting } from "./settings";

let hasLoggedUnavailableProviderKey = false;

function merchantOrderNumber(metadata: string | null): string | null {
  if (!metadata) return null;
  try {
    const parsed = JSON.parse(metadata) as { merchantOrderNumber?: unknown };
    return typeof parsed.merchantOrderNumber === "string" ? parsed.merchantOrderNumber : null;
  } catch {
    return null;
  }
}

function requestedCurrency(metadata: string | null): string | null {
  if (!metadata) return null;
  try {
    const parsed = JSON.parse(metadata) as { currency?: unknown };
    return typeof parsed.currency === "string" ? parsed.currency.trim().toUpperCase() : null;
  } catch {
    return null;
  }
}

/**
 * Network timeouts during invoice creation are ambiguous: the provider can
 * create the invoice while the response is lost. Reconcile those persisted
 * intents against Plisio's recent operations before releasing stock or
 * terminally failing the local payment.
 */
export async function reconcilePlisioIntents(): Promise<void> {
  try {
    if (!(await getRuntimeSetting("plisio_api_key"))) return;
    hasLoggedUnavailableProviderKey = false;
  } catch (error) {
    // Keep a bad or stale encrypted provider setting from turning the periodic
    // reconciliation job into a stream of unhandled runtime errors.
    if (!hasLoggedUnavailableProviderKey) {
      console.warn("[plisio-reconciler] Provider key is unavailable; reconciliation is paused.");
      hasLoggedUnavailableProviderKey = true;
    }
    return;
  }

  const intents = await db
    .select()
    .from(cryptoPayments)
    .where(and(
      sql`${cryptoPayments.metadata}::jsonb ->> 'state' = 'reconciling'`,
      inArray(cryptoPayments.status, ["pending", "underpaid"]),
    ));
  if (intents.length === 0) return;

  const orderNumbers = new Set(
    intents.map((intent) => merchantOrderNumber(intent.metadata)).filter((value): value is string => Boolean(value)),
  );
  const operations = await findPlisioOperationsByOrderNumbers(orderNumbers);
  const operationsByOrder = new Map(operations.map((operation) => [operation.orderNumber, operation]));

  for (const intent of intents) {
    try {
      const orderNumber = merchantOrderNumber(intent.metadata);
      if (!orderNumber) continue;
      const operation = operationsByOrder.get(orderNumber);
      if (operation) {
        const expectedCurrency = requestedCurrency(intent.metadata);
        const providerCurrency = operation.currency?.trim().toUpperCase();
        if (!expectedCurrency || !providerCurrency || providerCurrency !== expectedCurrency) {
          console.error(
            `[plisio-reconciler] Currency mismatch or missing provider currency for payment intent ${intent.id}; leaving it for manual resolution.`,
          );
          continue;
        }
        if (intent.nowPaymentsPaymentId.startsWith("intent-")) {
          await db
            .update(cryptoPayments)
            .set({
              nowPaymentsPaymentId: operation.id,
              checkoutUrl: operation.invoiceUrl ?? intent.checkoutUrl,
              updatedAt: new Date(),
            })
            .where(and(
              eq(cryptoPayments.id, intent.id),
              eq(cryptoPayments.nowPaymentsPaymentId, intent.nowPaymentsPaymentId),
              inArray(cryptoPayments.status, ["pending", "underpaid"]),
            ));
        }
        // Keep the reconciliation marker until settlement reaches a terminal
        // status. A restart or transient failure after binding will therefore
        // be retried instead of stranding a verified provider operation.
        await applyPlisioPaymentStatus(operation.id, mapPlisioStatus(operation.status), orderNumber, providerCurrency);
        continue;
      }

      // A no-match is not terminal: the provider can still surface a delayed
      // invoice/callback. Leave the intent reconcilable for the next pass
      // rather than releasing stock based on an incomplete external listing.
    } catch (error) {
      console.error(`[plisio-reconciler] Unable to reconcile payment intent ${intent.id}:`, error);
    }
  }
}