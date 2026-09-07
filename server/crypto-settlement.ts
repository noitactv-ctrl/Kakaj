import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "./db";
import { calculateDepositCredit } from "@shared/deposit";
import { formatCardDeliveryContent } from "./card-privacy";
import { appendUniqueDeliveryContent, serializeDeliveryParts, type DeliveryParts } from "./delivery-content";
import {
  cards,
  cryptoPayments,
  orderItems,
  orders,
  stockItems,
  transactions,
  users,
} from "@shared/schema";
import type { CryptoPaymentStatus } from "./plisio";

const PAYABLE_STATUSES: CryptoPaymentStatus[] = ["pending", "underpaid"];

async function settleCompletedPayment(transaction: any, payment: typeof cryptoPayments.$inferSelect) {
  if (payment.purpose === "order" && payment.orderId) {
    const [order] = await transaction
      .select()
      .from(orders)
      .where(and(eq(orders.id, payment.orderId), eq(orders.status, "pending")))
      .limit(1);
    if (!order) throw new Error("The pending order is no longer available for payment.");

    const items = await transaction.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    const deliveryParts: DeliveryParts = {};

    for (const item of items) {
      if (item.cardId) {
        const [card] = await transaction
          .update(cards)
          .set({ isSold: true, userId: order.userId })
          .where(and(eq(cards.id, item.cardId), eq(cards.isSold, false)))
          .returning();
        if (!card) throw new Error("A card in this order is no longer available.");
        appendUniqueDeliveryContent(deliveryParts, "cards", formatCardDeliveryContent(card));
        continue;
      }

      if (!item.variantId || !item.stockItemId) {
        throw new Error("The pending order has an invalid stock reservation.");
      }

      const [stock] = await transaction
        .update(stockItems)
        .set({ isSold: true, isReserved: false })
        .where(and(
          eq(stockItems.id, item.stockItemId),
          eq(stockItems.orderId, order.id),
          eq(stockItems.isReserved, true),
          eq(stockItems.isSold, false),
        ))
        .returning();
      if (!stock) throw new Error("Reserved stock is no longer available.");
      appendUniqueDeliveryContent(deliveryParts, String(item.variantId), stock.content);
    }

    const deliveryContent = serializeDeliveryParts(deliveryParts);
    const [fulfilledOrder] = await transaction
      .update(orders)
      .set({ status: "delivering", deliveryContent, paidAmount: order.total, paymentMethod: "Plisio" })
      .where(and(eq(orders.id, order.id), eq(orders.status, "pending")))
      .returning();
    if (!fulfilledOrder) throw new Error("The pending order changed while the payment was being settled.");

    await transaction.insert(transactions).values({
      userId: payment.userId,
      amount: -payment.amount,
      type: "purchase",
      description: `Crypto order payment ($${(payment.amount / 100).toFixed(2)})`,
      paymentMethod: "Plisio",
    });
    return;
  }

  const credit = calculateDepositCredit(payment.amount);
  const [updatedUser] = await transaction
    .update(users)
    .set({
      balance: sql`${users.balance} + ${credit.creditCents}`,
      protectedBalance: sql`${users.protectedBalance} + ${credit.creditCents}`,
    })
    .where(eq(users.id, payment.userId))
    .returning({ id: users.id });
  if (!updatedUser) throw new Error("The payment user no longer exists.");

  await transaction.insert(transactions).values({
    userId: payment.userId,
    amount: payment.amount,
    type: "deposit",
    description: `Crypto deposit ($${(payment.amount / 100).toFixed(2)})`,
    paymentMethod: "Plisio",
  });
  if (credit.bonusCents > 0) {
    await transaction.insert(transactions).values({
      userId: payment.userId,
      amount: credit.bonusCents,
      type: "deposit_bonus",
      description: `Deposit bonus (+${credit.bonusPercent}%)`,
      paymentMethod: "TurtleCC",
    });
  }
}

async function releaseUnpaidOrder(transaction: any, payment: typeof cryptoPayments.$inferSelect) {
  if (payment.purpose !== "order" || !payment.orderId) return;

  const [order] = await transaction
    .update(orders)
    .set({ status: "waiting_payment" })
    .where(and(eq(orders.id, payment.orderId), eq(orders.status, "pending")))
    .returning();
  if (!order) return;

  await transaction
    .update(stockItems)
    .set({ isReserved: false, orderId: null })
    .where(and(eq(stockItems.orderId, order.id), eq(stockItems.isReserved, true), eq(stockItems.isSold, false)));
  await transaction.delete(orderItems).where(eq(orderItems.orderId, order.id));
}

export async function applyPlisioPaymentStatus(
  providerTransactionId: string,
  nextStatus: CryptoPaymentStatus,
  merchantOrderNumber?: string,
  providerCurrency?: string,
): Promise<{ found: boolean; status?: CryptoPaymentStatus; settled?: boolean }> {
  return db.transaction(async (transaction) => {
    let [existing] = await transaction
      .select()
      .from(cryptoPayments)
      .where(eq(cryptoPayments.nowPaymentsPaymentId, providerTransactionId))
      .limit(1);
    if (existing && providerCurrency && existing.currency.trim().toUpperCase() !== providerCurrency.trim().toUpperCase()) {
      console.error(`[plisio-settlement] Ignoring currency-mismatched callback for payment ${existing.id}.`);
      return { found: true, status: existing.status as CryptoPaymentStatus, settled: false };
    }
    if (!existing && merchantOrderNumber) {
      const [intent] = await transaction
        .select()
        .from(cryptoPayments)
        .where(sql`${cryptoPayments.metadata}::jsonb ->> 'merchantOrderNumber' = ${merchantOrderNumber}`)
        .limit(1);
      const intentState = (() => {
        try {
          return intent?.metadata ? (JSON.parse(intent.metadata) as { state?: unknown }).state : undefined;
        } catch {
          return undefined;
        }
      })();
      const currencyMatches = Boolean(
        providerCurrency &&
        intent &&
        intent.currency.trim().toUpperCase() === providerCurrency.trim().toUpperCase(),
      );
      if (intent && intent.nowPaymentsPaymentId.startsWith("intent-") && intentState !== "currency_mismatch" && currencyMatches) {
        const [boundIntent] = await transaction
          .update(cryptoPayments)
          .set({ nowPaymentsPaymentId: providerTransactionId, updatedAt: new Date() })
          .where(and(
            eq(cryptoPayments.id, intent.id),
            eq(cryptoPayments.nowPaymentsPaymentId, intent.nowPaymentsPaymentId),
            inArray(cryptoPayments.status, PAYABLE_STATUSES),
          ))
          .returning();
        existing = boundIntent;
      }
    }
    if (!existing) return { found: false };
    if (existing.status === "completed") return { found: true, status: "completed", settled: false };
    if (!PAYABLE_STATUSES.includes(existing.status as CryptoPaymentStatus)) {
      return { found: true, status: existing.status as CryptoPaymentStatus, settled: false };
    }

    if (nextStatus === "completed") {
      const [payment] = await transaction
        .update(cryptoPayments)
        .set({ status: "completed", updatedAt: new Date() })
        .where(and(
          eq(cryptoPayments.id, existing.id),
          inArray(cryptoPayments.status, PAYABLE_STATUSES),
        ))
        .returning();
      if (!payment) return { found: true, status: existing.status as CryptoPaymentStatus, settled: false };

      await settleCompletedPayment(transaction, payment);
      return { found: true, status: "completed" as const, settled: true };
    }

    if (nextStatus === "pending" && existing.status === "underpaid") {
      return { found: true, status: "underpaid", settled: false };
    }

    const [payment] = await transaction
      .update(cryptoPayments)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(and(
        eq(cryptoPayments.id, existing.id),
        inArray(cryptoPayments.status, PAYABLE_STATUSES),
      ))
      .returning();
    if (!payment) return { found: true, status: existing.status as CryptoPaymentStatus, settled: false };
    if (nextStatus === "unpaid" || nextStatus === "failed" || nextStatus === "expired") {
      await releaseUnpaidOrder(transaction, payment);
    }
    return { found: true, status: nextStatus, settled: false };
  });
}