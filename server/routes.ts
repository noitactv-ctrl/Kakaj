import express, { type Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { setupAuth, isFounderIdentity } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { createPlisioInvoice, mapPlisioStatus, PlisioInvoiceCreationError, verifyPlisioWebhook } from "./plisio";
import { applyPlisioPaymentStatus } from "./crypto-settlement";
import { hashPassword, comparePassword } from "./auth";
import { randomInt, randomUUID } from "crypto";
import { cryptoPayments, orders, orderItems, variants, userIps, users, mails, mailReads, discountCodes, transactions, stockItems, cards, cardMetadataFixtures, bankRoutingItems, products, redeemCodes } from "@shared/schema";
import { db } from "./db";
import { eq, and, ne, desc, sql, inArray } from "drizzle-orm";
import { calculateDepositCredit } from "@shared/deposit";
import { extractCardMetadata, stripCardholderName } from "./card-privacy";
import {
  cryptoCurrencyCreateSchema,
  cryptoCurrencyUpdateSchema,
  getSupportedPlisioCurrency,
  SUPPORTED_PLISIO_CURRENCIES,
} from "@shared/crypto-currencies";
import {
  deleteApiSetting,
  getApiSettingDefinition,
  getRuntimeSetting,
  listApiSettings,
  saveApiSetting,
  setApiSettingEnabled,
} from "./settings";

function isAdminOrWorker(req: any): boolean {
  const u = req.user as any;
  return req.isAuthenticated() && (u?.role === 'admin' || u?.isWorker === true);
}

function isOwner(req: any): boolean {
  const u = req.user as any;
  return req.isAuthenticated() && isFounderIdentity(u?.email || "");
}

function requireOwner(req: any, res: any): boolean {
  if (isOwner(req)) return true;
  res.status(403).json({ message: "Only the owner can manage admins and workers" });
  return false;
}

class PlisioCurrencyMismatchError extends PlisioInvoiceCreationError {
  constructor(message: string) {
    super(message, false);
    this.name = "PlisioCurrencyMismatchError";
  }
}

function safeCryptoInvoiceDetails(
  invoice: Awaited<ReturnType<typeof createPlisioInvoice>>,
  expectedCurrency: string,
  usdAmountCents: number,
) {
  const raw = invoice as Record<string, unknown>;
  const firstString = (...keys: string[]) => {
    for (const key of keys) {
      if (typeof raw[key] === "string" && raw[key]) return raw[key] as string;
    }
    return undefined;
  };
  return {
    paymentId: invoice.id,
    checkoutUrl: invoice.url,
    currency: expectedCurrency,
    cryptoAmount: invoice.amount,
    paymentAddress: firstString("wallet_hash", "wallet_address", "address"),
    paymentUri: firstString("payment_uri", "pay_url", "qr_code"),
    expiresAt: invoice.expiresAt,
    usdAmountCents,
  };
}

async function getPlisioPublicAppUrl(): Promise<string> {
  const configured = await getRuntimeSetting("plisio_public_app_url");
  if (!configured) {
    throw new PlisioInvoiceCreationError(
      "Crypto checkout needs a Public App URL in Admin > Integrations before invoices can be created.",
      true,
    );
  }
  let publicUrl: URL;
  try {
    publicUrl = new URL(configured);
  } catch {
    throw new PlisioInvoiceCreationError("Crypto checkout Public App URL is invalid.", true);
  }
  if (publicUrl.protocol !== "https:") {
    throw new PlisioInvoiceCreationError("Crypto checkout Public App URL must use HTTPS.", true);
  }
  return publicUrl.origin;
}

function ensureInvoiceCurrency(invoice: Awaited<ReturnType<typeof createPlisioInvoice>>, expectedCurrency: string) {
  const providerCurrency = invoice.currency?.trim().toUpperCase();
  if (providerCurrency && providerCurrency !== expectedCurrency) {
    throw new PlisioCurrencyMismatchError(
      `Payment provider returned ${providerCurrency} instead of the requested ${expectedCurrency}; the invoice is being reconciled.`,
    );
  }
}

async function getEnabledCryptoCurrency(currencyCode: unknown) {
  if (typeof currencyCode !== "string") return undefined;
  const currency = await storage.getCryptoCurrencyByCode(currencyCode);
  return currency?.enabled ? currency : undefined;
}

async function getCryptoReadiness() {
  const methods = await storage.getPaymentMethodsConfig();
  const hasApiKey = Boolean(await getRuntimeSetting("plisio_api_key"));
  let hasTrustedPublicUrl = false;
  try {
    await getPlisioPublicAppUrl();
    hasTrustedPublicUrl = true;
  } catch {
    // Keep provider configuration details out of the public status response.
  }
  const configured = hasApiKey && hasTrustedPublicUrl;
  const enabledCurrencyCount = configured
    ? (await storage.getCryptoCurrencies(true)).length
    : 0;
  const enabled = methods.crypto === true;

  return {
    enabled,
    configured,
    enabledCurrencyCount,
    available: enabled && configured && enabledCurrencyCount > 0,
  };
}

// BIN lookup cache + throttle queue (binlist.net = ~10 req/min free tier)
const binCache = new Map<string, any>();
const binQueue: Array<{ bin: string; resolve: (v: any) => void }> = [];
let binQueueRunning = false;
function processBinQueue() {
  if (binQueueRunning || binQueue.length === 0) return;
  binQueueRunning = true;
  const { bin, resolve } = binQueue.shift()!;
  fetch(`https://lookup.binlist.net/${bin}`, { headers: { "Accept-Version": "3" } })
    .then(async r => {
      if (!r.ok) { resolve({ bin }); return; }
      const data = await r.json() as any;
      const result = {
        bin,
        bank: data.bank?.name ?? null,
        scheme: data.scheme ?? null,
        type: data.type ?? null,
        brand: data.brand ?? null,
        country: data.country?.name ?? null,
        countryCode: data.country?.alpha2 ?? null,
      };
      binCache.set(bin, result);
      resolve(result);
    })
    .catch(() => resolve({ bin }))
    .finally(() => {
      setTimeout(() => { binQueueRunning = false; processBinQueue(); }, 700);
    });
}
function lookupBin(bin: string): Promise<any> {
  if (binCache.has(bin)) return Promise.resolve(binCache.get(bin));
  return new Promise(resolve => { binQueue.push({ bin, resolve }); processBinQueue(); });
}

function findPaymentCardNumber(value: string): string {
  const tokens = value.split(/[|\t:;,\s]+/).map(token => token.trim()).filter(Boolean);
  for (const token of tokens) {
    const digits = token.replace(/\D/g, "");
    if (digits.length >= 13 && digits.length <= 19 && /^[3456]/.test(digits)) return digits;
  }
  const noGaps = value.replace(/[\s-]/g, "");
  return noGaps.match(/[3456]\d{12,18}/)?.[0] ?? "";
}

function hasAccountAndRoutingDetails(value: string): boolean {
  return /\baccount(?:\s+number)?\s*[:=]/i.test(value)
    && /\brouting(?:\s+number)?\s*[:=]/i.test(value);
}

function formatStockAmount(value: unknown): string {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? `$${amount.toFixed(2)}` : "unpriced";
}

function missingCardFields(value: string): string[] {
  const pipeFields = value.split("|").map(field => field.trim());
  const expiryIndex = pipeFields.findIndex(field => /^(0[1-9]|1[0-2])[/\-]\d{2,4}$/.test(field));
  const hasExpiry = expiryIndex !== -1 || /\b(?:expiry|expiration|exp)\s*[:=]\s*(?:0[1-9]|1[0-2])[/\-]\d{2,4}\b/i.test(value);
  const hasCvv = /\b(?:cvv|cvc|security\s*code)\s*[:=]\s*\d{3,4}\b/i.test(value)
    || (expiryIndex >= 0 && /^\d{3,4}$/.test(pipeFields[expiryIndex + 1] ?? ""));
  const hasName = /\b(?:name|cardholder)\s*[:=]\s*[A-Za-z]/i.test(value)
    || (expiryIndex >= 0 && /[A-Za-z]/.test(pipeFields[expiryIndex + 2] ?? ""));
  const hasAddress = /\b(?:address|street)\s*[:=]\s*\S+/i.test(value)
    || (expiryIndex >= 0 && /[A-Za-z]/.test(pipeFields[expiryIndex + 3] ?? ""));
  const hasZip = /\b\d{5}(?:-\d{4})?\b/.test(value);
  return [
    !findPaymentCardNumber(value) && "card number",
    !hasExpiry && "expiration",
    !hasCvv && "CVV",
    !hasName && "cardholder name",
    !hasAddress && "billing address",
    !hasZip && "ZIP",
  ].filter(Boolean) as string[];
}

const cardMetadataFixtureTypes = new Set(["DEBIT", "CREDIT", "PREPAID"]);
const cardMetadataFixtureStates = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS",
  "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY",
  "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI",
  "DC",
]);

function parseCardMetadataFixtures(input: unknown): { bin: string; type: string; state: string; city: string; zip: string }[] {
  if (typeof input !== "string" || input.length > 10000) {
    throw new Error("Metadata bulk input is empty or too large");
  }

  const lines = input.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) throw new Error("Add at least one metadata item");
  if (lines.length > 100) throw new Error("Metadata bulk input is limited to 100 items");

  const seen = new Set<string>();
  return lines.map((line, index) => {
    const fields = line.split("|").map(field => field.trim());
    if (fields.length !== 5) {
      throw new Error(`Metadata item ${index + 1} must use BIN|TYPE|STATE|CITY|ZIP`);
    }

    const bin = fields[0].replace(/\D/g, "");
    const type = fields[1].toUpperCase();
    const state = fields[2].toUpperCase();
    const city = fields[3];
    const zipMatch = fields[4].match(/^(\d{5})(?:-\d{4})?$/);
    const zip = zipMatch?.[1] ?? "";

    if (!/^\d{6}$/.test(bin)) throw new Error(`Metadata item ${index + 1} has an invalid BIN`);
    if (!cardMetadataFixtureTypes.has(type)) throw new Error(`Metadata item ${index + 1} type must be DEBIT, CREDIT, or PREPAID`);
    if (!cardMetadataFixtureStates.has(state)) throw new Error(`Metadata item ${index + 1} has an invalid state`);
    if (!/^[A-Za-z][A-Za-z .'-]{1,59}$/.test(city)) throw new Error(`Metadata item ${index + 1} has an invalid city`);
    if (!zip) throw new Error(`Metadata item ${index + 1} has an invalid ZIP`);

    const key = `${bin}|${type}|${state}|${city.toLowerCase()}|${zip}`;
    if (seen.has(key)) throw new Error(`Metadata item ${index + 1} is a duplicate`);
    seen.add(key);
    return { bin, type, state, city, zip };
  });
}

const gameLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: "Too many game requests. Slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

const recentPlinkoDrops: Array<{ username: string; multiplier: number; createdAt: string }> = [];

const walletLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many wallet requests. Slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.path.startsWith("/api"),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.set('etag', false);
  app.use('/api', apiLimiter);
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    next();
  });

  // Auth setup (handles /api/login, /api/register, /api/logout, /api/user)
  setupAuth(app);

  // Public announcements
  app.get("/api/announcements", async (req, res) => {
    try {
      const all = await storage.getAnnouncements();
      res.json(all);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Products
  app.get(api.products.list.path, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Top selling products in the past hour
  app.get("/api/products/top-selling", async (req, res) => {
    try {
      const queryTop = async (windowMs: number | null) => {
        const base = db
          .select({
            productId: variants.productId,
            salesCount: sql<number>`cast(sum(${orderItems.quantity}) as int)`,
          })
          .from(orderItems)
          .innerJoin(orders, eq(orderItems.orderId, orders.id))
          .innerJoin(variants, eq(orderItems.variantId, variants.id));

        const q = windowMs
          ? base.where(and(
              sql`${orders.createdAt} >= ${new Date(Date.now() - windowMs)}`,
              sql`${orders.status} in ('fulfilled','delivering')`
            ))
          : base.where(sql`${orders.status} in ('fulfilled','delivering')`);

        return q.groupBy(variants.productId).orderBy(desc(sql`sum(${orderItems.quantity})`)).limit(2);
      };

      // Try 1h → 24h → all-time so top 2 are always shown
      let rows = await queryTop(60 * 60 * 1000);
      if (rows.length < 2) rows = await queryTop(24 * 60 * 60 * 1000);
      if (rows.length < 2) rows = await queryTop(null);
      if (rows.length === 0) return res.json([]);

      const allProducts = await storage.getProducts();
      const result = rows
        .map((r) => {
          const product = allProducts.find((p: any) => p.id === r.productId);
          if (!product) return null;
          return { ...product, salesCount: r.salesCount };
        })
        .filter(Boolean);

      res.json(result);
    } catch (err) {
      console.error("top-selling error:", err);
      res.json([]);
    }
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    if (!isAdminOrWorker(req)) return res.status(401).json({ message: "Unauthorized" });
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  });

  // Variants
  app.post(api.variants.create.path, async (req, res) => {
    if (!isAdminOrWorker(req)) return res.status(401).json({ message: "Unauthorized" });
    const variant = await storage.createVariant(req.body);
    res.status(201).json(variant);
  });

  // Stock
  app.post(api.stock.add.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const sellerId = req.body.sellerId ? Number(req.body.sellerId) : undefined;
      const count = await storage.addStockItems(req.body.variantId, req.body.rawContent, sellerId);
      res.json({ addedCount: count.added });
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Failed to add stock" });
    }
  });

  // Orders
  app.post(api.orders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const userId = (req.user as any).id;
      const { items, cardIds, bulkCardIds, discountCodeId, sellerId } = req.body;
      const productItems = (items || []).filter((i: any) => !i.cardId && i.variantId > 0)
        .map((i: any) => ({ ...i, sellerId: sellerId || i.sellerId || undefined }));
      const cardIdList: number[] = cardIds || [];

      const order = await storage.createOrder(userId, productItems, cardIdList, discountCodeId ?? null, bulkCardIds || []);
      res.status(201).json(order);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get(api.orders.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const orders = await storage.getOrders((req.user as any).id);
      res.json(orders);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get(api.orders.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const order = await storage.getOrder(Number(req.params.id));
      if (!order || order.userId !== (req.user as any).id) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Wallet & Redeem
  app.post(api.wallet.redeem.path, walletLimiter, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const codeStr = req.body.code;
      if (!codeStr || typeof codeStr !== "string") {
        return res.status(400).json({ message: "Code required" });
      }

      // Atomic claim — only succeeds if the code exists and is not yet used
      // Using a single UPDATE … WHERE is_used = false prevents double-redeem races
      const claimed = await db
        .update(redeemCodes)
        .set({ isUsed: true, usedBy: (req.user as any).id })
        .where(and(eq(redeemCodes.code, codeStr.trim().toUpperCase()), eq(redeemCodes.isUsed, false)))
        .returning();

      if (claimed.length === 0) {
        return res.status(400).json({ message: "Invalid or already used code" });
      }

      const code = claimed[0];
      const updatedUser = await storage.updateUserBalance((req.user as any).id, code.amount);
      await storage.createTransaction((req.user as any).id, code.amount, "deposit", `Redeemed code: ${code.code}`);

      res.json({ newBalance: updatedUser.balance, amountAdded: code.amount });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get(api.wallet.transactions.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const txs = await storage.getTransactions((req.user as any).id);
    res.json(txs);
  });

  // Combined deposits list (crypto + cashapp deposits) for topup history
  app.get("/api/deposits", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    try {
      // Crypto deposit payments
      const cryptoRows = await db
        .select()
        .from(cryptoPayments)
        .where(and(eq(cryptoPayments.userId, userId), eq(cryptoPayments.purpose, "deposit")))
        .orderBy(desc(cryptoPayments.createdAt))
        .limit(30);

      // Manual deposit orders (CashApp, Chime, Zelle)
      const cashappRows = await db
        .select()
        .from(orders)
        .where(and(eq(orders.userId, userId), sql`${orders.paymentMethod} IN ('CashApp','Chime','Zelle')`))
        .orderBy(desc(orders.createdAt))
        .limit(30);

      // Filter cashapp orders that are deposit-only (no order items)
      const allOrderIds = cashappRows.map(o => o.id);
      let depositOnlyCashapp = cashappRows;
      if (allOrderIds.length > 0) {
        const itemsInOrders = await db
          .select({ orderId: orderItems.orderId })
          .from(orderItems)
          .where(sql`${orderItems.orderId} = ANY(ARRAY[${sql.join(allOrderIds.map(id => sql`${id}`), sql`, `)}]::int[])`);
        const orderIdsWithItems = new Set(itemsInOrders.map(i => i.orderId));
        depositOnlyCashapp = cashappRows.filter(o => !orderIdsWithItems.has(o.id));
      }

      const cryptoDeposits = cryptoRows.map(p => ({
        id: `crypto_${p.id}`,
        type: "crypto" as const,
        amount: p.amount,
        status: p.status,
        paymentId: p.nowPaymentsPaymentId,
        checkoutUrl: p.checkoutUrl,
        currency: p.currency,
        createdAt: p.createdAt,
      }));

      const cashappDeposits = depositOnlyCashapp.map(o => ({
        id: `cashapp_${o.id}`,
        type: (o.paymentMethod?.toLowerCase() ?? "cashapp") as "cashapp" | "chime" | "zelle",
        amount: o.total,
        status: o.status,
        paymentNote: o.paymentNote,
        createdAt: o.createdAt,
      }));

      const all = [...cryptoDeposits, ...cashappDeposits].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      res.json(all);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Admin: all deposits from all users
  app.get("/api/admin/deposits", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const cryptoRows = await db
        .select({
          id: cryptoPayments.id, userId: cryptoPayments.userId, amount: cryptoPayments.amount,
          currency: cryptoPayments.currency, status: cryptoPayments.status, createdAt: cryptoPayments.createdAt,
          username: users.username,
        })
        .from(cryptoPayments)
        .leftJoin(users, eq(cryptoPayments.userId, users.id))
        .where(eq(cryptoPayments.purpose, "deposit"))
        .orderBy(desc(cryptoPayments.createdAt))
        .limit(200);

      const cashappRows = await db
        .select({
          id: orders.id, userId: orders.userId, total: orders.total,
          status: orders.status, paymentNote: orders.paymentNote, createdAt: orders.createdAt,
          paymentMethod: orders.paymentMethod, username: users.username,
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(sql`${orders.paymentMethod} IN ('CashApp','Chime','Zelle')`)
        .orderBy(desc(orders.createdAt))
        .limit(200);

      const allOrderIds = cashappRows.map(o => o.id);
      let depositOnlyCashapp = cashappRows;
      if (allOrderIds.length > 0) {
        const itemsInOrders = await db
          .select({ orderId: orderItems.orderId })
          .from(orderItems)
          .where(sql`${orderItems.orderId} = ANY(ARRAY[${sql.join(allOrderIds.map(id => sql`${id}`), sql`, `)}]::int[])`);
        const orderIdsWithItems = new Set(itemsInOrders.map(i => i.orderId));
        depositOnlyCashapp = cashappRows.filter(o => !orderIdsWithItems.has(o.id));
      }

      const result = [
        ...cryptoRows.map(p => ({
          id: `crypto_${p.id}`, type: "crypto", username: p.username ?? "?",
          amount: p.amount, status: p.status, createdAt: p.createdAt,
        })),
        ...depositOnlyCashapp.map(o => ({
          id: `cashapp_${o.id}`, type: o.paymentMethod?.toLowerCase() ?? "cashapp", username: o.username ?? "?",
          amount: o.total, status: o.status, paymentNote: o.paymentNote, createdAt: o.createdAt,
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json(result);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Games
  app.post(api.games.dice.path, gameLimiter, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
    const user = req.user as any;
    const bet = Number(req.body.betAmount);

    if (!Number.isFinite(bet) || bet <= 0) {
      return res.status(400).json({ message: "Invalid bet amount." });
    }
    if (bet > 100000) {
      return res.status(400).json({ message: "Bet amount exceeds maximum allowed." });
    }

    // Always fetch a fresh balance from the DB to prevent stale session data enabling overbetting
    const freshUser = await storage.getUser(user.id);
    if (!freshUser || freshUser.balance < bet) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct bet
    await storage.updateUserBalance(user.id, -bet);
    await storage.createTransaction(user.id, -bet, "loss", "Dice game bet");

    // Game Logic: Roll 2 dice (1-6). 
    // Spec: "Roll 2 dice vs system. Higher total wins."
    const userRoll = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
    const systemRoll = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
    
    const userTotal = userRoll[0] + userRoll[1];
    const systemTotal = systemRoll[0] + systemRoll[1];
    
    const won = userTotal > systemTotal;
    let payout = 0;

    if (won) {
      payout = bet * 2; // 2x multiplier
      await storage.updateUserBalance(user.id, payout);
      await storage.createTransaction(user.id, payout, "win", "Dice game win");
    }

    const updatedUser = await storage.getUser(user.id);

    res.json({
      won,
      roll: userRoll,
      systemRoll: systemRoll,
      userTotal,
      systemTotal,
      payout,
      newBalance: updatedUser?.balance || 0,
    });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post(api.games.plinko.path, gameLimiter, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const user = req.user as any;
      const bet = Number(req.body.betAmount);
      if (!Number.isFinite(bet) || !Number.isInteger(bet) || bet <= 0) {
        return res.status(400).json({ message: "Invalid bet amount." });
      }
      if (bet > 100000) {
        return res.status(400).json({ message: "Bet amount exceeds maximum allowed." });
      }
      const count = req.body.count === undefined ? 1 : Number(req.body.count);
      if (!Number.isInteger(count) || count < 1 || count > 20) {
        return res.status(400).json({ message: "Drop count must be between 1 and 20." });
      }

      // Sixteen bounces produce seventeen slots. Outcome weights are intentionally
      // server-side only; the client receives only the resolved result and path.
      const multipliers = [20, 10, 5, 5, 2, 1, 0.75, 0.5, 0.3, 0.5, 0.75, 1, 2, 5, 5, 10, 20];
      const weightedSlots = [
        { slots: multipliers.map((value, index) => value === 1 ? index : -1).filter(index => index >= 0), weight: 150000 },
        { slots: multipliers.map((value, index) => value === 2 ? index : -1).filter(index => index >= 0), weight: 80000 },
        { slots: multipliers.map((value, index) => value === 5 ? index : -1).filter(index => index >= 0), weight: 20000 },
        { slots: multipliers.map((value, index) => value === 10 ? index : -1).filter(index => index >= 0), weight: 5000 },
        { slots: multipliers.map((value, index) => value === 20 ? index : -1).filter(index => index >= 0), weight: 1000 },
        { slots: multipliers.map((value, index) => ![1, 2, 5, 10, 20].includes(value) ? index : -1).filter(index => index >= 0), weight: 744000 },
      ];
      const results = Array.from({ length: count }, () => {
        const roll = randomInt(0, 1_000_000);
        let cursor = 0;
        let selected = weightedSlots[weightedSlots.length - 1];
        for (const group of weightedSlots) {
          cursor += group.weight;
          if (roll < cursor) {
            selected = group;
            break;
          }
        }
        const slot = selected.slots[randomInt(0, selected.slots.length)];
        const path: number[] = Array.from({ length: 16 }, (_, row) => row < slot ? 1 : 0);
        for (let index = path.length - 1; index > 0; index--) {
          const swapIndex = randomInt(0, index + 1);
          [path[index], path[swapIndex]] = [path[swapIndex], path[index]];
        }
        const multiplier = multipliers[slot];
        return { slot, multiplier, payout: Math.floor(bet * multiplier), path };
      });

      const settledUser = await storage.settlePlinkoGames(
        user.id,
        results.map(result => ({ betCents: bet, payoutCents: result.payout })),
      );
      if (!settledUser) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      const createdAt = new Date().toISOString();
      recentPlinkoDrops.unshift(
        ...results.map(result => ({
          username: user.username,
          multiplier: result.multiplier,
          createdAt,
        })),
      );
      recentPlinkoDrops.splice(50);
      res.json({ ...results[0], newBalance: settledUser.balance, results });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get(api.games.plinkoRecent.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    res.json(recentPlinkoDrops);
  });

  app.post(api.games.spin.path, gameLimiter, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;

    if (user.lastDailySpin) {
      const last = new Date(user.lastDailySpin);
      const now = new Date();
      if (last.getDate() === now.getDate() && last.getMonth() === now.getMonth() && last.getFullYear() === now.getFullYear()) {
         return res.status(400).json({ message: "Already spun today" });
      }
    }

    // Rewards: $0.05, $0.10, $0.50, $1, $5, $10
    // Weighted probabilities (normalized to request)
    const rewards = [
      { amount: 5, weight: 80 },
      { amount: 10, weight: 60 },
      { amount: 50, weight: 50 },
      { amount: 100, weight: 30 },
      { amount: 500, weight: 20 },
      { amount: 1000, weight: 10 },
    ];

    const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    let reward = 0;

    for (const r of rewards) {
      if (random < r.weight) {
        reward = r.amount;
        break;
      }
      random -= r.weight;
    }

    await storage.updateUserBalance(user.id, reward);
    await storage.updateLastDailySpin(user.id);
    await storage.createTransaction(user.id, reward, "daily_spin", "Daily spin reward");

    const updatedUser = await storage.getUser(user.id);
    
    res.json({
      reward, // in cents
      newBalance: updatedUser?.balance || 0,
    });
  });

  // User - Update Email
  app.patch("/api/user/email", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) return res.status(400).json({ message: "Valid email required" });
      const user = await storage.updateUser((req.user as any).id, { email });
      res.json(user);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // User Rank
  app.get("/api/user/rank", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const result = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), sql`amount > 0`, sql`type IN ('deposit', 'manual_deposit')`));
    const totalDeposited = Number(result[0]?.total ?? 0);
    const rank = totalDeposited >= 100000 ? "nyc" : totalDeposited >= 50000 ? "vip" : totalDeposited >= 10000 ? "regular" : "newbie";
    const discountPct = rank === "nyc" ? 10 : rank === "vip" ? 5 : rank === "regular" ? 2 : 0;
    const nextRankAt = rank === "newbie" ? 10000 : rank === "regular" ? 50000 : rank === "vip" ? 100000 : null;
    res.json({ rank, discountPct, totalDeposited, nextRankAt });
  });

  // User - Update Password
  app.patch("/api/user/password", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) return res.status(400).json({ message: "Both passwords required" });
      const [currentUser] = await db.select().from(users).where(eq(users.id, (req.user as any).id));
      if (!currentUser) return res.status(404).json({ message: "User not found" });
      const isMatch = await comparePassword(currentPassword, currentUser.password);
      if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
      const hashed = await hashPassword(newPassword);
      const user = await storage.updateUser((req.user as any).id, { password: hashed });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // Admin - Deliver Order
  app.post(api.admin.deliverOrder.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const orderId = Number(req.params.id);
      // Accept either deliveryContents (per-product map) or legacy deliveryContent (string)
      let content: string;
      if (req.body.deliveryContents && typeof req.body.deliveryContents === "object") {
        content = JSON.stringify(req.body.deliveryContents);
      } else {
        content = req.body.deliveryContent || "";
      }
      const order = await storage.updateOrderDelivery(orderId, content);
      res.json(order);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // Admin - Ban User
  app.post(api.admin.banUser.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const target = await storage.getUser(Number(req.params.id));
      if (target && isFounderIdentity(target.email || "")) {
        return res.status(403).json({ message: "Cannot modify the owner account" });
      }
      const user = await storage.banUser(Number(req.params.id));
      res.json(user);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // Admin - Unban User
  app.post(api.admin.unbanUser.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const target = await storage.getUser(Number(req.params.id));
      if (target && isFounderIdentity(target.email || "")) {
        return res.status(403).json({ message: "Cannot modify the owner account" });
      }
      const user = await storage.unbanUser(Number(req.params.id));
      res.json(user);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // === MAIL ROUTES ===

  // Admin: send mail to one seller or all sellers
  app.post("/api/admin/mails/send", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(401).json({ message: "Unauthorized" });
    const { title, body, recipientId } = req.body;
    if (!title?.trim() || !body?.trim()) return res.status(400).json({ message: "Title and body required" });
    const [mail] = await db.insert(mails).values({
      title: title.trim(),
      body: body.trim(),
      senderId: (req.user as any).id,
      recipientId: recipientId ? Number(recipientId) : null,
    }).returning();
    res.json(mail);
  });

  // User: get own mails (all-sellers broadcasts + personal)
  app.get("/api/mails", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const allMails = await db.select().from(mails).orderBy(desc(mails.createdAt));
    const myMails = allMails.filter(m => m.recipientId === null || m.recipientId === userId);
    const reads = await db.select().from(mailReads).where(eq(mailReads.userId, userId));
    const readIds = new Set(reads.map(r => r.mailId));
    res.json(myMails.map(m => ({ ...m, isRead: readIds.has(m.id) })));
  });

  // User: mark mail as read
  app.post("/api/mails/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const mailId = Number(req.params.id);
    const existing = await db.select().from(mailReads).where(and(eq(mailReads.mailId, mailId), eq(mailReads.userId, userId)));
    if (existing.length === 0) {
      await db.insert(mailReads).values({ mailId, userId });
    }
    res.json({ ok: true });
  });

  // Admin - Update Order Status
  app.patch("/api/admin/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { status } = req.body;
      const allowed = ["pending", "paid", "delivering", "fulfilled", "cancelled", "refunded"] as const;
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${allowed.join(", ")}` });
      }
      const [order] = await db.update(orders).set({ status }).where(eq(orders.id, Number(req.params.id))).returning();
      res.json(order);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // Admin - Test Order (No Payment)
  app.post("/api/admin/test-order", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { productId, variantId, quantity } = req.body;
      const [variant] = await db.select().from(variants).where(eq(variants.id, variantId));
      if (!variant) throw new Error("Variant not found");
      
      const total = variant.price * quantity;
      const orderId = `TEST-${Date.now()}`;
      
      const [order] = await db.insert(orders).values({
        orderId,
        userId: (req.user as any).id,
        status: "delivering" as any,
        total
      }).returning();

      await db.insert(orderItems).values({
        orderId: order.id,
        variantId: variant.id,
        stockItemId: null,
        cardId: null,
        itemType: "product",
        price: variant.price,
        quantity,
      });
      
      res.status(201).json(order);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // Admin
  app.get(api.admin.dashboard.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  app.post(api.admin.generateCodes.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { amount, count } = req.body;
    const codes = [];
    
    for (let i = 0; i < count; i++) {
      const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
      const codeStr = `VOUCH-${randomStr}`;
      await storage.createRedeemCode(codeStr, amount);
      codes.push(codeStr);
    }
    res.json({ codes });
  });

  // Admin Products (all products including hidden)
  app.get("/api/admin/products", async (req, res) => {
    if (!isAdminOrWorker(req)) return res.status(401).json({ message: "Unauthorized" });
    const products = await storage.getAllProducts();
    res.json(products);
  });

  app.patch("/api/admin/products/:id", async (req, res) => {
    if (!isAdminOrWorker(req)) return res.status(401).json({ message: "Unauthorized" });
    const product = await storage.updateProduct(Number(req.params.id), req.body);
    res.json(product);
  });

  app.delete("/api/admin/products/:id", async (req, res) => {
    if (!isAdminOrWorker(req)) return res.status(401).json({ message: "Unauthorized" });
    await storage.deleteProduct(Number(req.params.id));
    res.json({ success: true });
  });

  app.post("/api/admin/clear-all-data", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      await db.delete(orderItems);
      await db.delete(cryptoPayments);
      await db.delete(stockItems);
      await db.delete(orders);
      await db.delete(variants);
      await db.delete(products);
      await db.delete(cards);
      await db.delete(transactions);
      await db.update(users).set({ balance: 0, protectedBalance: 0 });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/variants/:id", async (req, res) => {
    if (!isAdminOrWorker(req)) return res.status(401).json({ message: "Unauthorized" });
    const variant = await storage.updateVariant(Number(req.params.id), req.body);
    res.json(variant);
  });

  app.delete("/api/admin/variants/:id", async (req, res) => {
    if (!isAdminOrWorker(req)) return res.status(401).json({ message: "Unauthorized" });
    await storage.deleteVariant(Number(req.params.id));
    res.json({ success: true });
  });

  app.post("/api/admin/stock", async (req, res) => {
    if (!isAdminOrWorker(req)) return res.status(401).json({ message: "Unauthorized" });
    try {
      const item = await storage.addSingleStockItem(req.body.variantId, req.body.content);
      res.status(201).json(item);
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Failed to add stock" });
    }
  });

  app.post("/api/admin/stock/bulk", async (req, res) => {
    if (!isAdminOrWorker(req)) return res.status(401).json({ message: "Unauthorized" });
    try {
      const sellerId = req.body.sellerId ? Number(req.body.sellerId) : undefined;
      const result = await storage.addStockItems(req.body.variantId, req.body.rawContent, sellerId);
      res.json({ addedCount: result.added, skippedCount: result.skipped });
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Failed to add stock" });
    }
  });

  app.get("/api/admin/stock/:variantId", async (req, res) => {
    if (!isAdminOrWorker(req)) return res.status(401).json({ message: "Unauthorized" });
    const items = await storage.getStockItems(Number(req.params.variantId));
    res.json(items);
  });

  app.delete("/api/admin/stock/:id", async (req, res) => {
    if (!isAdminOrWorker(req)) return res.status(401).json({ message: "Unauthorized" });
    await storage.deleteStockItem(Number(req.params.id));
    res.json({ success: true });
  });

  // Admin/Worker - Get all orders
  app.get("/api/admin/orders", async (req, res) => {
    if (!isAdminOrWorker(req)) return res.status(401).json({ message: "Unauthorized" });
    const allOrders = await storage.getAllOrders();
    // Deposit-only payment records belong in Deposits, not the product Orders view.
    // Orders paid through these methods still remain visible when they contain items.
    const depositMethods = new Set(["CashApp", "Chime", "Zelle", "Venmo"]);
    const productOrders = allOrders.filter((o: any) =>
      Array.isArray(o.items) && o.items.length > 0
        ? true
        : !depositMethods.has(o.paymentMethod)
    );
    res.json(productOrders);
  });

  // Admin/Worker - Get all users
  app.get("/api/admin/users", async (req, res) => {
    if (!isAdminOrWorker(req)) return res.status(401).json({ message: "Unauthorized" });
    const allUsers = await storage.getAllUsers();
    res.json(allUsers.filter((u: any) => !isFounderIdentity(u.email || "")));
  });

  // Old Admin Orders (keeping for backward compat)
  app.get("/api/admin/orders-old", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const orders = await storage.getAllOrders();
    res.json(orders);
  });

  app.post("/api/admin/orders/:id/refund", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const order = await storage.refundOrder(Number(req.params.id));
    res.json(order);
  });

  app.post("/api/admin/orders/:id/replace", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const order = await storage.replaceOrder(Number(req.params.id));
      res.json(order);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const targetId = Number(req.params.id);
    const target = await storage.getUser(targetId);
    if (target && isFounderIdentity(target.email || "")) return res.status(403).json({ message: "Cannot modify this account" });
    const { isBanned, role, email } = req.body;
    if (role !== undefined && !requireOwner(req, res)) return;
    if (email !== undefined && isFounderIdentity(String(email)) && !isOwner(req)) {
      return res.status(403).json({ message: "Only the owner can assign the owner identity" });
    }
    const user = await storage.updateUser(targetId, { isBanned, role, email });
    res.json(user);
  });

  app.post("/api/admin/users/:id/balance", async (req, res) => {
    if (!req.isAuthenticated() || ((req.user as any).role !== 'admin' && !(req.user as any).isWorker)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.updateUserBalance(Number(req.params.id), req.body.amount);
    if (req.body.amount > 0) {
      await storage.updateProtectedBalance(Number(req.params.id), req.body.amount);
    }
    await storage.createTransaction(Number(req.params.id), req.body.amount, "admin_adjustment", "Admin balance adjustment");
    res.json(user);
  });

  // Set user balance to an absolute value
  app.post("/api/admin/users/:id/set-balance", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = Number(req.params.id);
    const newBalance = Math.round(Number(req.body.balance) * 100); // dollars → cents
    const existing = await storage.getUser(userId);
    if (!existing) return res.status(404).json({ message: "User not found" });
    const delta = newBalance - existing.balance;
    await db.update(users).set({ balance: newBalance } as any).where(eq(users.id, userId));
    await storage.createTransaction(userId, delta, "admin_adjustment", `Admin set balance to $${(newBalance / 100).toFixed(2)}`);
    const updated = await storage.getUser(userId);
    res.json(updated);
  });

  // Set user role (promote/demote admin)
  app.post("/api/admin/users/:id/set-role", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!requireOwner(req, res)) return;
    const userId = Number(req.params.id);
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) return res.status(400).json({ message: "Invalid role" });
    const target = await storage.getUser(userId);
    if (!target) return res.status(404).json({ message: "User not found" });
    if (isFounderIdentity(target.email || "")) return res.status(403).json({ message: "Cannot change the owner account" });
    await db.update(users).set({ role } as any).where(eq(users.id, userId));
    const updated = await storage.getUser(userId);
    res.json(updated);
  });

  // Toggle worker status
  app.post("/api/admin/users/:id/set-worker", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!requireOwner(req, res)) return;
    const userId = Number(req.params.id);
    const { isWorker } = req.body;
    const target = await storage.getUser(userId);
    if (!target) return res.status(404).json({ message: "User not found" });
    if (isFounderIdentity(target.email || "")) return res.status(403).json({ message: "Cannot change the owner account" });
    await db.update(users).set({ isWorker: Boolean(isWorker) } as any).where(eq(users.id, userId));
    const updated = await storage.getUser(userId);
    res.json(updated);
  });

  // Admin: get crypto addresses for a user
  app.get("/api/admin/users/:id/crypto-addresses", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const addresses = await storage.getCryptoAddresses(Number(req.params.id));
    res.json(addresses);
  });

  // Admin: set crypto address for a user
  app.post("/api/admin/users/:id/crypto-addresses", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { currency, address } = req.body;
    if (!currency || !address) return res.status(400).json({ message: "currency and address required" });
    const result = await storage.setCryptoAddress(Number(req.params.id), currency, address);
    res.json(result);
  });

  // User: get own crypto addresses
  app.get("/api/user/crypto-addresses", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const addresses = await storage.getCryptoAddresses(userId);
    res.json(addresses);
  });

  // Admin Balance Codes (list)
  app.get("/api/admin/codes", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const codes = await storage.getAllRedeemCodes();
    res.json(codes);
  });

  // === DISCOUNT CODES ===

  // Validate a discount code (authenticated users)
  app.post("/api/discount/validate", walletLimiter, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const { code, cartTotal } = req.body;
      if (!code || typeof code !== "string") return res.status(400).json({ message: "Code required" });

      const [dc] = await db.select().from(discountCodes)
        .where(eq(discountCodes.code, code.toUpperCase().trim()));

      if (!dc || !dc.isActive) return res.status(404).json({ message: "Invalid or inactive code" });
      if (dc.expiresAt && new Date(dc.expiresAt) < new Date()) return res.status(400).json({ message: "This code has expired" });
      if (dc.maxUses !== null && dc.usedCount >= dc.maxUses) return res.status(400).json({ message: "This code has reached its usage limit" });
      if (dc.minOrder && cartTotal < dc.minOrder) {
        return res.status(400).json({ message: `Minimum order of $${(dc.minOrder / 100).toFixed(2)} required` });
      }

      const discountAmount = dc.type === "percent"
        ? Math.round(cartTotal * dc.value / 100)
        : Math.min(dc.value, cartTotal);

      res.json({ id: dc.id, code: dc.code, type: dc.type, value: dc.value, discountAmount });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // Admin: list discount codes
  app.get("/api/admin/discount-codes", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(401).json({ message: "Unauthorized" });
    const all = await db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt));
    res.json(all);
  });

  // Admin: create discount code
  app.post("/api/admin/discount-codes", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(401).json({ message: "Unauthorized" });
    try {
      const { code, type, value, minOrder, maxUses, expiresAt } = req.body;
      const normalizedCode = typeof code === "string" ? code.toUpperCase().trim() : "";
      const numericValue = Number(value);
      const numericMinOrder = minOrder === "" || minOrder === undefined || minOrder === null ? 0 : Number(minOrder);
      const numericMaxUses = maxUses === "" || maxUses === undefined || maxUses === null ? null : Number(maxUses);
      const expiry = expiresAt ? new Date(expiresAt) : null;

      if (!normalizedCode || !type || !Number.isFinite(numericValue) || numericValue <= 0) {
        return res.status(400).json({ message: "Code, type, and a positive value are required" });
      }
      if (!["percent", "fixed"].includes(type)) return res.status(400).json({ message: "Type must be percent or fixed" });
      if (type === "percent" && (numericValue < 1 || numericValue > 100)) return res.status(400).json({ message: "Percent must be 1–100" });
      if (!Number.isFinite(numericMinOrder) || numericMinOrder < 0) return res.status(400).json({ message: "Minimum order must be zero or greater" });
      if (numericMaxUses !== null && (!Number.isInteger(numericMaxUses) || numericMaxUses < 1)) {
        return res.status(400).json({ message: "Usage limit must be a whole number of at least 1" });
      }
      if (expiry && (Number.isNaN(expiry.getTime()) || expiry <= new Date())) {
        return res.status(400).json({ message: "Expiration must be a future date" });
      }

      const [dc] = await db.insert(discountCodes).values({
        code: normalizedCode,
        type,
        value: type === "fixed" ? Math.round(numericValue * 100) : Math.round(numericValue),
        minOrder: Math.round(numericMinOrder * 100),
        maxUses: numericMaxUses,
        expiresAt: expiry,
      }).returning();
      res.status(201).json(dc);
    } catch (e: any) {
      if (e.code === "23505") return res.status(400).json({ message: "A code with that name already exists" });
      res.status(400).json({ message: e.message });
    }
  });

  // Admin: toggle active / delete discount code
  app.patch("/api/admin/discount-codes/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(401).json({ message: "Unauthorized" });
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1 || typeof req.body.isActive !== "boolean") {
      return res.status(400).json({ message: "A valid code ID and active state are required" });
    }
    const [dc] = await db.update(discountCodes).set({ isActive: req.body.isActive }).where(eq(discountCodes.id, id)).returning();
    if (!dc) return res.status(404).json({ message: "Discount code not found" });
    res.json(dc);
  });

  app.delete("/api/admin/discount-codes/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(401).json({ message: "Unauthorized" });
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid discount code ID" });
    const [deleted] = await db.delete(discountCodes).where(eq(discountCodes.id, id)).returning({ id: discountCodes.id });
    if (!deleted) return res.status(404).json({ message: "Discount code not found" });
    res.json({ success: true });
  });

  // Admin Announcements
  app.get("/api/admin/announcements", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const announcements = await storage.getAllAnnouncements();
    res.json(announcements);
  });

  app.post("/api/admin/announcements", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const announcement = await storage.createAnnouncement(req.body);
    res.status(201).json(announcement);
  });

  // Admin Logs
  app.get("/api/admin/logs", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const logs = await storage.getAdminLogs();
    res.json(logs);
  });

  // Image Upload (Admin only)
  app.post("/api/upload", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { filename, mimeType, data } = req.body;
    if (!filename || !mimeType || !data) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const image = await storage.uploadImage(filename, mimeType, data);
    res.status(201).json({ id: image.id, url: `/api/images/${image.id}` });
  });

  // Serve uploaded images
  app.get("/api/images/:id", async (req, res) => {
    const image = await storage.getImage(Number(req.params.id));
    if (!image) return res.status(404).json({ message: "Image not found" });
    
    const buffer = Buffer.from(image.data, 'base64');
    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  });

  // Cards
  // === CARD BASES ===
  app.get("/api/card-bases", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const bases = await storage.getCardBasesWithCount();
    res.json(bases);
  });

  app.post("/api/admin/card-bases", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(401).json({ message: "Unauthorized" });
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Name required" });
    try {
      const base = await storage.createCardBase(name.trim());
      res.status(201).json(base);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/admin/card-bases/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(401).json({ message: "Unauthorized" });
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Name required" });
    try {
      const base = await storage.updateCardBase(Number(req.params.id), name.trim());
      res.json(base);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.delete("/api/admin/card-bases/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(401).json({ message: "Unauthorized" });
    try {
      await storage.deleteCardBase(Number(req.params.id));
      res.json({ ok: true });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/admin/card-metadata-fixtures", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "worker"].includes((req.user as any).role)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const fixtures = await db.select().from(cardMetadataFixtures).orderBy(desc(cardMetadataFixtures.createdAt));
    res.json(fixtures);
  });

  app.post("/api/admin/card-metadata-fixtures", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "worker"].includes((req.user as any).role)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const parsed = parseCardMetadataFixtures(req.body?.items);
      const created = [];
      let skipped = 0;

      for (const fixture of parsed) {
        const existing = await db.select({ id: cardMetadataFixtures.id })
          .from(cardMetadataFixtures)
          .where(and(
            eq(cardMetadataFixtures.bin, fixture.bin),
            eq(cardMetadataFixtures.type, fixture.type),
            eq(cardMetadataFixtures.state, fixture.state),
            eq(cardMetadataFixtures.city, fixture.city),
            eq(cardMetadataFixtures.zip, fixture.zip),
          ))
          .limit(1);

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        const [row] = await db.insert(cardMetadataFixtures).values(fixture).returning();
        created.push(row);
      }

      res.status(201).json({ fixtures: created, count: created.length, skipped });
    } catch (error: any) {
      res.status(400).json({ message: error?.message || "Invalid metadata bulk input" });
    }
  });

  app.delete("/api/admin/card-metadata-fixtures/:id", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "worker"].includes((req.user as any).role)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await db.delete(cardMetadataFixtures).where(eq(cardMetadataFixtures.id, Number(req.params.id)));
    res.json({ ok: true });
  });

  app.get("/api/admin/card-bases/:id/cards", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(401).json({ message: "Unauthorized" });
    const cards = await storage.getCardsByBase(Number(req.params.id));
    res.json(cards.map(card => {
      const extras = stripCardholderName(card.extras);
      return { ...card, extras, metadata: extractCardMetadata(extras, card.cardNumber, card.binData) };
    }));
  });

  app.get("/api/cards", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const baseId = req.query.baseId ? Number(req.query.baseId) : null;
    const baseFilter = baseId ? sql`AND c.base_id = ${baseId}` : sql``;
    const { rows } = await db.execute(sql`
      SELECT c.id, c.card_number, c.masked_card, c.expiry, c.cvv, c.country, c.extras,
             c.price, c.hr_percent, c.is_sold, c.user_id, c.created_at, c.bin_data,
             c.base_id, cb.name as base_name
      FROM cards c
      LEFT JOIN card_bases cb ON cb.id = c.base_id
      WHERE c.is_sold = false ${baseFilter}
      ORDER BY c.created_at DESC
    `) as any;

    // For cards missing bin_data in DB, kick off background lookups + save results
    const needsLookup = rows.filter((r: any) => !r.bin_data && (r.card_number ?? "").replace(/\D/g, "").length >= 6);
    const seenBins = new Set<string>();
    needsLookup.forEach((r: any) => {
      const bin = (r.card_number ?? "").replace(/\D/g, "").substring(0, 6);
      if (bin.length === 6 && !seenBins.has(bin)) {
        seenBins.add(bin);
        lookupBin(bin).then(async (data) => {
          if (data?.bank || data?.scheme || data?.type) {
            await db.execute(sql`UPDATE cards SET bin_data = ${JSON.stringify(data)}::jsonb WHERE card_number LIKE ${bin + '%'} AND bin_data IS NULL`);
          }
        }).catch(() => {});
      }
    });

    res.json(rows.map((r: any) => {
      const extras = stripCardholderName(r.extras);
      return {
        id: r.id, cardNumber: r.card_number, maskedCard: r.masked_card,
        expiry: r.expiry, cvv: r.cvv, country: r.country, extras,
        price: r.price, hrPercent: r.hr_percent ?? 80, isSold: r.is_sold,
        userId: r.user_id, createdAt: r.created_at,
        binData: r.bin_data ?? null,
        metadata: extractCardMetadata(extras, r.card_number, r.bin_data),
        baseId: r.base_id ?? null, baseName: r.base_name ?? null,
      };
    }));
  });

  app.post("/api/cards", async (req, res) => {
    if (!req.isAuthenticated() || ((req.user as any).role !== 'admin' && !(req.user as any).isWorker)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const rawInput: string = req.body.extras || "";

    // Multiple cards can be pasted at once, separated by a blank line
    const entries = rawInput.split(/\n\s*\n/).map((e: string) => e.trim()).filter(Boolean);
    if (entries.length === 0) {
      return res.status(400).json({ message: "Full item is required" });
    }

    const baseId = req.body.baseId ? Number(req.body.baseId) : undefined;
    const priceCents = Math.round(parseFloat(req.body.price || "0") * 100);
    const stockAmount = formatStockAmount(req.body.price);

    const createdCards: any[] = [];

    for (const fullItem of entries) {
      if (hasAccountAndRoutingDetails(fullItem)) {
        return res.status(400).json({
          message: `Flagged card (${stockAmount}): account and routing details were detected. Do not stock banking-account data as a card.`,
        });
      }
      const missingFields = missingCardFields(fullItem);
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Flagged card (${stockAmount}) is missing: ${missingFields.join(", ")}.`,
        });
      }
      const cardNumber = findPaymentCardNumber(fullItem);
      const masked = cardNumber.length >= 4
        ? cardNumber.substring(0, 6) + "*".repeat(Math.max(0, cardNumber.length - 10)) + cardNumber.slice(-4)
        : cardNumber;
      let country = "Unknown";
      let storedBinData: any = null;

      if (cardNumber.length >= 6) {
        const bin = cardNumber.substring(0, 6);
        try {
          const binResult = await lookupBin(bin);
          if (binResult) {
            const metadata = extractCardMetadata(fullItem, cardNumber, binResult);
            storedBinData = {
              ...binResult,
              bin: metadata.bin,
              type: metadata.type || binResult.type || "",
              state: metadata.state,
              city: metadata.city,
              zip: metadata.zip,
            };
            country = binResult.country || "Unknown";
          }
        } catch {}
      }

      const card = await storage.createCard({
        cardNumber,
        maskedCard: masked,
        expiry: "",
        cvv: "",
        country,
        extras: stripCardholderName(fullItem),
        price: priceCents,
        hrPercent: 80,
        ...(baseId ? { baseId } : {}),
      } as any);

      // Save binData to DB immediately so it's always available
      if (storedBinData) {
        await db.execute(sql`UPDATE cards SET bin_data = ${JSON.stringify(storedBinData)}::jsonb WHERE id = ${card.id}`);
      }

       const safeExtras = stripCardholderName(fullItem);
       createdCards.push({
         ...card,
         extras: safeExtras,
         binData: storedBinData,
         metadata: extractCardMetadata(safeExtras, cardNumber, storedBinData),
       });
    }

    if (createdCards.length === 1) {
      res.status(201).json(createdCards[0]);
    } else {
      res.status(201).json({ cards: createdCards, count: createdCards.length });
    }
  });

  app.post("/api/cards/:id/purchase", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const cardId = Number(req.params.id);
      const userId = (req.user as any).id;
      const card = await storage.getCard(cardId);
      if (!card) return res.status(404).json({ message: "Card not found" });

      // Apply rank discount
      const rankResult = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(transactions)
        .where(and(eq(transactions.userId, userId), sql`amount > 0`, sql`type IN ('deposit', 'manual_deposit')`));
      const totalDeposited = Number(rankResult[0]?.total ?? 0);
      const rankPct = totalDeposited >= 100000 ? 10 : totalDeposited >= 50000 ? 5 : totalDeposited >= 10000 ? 2 : 0;
      const finalPrice = rankPct > 0 ? Math.max(0, Math.round(card.price * (1 - rankPct / 100))) : card.price;

      const user = await storage.getUser(userId);
      if (!user || user.balance < finalPrice) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      await storage.updateUserBalance(userId, -finalPrice);
      await storage.createTransaction(userId, -finalPrice, "purchase", `Purchased card ${card.maskedCard}`);

      const updatedCard = await storage.purchaseCard(cardId, userId, finalPrice);
      res.json(updatedCard);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/user/cards", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const cards = await storage.getUserCards((req.user as any).id);
    res.json(cards);
  });

  app.delete("/api/admin/cards/:id", async (req, res) => {
    if (!isAdminOrWorker(req)) return res.status(401).json({ message: "Unauthorized" });
    await storage.deleteCard(Number(req.params.id));
    res.json({ success: true });
  });

  // Support
  app.post("/api/support", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const userId = (req.user as any).id;
      const { orderId, subject, description } = req.body;

      if (!orderId?.trim()) return res.status(400).json({ message: "Order ID is required" });
      if (!subject?.trim()) return res.status(400).json({ message: "Issue type is required" });
      if (!description?.trim()) return res.status(400).json({ message: "Description is required" });

      // Validate that the order belongs to this user
      const [matchedOrder] = await db
        .select({ id: orders.id })
        .from(orders)
        .where(and(eq(orders.orderId, orderId.trim()), eq(orders.userId, userId)));

      if (!matchedOrder) {
        return res.status(400).json({ message: "Order ID not found. Please check your Orders page and enter a valid Order ID." });
      }
      const [purchasedItem] = await db
        .select({ id: orderItems.id })
        .from(orderItems)
        .where(eq(orderItems.orderId, matchedOrder.id))
        .limit(1);
      if (!purchasedItem) {
        return res.status(400).json({ message: "Support tickets are only available for purchased items, not deposit orders." });
      }

      const ticket = await storage.createSupportTicket({ ...req.body, userId });
      res.status(201).json(ticket);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/support", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const tickets = await storage.getSupportTickets((req.user as any).id);
    res.json(tickets);
  });

  app.get("/api/admin/support", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const tickets = await storage.getSupportTickets();
    res.json(tickets);
  });

  app.patch("/api/admin/support/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { action, message } = req.body;
    const ticket = await storage.getSupportTicket(Number(req.params.id));
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    try {
      if (action === "refund") {
        const order = await db.select().from(orders).where(eq(orders.orderId, ticket.orderId)).limit(1);
        if (order.length > 0) {
          await storage.refundOrder(order[0].id);
        }
      } else if (action === "replace") {
        const order = await db.select().from(orders).where(eq(orders.orderId, ticket.orderId)).limit(1);
        if (order.length > 0) {
          await storage.replaceOrder(order[0].id);
        }
      }
    } catch (e: any) {
      return res.status(400).json({ message: e.message });
    }

    const newStatus = action === "refund" ? "refunded" : action === "replace" ? "replaced" : "resolved";
    const updated = await storage.updateSupportTicket(Number(req.params.id), { 
      status: newStatus,
      adminMessage: message || ticket.adminMessage
    });
    res.json(updated);
  });

  app.post("/api/orders/crypto", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    let pendingOrderId: number | null = null;
    let paymentIntentCreated = false;
    let merchantOrderNumber: string | null = null;
    let requestedCurrency: string | null = null;
    try {
      const methods = await storage.getPaymentMethodsConfig();
      if (methods.crypto !== true) return res.status(400).json({ message: "Crypto payments are not available" });
      if (!(await getRuntimeSetting("plisio_api_key"))) {
        return res.status(503).json({ message: "Crypto checkout is not configured yet." });
      }
      if (!(await getRuntimeSetting("plisio_public_app_url"))) {
        return res.status(503).json({ message: "Crypto checkout needs a Public App URL in Admin > Integrations." });
      }
      const userId = (req.user as any).id;
      const { items, cardIds, bulkCardIds, discountCodeId, currencyCode } = req.body;
      const cryptoCurrency = await getEnabledCryptoCurrency(currencyCode);
      if (!cryptoCurrency) {
        return res.status(400).json({ message: "Select an enabled crypto currency." });
      }
      requestedCurrency = cryptoCurrency.code;
      const productItems = (items || []).filter((i: any) => !i.cardId && i.variantId > 0);
      const cardIdList: number[] = cardIds || [];

      const order = await storage.createPendingOrder(userId, productItems, cardIdList, discountCodeId ?? null, bulkCardIds || []);
      pendingOrderId = order.id;

      const totalWithFee = order.total;
      const amountUsd = totalWithFee / 100;
      const intentId = `intent-${randomUUID()}`;
      const orderNumber = `order-${order.id}-${randomUUID()}`;
      merchantOrderNumber = orderNumber;

      const origin = await getPlisioPublicAppUrl();
      const callbackUrl = new URL("/api/webhooks/plisio", origin);
      callbackUrl.searchParams.set("json", "true");

      // Persist an intent before creating an external invoice. The intent keeps
      // a signed callback reconcilable if the provider request succeeds but the
      // transaction-ID binding fails immediately afterward.
      await db.insert(cryptoPayments).values({
        userId,
        nowPaymentsPaymentId: intentId,
        amount: totalWithFee,
        currency: cryptoCurrency.code,
        status: "pending",
        purpose: "order",
        orderId: order.id,
        checkoutUrl: null,
        metadata: JSON.stringify({ provider: "plisio", merchantOrderNumber: orderNumber, currency: cryptoCurrency.code, state: "intent" }),
      });
      paymentIntentCreated = true;
      await db.update(orders).set({ paymentMethod: "Plisio" }).where(eq(orders.id, order.id));

      const invoice = await createPlisioInvoice({
        amountUsd,
        currency: cryptoCurrency.code,
        orderNumber,
        orderName: `Order #${order.orderId}`,
        successInvoiceUrl: `${origin}/orders`,
        failInvoiceUrl: `${origin}/orders`,
        callbackUrl: callbackUrl.toString(),
      });
      if (!invoice.id || !invoice.url) {
        return res.status(502).json({ message: "Payment provider error. Please try again." });
      }
      ensureInvoiceCurrency(invoice, cryptoCurrency.code);

      const [boundPayment] = await db
        .update(cryptoPayments)
        .set({
          nowPaymentsPaymentId: invoice.id,
          checkoutUrl: invoice.url,
          metadata: JSON.stringify({
            provider: "plisio",
            merchantOrderNumber: orderNumber,
            cryptoAmount: invoice.amount,
            currency: cryptoCurrency.code,
            expiresAt: invoice.expiresAt,
          }),
          updatedAt: new Date(),
        })
        .where(and(eq(cryptoPayments.nowPaymentsPaymentId, intentId), eq(cryptoPayments.orderId, order.id)))
        .returning({ id: cryptoPayments.id });
      if (!boundPayment) throw new Error("Unable to finalize the crypto payment intent.");

      pendingOrderId = null;
      res.status(201).json({
        order,
        ...safeCryptoInvoiceDetails(invoice, cryptoCurrency.code, totalWithFee),
      });
    } catch (e: any) {
      console.error("Crypto order creation failed:", e);
      const definitiveProviderFailure = e instanceof PlisioInvoiceCreationError && e.definitive;
        const currencyMismatch = e instanceof PlisioCurrencyMismatchError;
      if (pendingOrderId != null && (!paymentIntentCreated || definitiveProviderFailure)) {
        try { await storage.cancelPendingOrder(pendingOrderId as number); } catch {}
      }
      if (paymentIntentCreated && !definitiveProviderFailure) {
        await db
          .update(cryptoPayments)
          .set({
            metadata: JSON.stringify({
              provider: "plisio",
              merchantOrderNumber,
              currency: requestedCurrency,
              state: e instanceof PlisioCurrencyMismatchError ? "currency_mismatch" : "reconciling",
            }),
            updatedAt: new Date(),
          })
          .where(eq(cryptoPayments.orderId, pendingOrderId as number));
      }
      res.status(paymentIntentCreated && !definitiveProviderFailure ? 502 : 400).json({
          message: currencyMismatch
            ? "The payment provider returned an unexpected currency. Do not send payment; contact support."
            : paymentIntentCreated && !definitiveProviderFailure
          ? "Your payment setup is being reconciled. Do not retry or send funds; contact support if it does not appear shortly."
          : e.message,
      });
    }
  });

  app.post("/api/payments/crypto/create", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const methods = await storage.getPaymentMethodsConfig();
      if (methods.crypto !== true) return res.status(400).json({ message: "Crypto payments are not available" });
      if (!(await getRuntimeSetting("plisio_api_key"))) {
        return res.status(503).json({ message: "Crypto checkout is not configured yet." });
      }
      if (!(await getRuntimeSetting("plisio_public_app_url"))) {
        return res.status(503).json({ message: "Crypto checkout needs a Public App URL in Admin > Integrations." });
      }
      const { amount, purpose, currencyCode } = req.body;
      if (purpose && purpose !== "deposit") {
        return res.status(400).json({ message: "Crypto orders must be created from checkout." });
      }
      // amount arrives in cents from the frontend (e.g. 500 = $5.00)
      const amountUsd = parseFloat(amount) / 100;
      const cryptoCurrency = await getEnabledCryptoCurrency(currencyCode);
      if (!cryptoCurrency) {
        return res.status(400).json({ message: "Select an enabled crypto currency." });
      }

      const configuredCryptoMin = parseFloat(await storage.getSetting("min_deposit_crypto", "0")) || 0;
      const cryptoMin = Math.max(1, configuredCryptoMin);
      if (!amountUsd || amountUsd < cryptoMin) {
        return res.status(400).json({ message: `Minimum deposit is $${cryptoMin.toFixed(2)}` });
      }
      if (amountUsd > 1000000000) {
        return res.status(400).json({ message: "Maximum deposit is $1,000,000,000" });
      }

      const userId = (req.user as any).id;
      const baseUrl = await getPlisioPublicAppUrl();
      const intentId = `intent-${randomUUID()}`;
      const merchantOrderNumber = `deposit-${userId}-${randomUUID()}`;
      const callbackUrl = new URL("/api/webhooks/plisio", baseUrl);
      callbackUrl.searchParams.set("json", "true");

      await db.insert(cryptoPayments).values({
        userId,
        nowPaymentsPaymentId: intentId,
        amount: Math.round(amountUsd * 100),
        currency: cryptoCurrency.code,
        status: "pending",
        purpose: "deposit",
        orderId: null,
        checkoutUrl: null,
        metadata: JSON.stringify({ provider: "plisio", merchantOrderNumber, currency: cryptoCurrency.code, state: "intent" }),
      });

      let invoiceCreated = false;
      try {
        const invoice = await createPlisioInvoice({
          amountUsd,
          currency: cryptoCurrency.code,
          orderNumber: merchantOrderNumber,
          orderName: `Balance deposit for user ${userId}`,
          successInvoiceUrl: `${baseUrl}/deposit`,
          failInvoiceUrl: `${baseUrl}/deposit`,
          callbackUrl: callbackUrl.toString(),
        });
        invoiceCreated = true;
        ensureInvoiceCurrency(invoice, cryptoCurrency.code);

        const [boundPayment] = await db
          .update(cryptoPayments)
          .set({
            nowPaymentsPaymentId: invoice.id,
            checkoutUrl: invoice.url,
            metadata: JSON.stringify({
              provider: "plisio",
              merchantOrderNumber,
              cryptoAmount: invoice.amount,
              currency: cryptoCurrency.code,
              expiresAt: invoice.expiresAt,
            }),
            updatedAt: new Date(),
          })
          .where(eq(cryptoPayments.nowPaymentsPaymentId, intentId))
          .returning({ id: cryptoPayments.id });
        if (!boundPayment) throw new Error("Unable to finalize the crypto payment intent.");

        res.json(safeCryptoInvoiceDetails(invoice, cryptoCurrency.code, Math.round(amountUsd * 100)));
      } catch (error: any) {
        const definitiveProviderFailure = error instanceof PlisioInvoiceCreationError && error.definitive;
        const currencyMismatch = error instanceof PlisioCurrencyMismatchError;
        if (!invoiceCreated && definitiveProviderFailure) {
          await db.delete(cryptoPayments).where(eq(cryptoPayments.nowPaymentsPaymentId, intentId));
          throw error;
        }
        if (!definitiveProviderFailure) {
          await db
            .update(cryptoPayments)
            .set({
              metadata: JSON.stringify({
                provider: "plisio",
                merchantOrderNumber,
                currency: cryptoCurrency.code,
                state: error instanceof PlisioCurrencyMismatchError ? "currency_mismatch" : "reconciling",
              }),
              updatedAt: new Date(),
            })
            .where(eq(cryptoPayments.nowPaymentsPaymentId, intentId));
        }
        console.error("Plisio invoice requires reconciliation:", error);
        res.status(502).json({
          message: currencyMismatch
            ? "The payment provider returned an unexpected currency. Do not send payment; contact support."
            : "Your payment invoice is being reconciled. Do not send a payment until support confirms it.",
        });
      }
    } catch (error: any) {
      console.error("Plisio invoice creation failed:", error);
      res.status(500).json({ message: "Failed to create payment. Please try again later." });
    }
  });

  app.get("/api/payments/crypto/:paymentId/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { paymentId } = req.params;
      const userId = (req.user as any).id;

      const [localPayment] = await db
        .select()
        .from(cryptoPayments)
        .where(eq(cryptoPayments.nowPaymentsPaymentId, paymentId))
        .limit(1);

      if (!localPayment || localPayment.userId !== userId) {
        return res.status(404).json({ message: "Payment not found" });
      }

      res.json({
        status: localPayment.status,
        amount: localPayment.amount,
        purpose: localPayment.purpose,
        orderId: localPayment.orderId,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/webhooks/plisio", async (req, res) => {
    try {
      const body = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
      if (!(await verifyPlisioWebhook(body))) {
        console.warn("Plisio callback rejected because its signature was invalid.");
        return res.status(401).json({ message: "Invalid signature" });
      }

      const transactionId = typeof body.txn_id === "string" ? body.txn_id : "";
      if (!transactionId) {
        return res.status(400).json({ message: "Missing Plisio transaction ID" });
      }

      const merchantOrderNumber = typeof body.order_number === "string" ? body.order_number : undefined;
      const callbackCurrency = typeof body.currency === "string"
        ? body.currency
        : typeof body.psys_cid === "string"
          ? body.psys_cid
          : undefined;
      const result = await applyPlisioPaymentStatus(
        transactionId,
        mapPlisioStatus(body.status),
        merchantOrderNumber,
        callbackCurrency,
      );
      res.status(200).json({ received: true, knownPayment: result.found, status: result.status });
    } catch (error: any) {
      console.error("Plisio callback processing error:", error);
      res.status(500).json({ message: "Unable to process callback" });
    }
  });

  // ── Payment method config (public) ───────────────────────────────────────
  app.get("/api/payment-methods", async (_req, res) => {
    const config = await storage.getPaymentMethodsConfig();
    const cryptoReadiness = await getCryptoReadiness();
    res.json({ ...config, crypto: cryptoReadiness.available });
  });

  app.get("/api/crypto-currencies", async (_req, res) => {
    const cryptoReadiness = await getCryptoReadiness();
    if (!cryptoReadiness.available) return res.json([]);
    res.json(await storage.getCryptoCurrencies(true));
  });

  app.get("/api/crypto-readiness", async (_req, res) => {
    res.json(await getCryptoReadiness());
  });

  // ── Payment method admin toggle ───────────────────────────────────────────
  app.get("/api/admin/payment-methods", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(await storage.getPaymentMethodsConfig());
  });

  app.patch("/api/admin/payment-methods/:method", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { method } = req.params;
    const { enabled } = req.body;
    if (!["crypto", "cashapp", "wallet", "chime", "zelle", "venmo"].includes(method) || typeof enabled !== "boolean") {
      return res.status(400).json({ message: "Invalid request" });
    }
    await storage.setSetting(`payment_method_${method}`, String(enabled));
    res.json(await storage.getPaymentMethodsConfig());
  });

  app.get("/api/admin/crypto-currencies", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(await storage.getCryptoCurrencies());
  });

  app.get("/api/admin/crypto-currencies/supported", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(SUPPORTED_PLISIO_CURRENCIES);
  });

  app.post("/api/admin/crypto-currencies", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const parsed = cryptoCurrencyCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid currency" });
    const providerCurrency = getSupportedPlisioCurrency(parsed.data.code);
    if (!providerCurrency) return res.status(400).json({ message: "That currency is not supported by the Plisio catalog." });
    if (await storage.getCryptoCurrencyByCode(providerCurrency.code)) {
      return res.status(409).json({ message: `${providerCurrency.code} is already in your crypto catalog.` });
    }
    const currency = await storage.createCryptoCurrency({
      code: providerCurrency.code,
      name: parsed.data.name ?? providerCurrency.name,
      ticker: parsed.data.ticker ?? providerCurrency.ticker,
      color: parsed.data.color ?? providerCurrency.color,
      enabled: parsed.data.enabled ?? true,
      sortOrder: parsed.data.sortOrder ?? (await storage.getCryptoCurrencies()).length,
    });
    res.status(201).json(currency);
  });

  app.patch("/api/admin/crypto-currencies/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid currency ID." });
    const parsed = cryptoCurrencyUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid currency" });
    const updated = await storage.updateCryptoCurrency(id, {
      ...parsed.data,
      ticker: parsed.data.ticker?.toUpperCase(),
    });
    if (!updated) return res.status(404).json({ message: "Currency not found." });
    res.json(updated);
  });

  // ── Integrations status ──────────────────────────────────────────────────
  app.get("/api/admin/integrations/status", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const plisioKey = await getRuntimeSetting("plisio_api_key");
    res.json({
      PLISIO_API_KEY: !!plisioKey,
    });
  });

  // ── API URLs and server-side secrets ──────────────────────────────────────
  app.get("/api/admin/api-settings", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      res.json({
        settings: await listApiSettings(),
        encryptionConfigured: Boolean(process.env.SETTINGS_ENCRYPTION_KEY || process.env.SESSION_SECRET),
      });
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Unable to load API settings." });
    }
  });

  app.put("/api/admin/api-settings/:key", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const key = String(req.params.key);
      const definition = getApiSettingDefinition(key);
      if (!definition) {
        return res.status(404).json({ message: "Setting not found." });
      }
      const { value, enabled } = req.body;
      if (value !== undefined && typeof value !== "string") {
        return res.status(400).json({ message: "Setting value must be text." });
      }
      await saveApiSetting({
        key,
        kind: definition.kind,
        value,
        enabled: typeof enabled === "boolean" ? enabled : undefined,
      });
      res.json({ ok: true });
    } catch (error: any) {
      res.status(400).json({ message: error?.message || "Unable to save API setting." });
    }
  });

  app.patch("/api/admin/api-settings/:key", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const key = String(req.params.key);
      if (typeof req.body.enabled !== "boolean") {
        return res.status(400).json({ message: "Enabled must be true or false." });
      }
      if (!getApiSettingDefinition(key)) {
        return res.status(404).json({ message: "Setting not found." });
      }
      await setApiSettingEnabled(key, req.body.enabled);
      res.json({ ok: true });
    } catch (error: any) {
      res.status(400).json({ message: error?.message || "Unable to update API setting." });
    }
  });

  app.delete("/api/admin/api-settings/:key", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const key = String(req.params.key);
      if (!getApiSettingDefinition(key)) {
        return res.status(404).json({ message: "Setting not found." });
      }
      await deleteApiSetting(key);
      res.json({ ok: true });
    } catch (error: any) {
      res.status(400).json({ message: error?.message || "Unable to clear API setting." });
    }
  });

  // ── Admin: CashApp tag setting ────────────────────────────────────────────
  app.get("/api/admin/settings/cashapp-tag", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(401).json({ message: "Unauthorized" });
    const tag = await storage.getSetting("cashapp_tag", "");
    res.json({ tag });
  });

  app.post("/api/admin/settings/cashapp-tag", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(401).json({ message: "Unauthorized" });
    const { tag } = req.body;
    if (typeof tag !== "string") return res.status(400).json({ message: "Invalid tag" });
    await storage.setSetting("cashapp_tag", tag.trim());
    res.json({ tag: tag.trim() });
  });

  function getCashAppUrl(tag: string): string {
    const value = tag.trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    const account = value.replace(/^cash\.app\//i, "").replace(/^\/+/, "");
    return `https://cash.app/${account.startsWith("$") ? account : `$${account}`}`;
  }

  // ── Admin: Chime handle setting ────────────────────────────────────────────
  app.get("/api/admin/settings/chime-handle", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(401).json({ message: "Unauthorized" });
    const handle = await storage.getSetting("chime_handle", "");
    res.json({ handle });
  });

  app.post("/api/admin/settings/chime-handle", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(401).json({ message: "Unauthorized" });
    const { handle } = req.body;
    if (typeof handle !== "string") return res.status(400).json({ message: "Invalid handle" });
    await storage.setSetting("chime_handle", handle.trim());
    res.json({ handle: handle.trim() });
  });

  // ── Admin: Zelle handle setting ────────────────────────────────────────────
  app.get("/api/admin/settings/zelle-handle", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(401).json({ message: "Unauthorized" });
    const handle = await storage.getSetting("zelle_handle", "");
    res.json({ handle });
  });

  app.post("/api/admin/settings/zelle-handle", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(401).json({ message: "Unauthorized" });
    const { handle } = req.body;
    if (typeof handle !== "string") return res.status(400).json({ message: "Invalid handle" });
    await storage.setSetting("zelle_handle", handle.trim());
    res.json({ handle: handle.trim() });
  });

  // ── Admin: Venmo handle setting ────────────────────────────────────────────
  app.get("/api/admin/settings/venmo-handle", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(401).json({ message: "Unauthorized" });
    const handle = await storage.getSetting("venmo_handle", "");
    res.json({ handle });
  });

  app.post("/api/admin/settings/venmo-handle", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(401).json({ message: "Unauthorized" });
    const { handle } = req.body;
    if (typeof handle !== "string") return res.status(400).json({ message: "Invalid handle" });
    await storage.setSetting("venmo_handle", handle.trim());
    res.json({ handle: handle.trim() });
  });

  // ── Admin: Min deposit per payment method ──────────────────────────────────
  app.get("/api/admin/settings/min-deposits", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(401).json({ message: "Unauthorized" });
    const [cashapp, venmo, zelle, chime, crypto] = await Promise.all([
      storage.getSetting("min_deposit_cashapp", "0"),
      storage.getSetting("min_deposit_venmo", "0"),
      storage.getSetting("min_deposit_zelle", "0"),
      storage.getSetting("min_deposit_chime", "0"),
      storage.getSetting("min_deposit_crypto", "0"),
    ]);
    res.json({ cashapp: parseFloat(cashapp), venmo: parseFloat(venmo), zelle: parseFloat(zelle), chime: parseFloat(chime), crypto: parseFloat(crypto) });
  });

  app.post("/api/admin/settings/min-deposits", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(401).json({ message: "Unauthorized" });
    const { method, min } = req.body;
    if (!["cashapp", "venmo", "zelle", "chime", "crypto"].includes(method) || typeof min !== "number" || min < 0) {
      return res.status(400).json({ message: "Invalid request" });
    }
    await storage.setSetting(`min_deposit_${method}`, String(min));
    res.json({ ok: true });
  });

  // ── Public: min deposits (for deposit page) ────────────────────────────────
  app.get("/api/site-settings/min-deposits", async (_req, res) => {
    const [cashapp, venmo, zelle, chime, crypto] = await Promise.all([
      storage.getSetting("min_deposit_cashapp", "0"),
      storage.getSetting("min_deposit_venmo", "0"),
      storage.getSetting("min_deposit_zelle", "0"),
      storage.getSetting("min_deposit_chime", "0"),
      storage.getSetting("min_deposit_crypto", "0"),
    ]);
    res.json({ cashapp: parseFloat(cashapp), venmo: parseFloat(venmo), zelle: parseFloat(zelle), chime: parseFloat(chime), crypto: parseFloat(crypto) });
  });

  // ── Public: manual payment methods config (for deposit page) ─────────────
  app.get("/api/site-settings/manual-payments", async (req, res) => {
    const [methods, cashappTag, chimeHandle, zelleHandle, venmoHandle,
           cashappFee, chimeFee, zelleFee] = await Promise.all([
      storage.getPaymentMethodsConfig(),
      storage.getSetting("cashapp_tag", ""),
      storage.getSetting("chime_handle", ""),
      storage.getSetting("zelle_handle", ""),
      storage.getSetting("venmo_handle", ""),
      storage.getSetting("cashapp_fee", "0"),
      storage.getSetting("chime_fee", "0"),
      storage.getSetting("zelle_fee", "0"),
    ]);
    res.json({
      cashapp: { enabled: methods.cashapp === true && !!cashappTag.trim(), tag: cashappTag, url: getCashAppUrl(cashappTag), fee: parseFloat(cashappFee) || 0 },
      chime:   { enabled: methods.chime === true && !!chimeHandle.trim(), handle: chimeHandle, fee: parseFloat(chimeFee) || 0 },
      zelle:   { enabled: methods.zelle === true && !!zelleHandle.trim(), handle: zelleHandle, fee: parseFloat(zelleFee) || 0 },
      venmo:   { enabled: methods.venmo === true && !!venmoHandle.trim(), handle: venmoHandle, fee: 0 },
    });
  });

  // ── Admin: payment method fee settings ───────────────────────────────────
  for (const method of ["cashapp", "chime", "zelle"]) {
    app.get(`/api/admin/settings/${method}-fee`, async (req, res) => {
      if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(401).json({ message: "Unauthorized" });
      const fee = await storage.getSetting(`${method}_fee`, "0");
      res.json({ fee: parseFloat(fee) || 0 });
    });
    app.post(`/api/admin/settings/${method}-fee`, async (req, res) => {
      if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.status(401).json({ message: "Unauthorized" });
      const val = Math.max(0, Math.min(100, parseFloat(req.body.fee) || 0));
      await storage.setSetting(`${method}_fee`, String(val));
      res.json({ fee: val });
    });
  }


  // ── CashApp order (checkout) + deposit ───────────────────────────────────
  app.get("/api/site-settings/cashapp-tag", async (req, res) => {
    const tag = await storage.getSetting("cashapp_tag", "");
    res.json({ tag, cashappUrl: getCashAppUrl(tag) });
  });

  function generateNote(): string {
    const words = ["Fuel", "Gas", "Snack", "Food", "Lunch", "Coffee"];
    const word = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(1000 + Math.random() * 89000);
    return `${word} - ${num}`;
  }

  app.post("/api/orders/cashapp", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    let pendingOrderId: number | null = null;
    try {
      const userId = (req.user as any).id;
      const { items, amount, cardIds, bulkCardIds } = req.body;
      const productItems = (items || []).filter((i: any) => !i.cardId && i.variantId > 0);
      const cardIdList: number[] = cardIds || [];
      const paymentNote = generateNote();
      const cashappTag = await storage.getSetting("cashapp_tag", "");
      const methods = await storage.getPaymentMethodsConfig();
      if (methods.cashapp !== true || !cashappTag.trim()) {
        return res.status(400).json({ message: "CashApp payments are not available" });
      }

      // Deposit-only mode: user specifies how much they want to deposit
      if (productItems.length === 0 && cardIdList.length === 0) {
        const depositAmount = amount ? Math.round(parseFloat(String(amount)) * 100) : 0;
        const configuredMin = parseFloat(await storage.getSetting("min_deposit_cashapp", "0")) || 0;
        const cashappMin = Math.max(0.01, configuredMin);
        if (!depositAmount || depositAmount < Math.round(cashappMin * 100)) {
          return res.status(400).json({ message: `Minimum deposit is $${cashappMin.toFixed(2)}` });
        }
        const publicOrderId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const [order] = await db.insert(orders).values({
          userId,
          orderId: publicOrderId,
          total: depositAmount,
          paidAmount: 0,
          status: "pending",
          paymentMethod: "CashApp",
          paymentNote,
          deliveryContent: "",
        }).returning();
        return res.status(201).json({
          order: { ...order, paymentMethod: "CashApp", paymentNote },
          paymentNote,
          cashappTag,
          cashappUrl: getCashAppUrl(cashappTag),
        });
      }

      // Checkout mode: reserve stock
      const { discountCodeId } = req.body;
      const order = await storage.createPendingOrder(userId, productItems, cardIdList, discountCodeId ?? null, bulkCardIds || []);
      pendingOrderId = order.id;

      // Apply configured processing fee as a surcharge the buyer pays on top
      const feePct = parseFloat(await storage.getSetting("cashapp_fee", "0")) || 0;
      const feeAmount = Math.round(order.total * feePct / 100);
      const dueTotal = order.total + feeAmount;

      const [updatedOrder] = await db.update(orders)
        .set({ paymentMethod: "CashApp", paymentNote, total: dueTotal })
        .where(eq(orders.id, order.id))
        .returning();
      pendingOrderId = null;
      res.status(201).json({
        order: { ...updatedOrder, paymentMethod: "CashApp", paymentNote },
        paymentNote,
        cashappTag,
        cashappUrl: getCashAppUrl(cashappTag),
        fee: feeAmount,
        feePct,
      });
    } catch (e: any) {
      console.error("CashApp order creation failed:", e);
      if (pendingOrderId != null) { try { await storage.cancelPendingOrder(pendingOrderId as number); } catch {} }
      res.status(400).json({ message: e.message });
    }
  });

  // ── Chime deposit ─────────────────────────────────────────────────────────
  app.post("/api/deposits/chime", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const methods = await storage.getPaymentMethodsConfig();
      const handle = await storage.getSetting("chime_handle", "");
      if (methods.chime !== true || !handle.trim()) return res.status(400).json({ message: "Chime deposits are not available" });
      const userId = (req.user as any).id;
      const { amount } = req.body;
      const amountUsd = parseFloat(String(amount));
      if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
        return res.status(400).json({ message: "Valid amount required" });
      }
      const minimum = Math.max(0.01, parseFloat(await storage.getSetting("min_deposit_chime", "0")) || 0);
      if (amountUsd < minimum) return res.status(400).json({ message: `Minimum deposit is $${minimum.toFixed(2)}` });
      const depositAmount = Math.round(amountUsd * 100);
      const paymentNote = generateNote();
      const publicOrderId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const [order] = await db.insert(orders).values({
        userId, orderId: publicOrderId, total: depositAmount, paidAmount: 0,
        status: "pending", paymentMethod: "Chime", paymentNote, deliveryContent: "",
      }).returning();
      res.status(201).json({ order, paymentNote, handle });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // ── Zelle deposit ─────────────────────────────────────────────────────────
  app.post("/api/deposits/zelle", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const methods = await storage.getPaymentMethodsConfig();
      const handle = await storage.getSetting("zelle_handle", "");
      if (methods.zelle !== true || !handle.trim()) return res.status(400).json({ message: "Zelle deposits are not available" });
      const userId = (req.user as any).id;
      const { amount } = req.body;
      const amountUsd = parseFloat(String(amount));
      if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
        return res.status(400).json({ message: "Valid amount required" });
      }
      const minimum = Math.max(0.01, parseFloat(await storage.getSetting("min_deposit_zelle", "0")) || 0);
      if (amountUsd < minimum) return res.status(400).json({ message: `Minimum deposit is $${minimum.toFixed(2)}` });
      const depositAmount = Math.round(amountUsd * 100);
      const paymentNote = generateNote();
      const publicOrderId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const [order] = await db.insert(orders).values({
        userId, orderId: publicOrderId, total: depositAmount, paidAmount: 0,
        status: "pending", paymentMethod: "Zelle", paymentNote, deliveryContent: "",
      }).returning();
      res.status(201).json({ order, paymentNote, handle });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // ── Venmo deposit ─────────────────────────────────────────────────────────
  app.post("/api/deposits/venmo", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const methods = await storage.getPaymentMethodsConfig();
      const handle = await storage.getSetting("venmo_handle", "");
      if (methods.venmo !== true || !handle.trim()) return res.status(400).json({ message: "Venmo deposits are not available" });
      const amountUsd = parseFloat(String(req.body.amount));
      if (!Number.isFinite(amountUsd) || amountUsd <= 0) return res.status(400).json({ message: "Valid amount required" });
      const minimum = Math.max(0.01, parseFloat(await storage.getSetting("min_deposit_venmo", "0")) || 0);
      if (amountUsd < minimum) return res.status(400).json({ message: `Minimum deposit is $${minimum.toFixed(2)}` });

      const paymentNote = generateNote();
      const [order] = await db.insert(orders).values({
        userId: (req.user as any).id,
        orderId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        total: Math.round(amountUsd * 100),
        paidAmount: 0,
        status: "pending",
        paymentMethod: "Venmo",
        paymentNote,
        deliveryContent: "",
      }).returning();
      res.status(201).json({ order, paymentNote, handle });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // ── Admin: fulfill CashApp order (Paid) ──────────────────────────────────
  app.post("/api/admin/orders/:id/cashapp-fulfill", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const paidAmount = req.body.paidAmount !== undefined
        ? Math.round(Number(req.body.paidAmount) * 100)
        : undefined;
      const order = await storage.fulfillCashappOrder(Number(req.params.id), paidAmount);
      res.json(order);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // ── Admin: push stock to any pending order ────────────────────────────────
  app.post("/api/admin/orders/:id/push-stock", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const order = await storage.fulfillCashappOrder(Number(req.params.id));
      res.json(order);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // ── Admin: mark order unpaid ──────────────────────────────────────────────
  app.post("/api/admin/orders/:id/mark-unpaid", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const order = await storage.markOrderUnpaid(Number(req.params.id));
      res.json(order);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });



  // Seed Data (if empty)
  const seedStats = await storage.getDashboardStats();
  if (seedStats.totalUsers === 0) {
    console.log("Seeding database...");
    const { hashPassword } = await import("./auth");
    const adminPass = await hashPassword("admin123");
    await storage.createUser({
      username: "admin",
      password: adminPass,
      email: "admin@store.com",
      role: "admin",
      confirmPassword: "admin123"
    } as any);

    const demoPass = await hashPassword("user123");
    await storage.createUser({
      username: "demo",
      password: demoPass,
      email: "demo@user.com",
      role: "user",
      confirmPassword: "user123"
    } as any);

    // Seed Product
    const prod = await storage.createProduct({
      name: "Netflix Premium (1 Month)",
      description: "4K UHD, 4 Screens. Private account.",
      image: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
      category: "",
      active: true
    });

    const variant = await storage.createVariant({
      productId: prod.id,
      name: "Private Account",
      price: 500 // $5.00
    });

    await storage.addStockItems(variant.id, 
      "user1@email.com\npass1\nextra_info1\n\nuser2@email.com\npass2\nextra_info2"
    );
  }

  // ── Public Bank Routing Catalog ──────────────────────────────
  // The legacy routing handlers remain below for historical compatibility,
  // but the sensitive catalog is permanently disabled at the API boundary.
  app.use(["/api/routings", "/api/admin/routings"], (_req, res) => {
    res.status(410).json({ message: "Bank routing is no longer available." });
  });

  const routingInputSchema = z.object({
    bankName: z.string().trim().min(1, "Bank name is required").max(120, "Bank name must contain at most 120 characters"),
    routingNumber: z.string().trim().regex(/^\d{9}$/, "Routing number must contain exactly 9 digits"),
    state: z.string().trim().regex(/^[A-Za-z]{2}$/, "State must be a two-letter abbreviation").transform(value => value.toUpperCase()),
    zip: z.string().trim().regex(/^\d{5}(?:-\d{4})?$/, "ZIP must be 5 digits or ZIP+4"),
    bin: z.string().trim().regex(/^\d{6,8}$/, "BIN must contain 6 to 8 digits"),
    issuer: z.string().trim().min(1, "Issuer is required").max(120, "Issuer must contain at most 120 characters"),
    price: z.coerce.number().min(0.01).max(100000).default(5),
  });

  const splitRoutingRecords = (rawContent: string) => {
    const trimmed = rawContent.trim();
    if (!trimmed) return [];
    if (/\r?\n\s*\r?\n/.test(trimmed)) {
      return trimmed.split(/\r?\n\s*\r?\n/).map(record => record.trim()).filter(Boolean);
    }
    const lines = trimmed.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const hasLabeledFields = lines.some(line => /^(?:bank(?:\s+name)?|routing(?:\s+number)?|state|zip|postal(?:\s+code)?|bin|issuer|price)\s*[:=]/i.test(line));
    return hasLabeledFields || lines.length === 1 ? [trimmed] : lines;
  };

  const extractRoutingFields = (record: string, defaultPrice: number) => {
    const pipeFields = record.split("|").map(part => part.trim());
    if (pipeFields.length > 1) {
      const [bankName, routingNumber, state, zip, bin, issuer, recordPrice] = pipeFields;
      return {
        bankName,
        routingNumber,
        state,
        zip,
        bin,
        issuer,
        price: recordPrice || defaultPrice,
      };
    }

    const labeledFields: Record<string, string> = {};
    for (const line of record.split(/\r?\n/)) {
      const match = line.match(/^\s*([^:=]+?)\s*[:=]\s*(.*?)\s*$/);
      if (!match) continue;
      const key = match[1].trim().toLowerCase().replace(/\s+/g, " ");
      const value = match[2].trim();
      if (["bank", "bank name", "name"].includes(key)) labeledFields.bankName = value;
      else if (["routing", "routing number", "aba"].includes(key)) labeledFields.routingNumber = value;
      else if (["state"].includes(key)) labeledFields.state = value;
      else if (["zip", "postal", "postal code"].includes(key)) labeledFields.zip = value;
      else if (["bin", "iin"].includes(key)) labeledFields.bin = value;
      else if (["issuer", "issuer name"].includes(key)) labeledFields.issuer = value;
      else if (["price"].includes(key)) labeledFields.price = value;
    }
    return { ...labeledFields, price: labeledFields.price || defaultPrice };
  };

  const parseRoutingRecord = (record: string, defaultPrice: number) => {
    return routingInputSchema.safeParse(extractRoutingFields(record, defaultPrice));
  };

  const missingRoutingFields = (record: string, defaultPrice: number) => {
    const fields = extractRoutingFields(record, defaultPrice);
    const required: Array<[keyof typeof fields, string]> = [
      ["bankName", "bank name"],
      ["routingNumber", "9-digit routing number"],
      ["state", "state"],
      ["zip", "ZIP"],
      ["bin", "BIN"],
      ["issuer", "issuer"],
    ];
    return required
      .filter(([key]) => !String(fields[key] ?? "").trim())
      .map(([, label]) => label);
  };

  const routingPurchaseSchema = z.object({
    itemIds: z.array(z.coerce.number().int().positive()).min(1).max(100),
  }).refine(value => new Set(value.itemIds).size === value.itemIds.length, {
    message: "Each routing item can only be purchased once",
  });
  const routingBulkPurchaseSchema = z.object({
    itemIds: z.array(z.coerce.number().int().positive()).length(20, "Bank bulk bundles must contain exactly 20 banks"),
  }).refine(value => new Set(value.itemIds).size === value.itemIds.length, {
    message: "Each bank can only be selected once",
  });

  app.get("/api/routings", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const items = await db.select({
      id: bankRoutingItems.id,
      bankName: bankRoutingItems.bankName,
      routingNumber: bankRoutingItems.routingNumber,
      state: bankRoutingItems.state,
      zip: bankRoutingItems.zip,
      bin: bankRoutingItems.bin,
      issuer: bankRoutingItems.issuer,
      price: bankRoutingItems.price,
      createdAt: bankRoutingItems.createdAt,
    }).from(bankRoutingItems)
      .where(eq(bankRoutingItems.isSold, false))
      .orderBy(desc(bankRoutingItems.createdAt));
    res.json(items);
  });

  app.get("/api/admin/routings", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const items = await db.select().from(bankRoutingItems).orderBy(desc(bankRoutingItems.createdAt));
    res.json(items);
  });

  app.post("/api/admin/routings", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const parsed = routingInputSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid routing item" });
    const [existing] = await db.select({ id: bankRoutingItems.id }).from(bankRoutingItems)
      .where(eq(bankRoutingItems.routingNumber, parsed.data.routingNumber));
    if (existing) return res.status(409).json({ message: "This routing number is already in inventory" });
    const [item] = await db.insert(bankRoutingItems).values({
      ...parsed.data,
      price: Math.round(parsed.data.price * 100),
    }).returning();
    res.status(201).json(item);
  });

  app.post("/api/admin/routings/bulk", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const rawContent = String(req.body?.rawContent ?? "").trim();
    const rawRecords = splitRoutingRecords(rawContent);
    if (rawRecords.length === 0 || rawRecords.length > 500) {
      return res.status(400).json({ message: "Provide between 1 and 500 routing records" });
    }
    const defaultPrice = Number(req.body?.price ?? 5);
    const stockAmount = formatStockAmount(defaultPrice);
    const flaggedAccountRecord = rawRecords.find(record => hasAccountAndRoutingDetails(record));
    if (flaggedAccountRecord) {
      return res.status(400).json({
        message: `Flagged bank (${stockAmount}): account and routing details are not public bank metadata and cannot be stocked here.`,
      });
    }
    const flaggedCardRecord = rawRecords.find(record => Boolean(findPaymentCardNumber(record)));
    if (flaggedCardRecord) {
      return res.status(400).json({
        message: `Flagged bank (${stockAmount}): card details were detected. Use only public bank routing metadata here.`,
      });
    }
    const staged = rawRecords.map(record => parseRoutingRecord(record, defaultPrice));
    const invalid = staged.find(result => !result.success);
    if (invalid && !invalid.success) {
      const recordIndex = staged.indexOf(invalid);
      const missing = missingRoutingFields(rawRecords[recordIndex], defaultPrice);
      if (missing.length > 0) {
        return res.status(400).json({ message: `Bank record ${recordIndex + 1} is missing: ${missing.join(", ")}.` });
      }
      return res.status(400).json({ message: invalid.error.issues[0]?.message ?? "Invalid routing record" });
    }
    const data = staged.map(result => (result as z.SafeParseSuccess<z.infer<typeof routingInputSchema>>).data);
    const seen = new Set<string>();
    const duplicateInBatch = data.find(item => seen.has(item.routingNumber) || !seen.add(item.routingNumber));
    if (duplicateInBatch) return res.status(400).json({ message: `Routing number ${duplicateInBatch.routingNumber} appears more than once` });
    const current = await db.select({ routingNumber: bankRoutingItems.routingNumber }).from(bankRoutingItems)
      .where(inArray(bankRoutingItems.routingNumber, data.map(item => item.routingNumber)));
    if (current.length > 0) return res.status(409).json({ message: `Routing number ${current[0].routingNumber} is already in inventory` });
    const inserted = await db.insert(bankRoutingItems).values(data.map(item => ({
      ...item,
      price: Math.round(item.price * 100),
    }))).returning();
    res.status(201).json({ addedCount: inserted.length });
  });

  app.delete("/api/admin/routings/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: "Invalid routing item" });
    await db.delete(bankRoutingItems).where(and(eq(bankRoutingItems.id, id), eq(bankRoutingItems.isSold, false)));
    res.json({ success: true });
  });

  app.post("/api/routings/purchase", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const parsed = routingPurchaseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid purchase" });
    const userId = (req.user as any).id as number;
    try {
      const result = await db.transaction(async (tx) => {
        const selected = await tx.select().from(bankRoutingItems)
          .where(and(inArray(bankRoutingItems.id, parsed.data.itemIds), eq(bankRoutingItems.isSold, false)))
          .for("update");
        if (selected.length !== parsed.data.itemIds.length) throw new Error("One or more routing items are no longer available");

        const grossTotal = selected.reduce((total, item) => total + item.price, 0);
        const depositRows = await tx.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
          .from(transactions)
          .where(and(eq(transactions.userId, userId), sql`amount > 0`, sql`type IN ('deposit', 'manual_deposit')`));
        const deposited = Number(depositRows[0]?.total ?? 0);
        const discountPct = deposited >= 100000 ? 10 : deposited >= 50000 ? 5 : deposited >= 10000 ? 2 : 0;
        const total = discountPct ? Math.round(grossTotal * (1 - discountPct / 100)) : grossTotal;

        const [buyer] = await tx.update(users)
          .set({ balance: sql`${users.balance} - ${total}` })
          .where(and(eq(users.id, userId), sql`${users.balance} >= ${total}`))
          .returning();
        if (!buyer) throw new Error("Insufficient balance");

        const routingRows = selected.map(item => [
          item.bankName,
           `Issuer: ${item.issuer || item.bankName}`,
           `BIN: ${item.bin || "Not provided"}`,
          `Routing: ${item.routingNumber}`,
          `State: ${item.state}`,
          `ZIP: ${item.zip}`,
        ].join("\n")).join("\n\n---\n\n");
        const publicOrderId = Math.random().toString(36).substring(2, 15);
        const [order] = await tx.insert(orders).values({
          userId,
          orderId: `ROUTING-${publicOrderId}`,
          total,
          paidAmount: total,
          status: "fulfilled",
          deliveryContent: routingRows,
          paymentMethod: "wallet",
        }).returning();
        await tx.update(bankRoutingItems).set({ isSold: true, purchasedBy: userId, soldAt: new Date() })
          .where(and(inArray(bankRoutingItems.id, selected.map(item => item.id)), eq(bankRoutingItems.isSold, false)));
        await tx.insert(transactions).values({
          userId,
          amount: -total,
          type: "purchase",
          description: `Purchased ${selected.length} bank routing ${selected.length === 1 ? "record" : "records"}`,
          paymentMethod: "wallet",
        });
        return { order, total, discountPct, balance: buyer.balance };
      });
      res.json({ success: true, orderId: result.order.id, total: result.total, discountPct: result.discountPct, balance: result.balance });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Unable to complete routing purchase" });
    }
  });

  app.post("/api/routings/bulk-purchase", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const parsed = routingBulkPurchaseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Select exactly 20 banks" });
    const userId = (req.user as any).id as number;
    const bulkTotal = 20 * 100;

    try {
      const result = await db.transaction(async (tx) => {
        const selected = await tx.select().from(bankRoutingItems)
          .where(and(inArray(bankRoutingItems.id, parsed.data.itemIds), eq(bankRoutingItems.isSold, false)))
          .for("update");
        if (selected.length !== 20) throw new Error("One or more selected banks are no longer available");

        const [buyer] = await tx.update(users)
          .set({ balance: sql`${users.balance} - ${bulkTotal}` })
          .where(and(eq(users.id, userId), sql`${users.balance} >= ${bulkTotal}`))
          .returning();
        if (!buyer) throw new Error("Insufficient balance for the $20 bank bulk bundle");

        const routingRows = selected.map(item => [
          item.bankName,
           `Issuer: ${item.issuer || item.bankName}`,
           `BIN: ${item.bin || "Not provided"}`,
          `Routing: ${item.routingNumber}`,
          `State: ${item.state}`,
          `ZIP: ${item.zip}`,
        ].join("\n")).join("\n\n---\n\n");
        const publicOrderId = Math.random().toString(36).substring(2, 15);
        const [order] = await tx.insert(orders).values({
          userId,
          orderId: `ROUTING-BULK-${publicOrderId}`,
          total: bulkTotal,
          paidAmount: bulkTotal,
          status: "fulfilled",
          deliveryContent: routingRows,
          paymentMethod: "wallet",
        }).returning();
        await tx.update(bankRoutingItems).set({ isSold: true, purchasedBy: userId, soldAt: new Date() })
          .where(and(inArray(bankRoutingItems.id, selected.map(item => item.id)), eq(bankRoutingItems.isSold, false)));
        await tx.insert(transactions).values({
          userId,
          amount: -bulkTotal,
          type: "purchase",
          description: "Purchased 20 bank routing bulk bundle ($1 each)",
          paymentMethod: "wallet",
        });
        return { order, balance: buyer.balance };
      });
      res.json({ success: true, orderId: result.order.id, total: bulkTotal, balance: result.balance });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Unable to complete bank bulk purchase" });
    }
  });

  // === SELLER APPLICATIONS ===
  app.get("/api/seller/me", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const app = await storage.getSellerApplication(userId);
    res.json(app || null);
  });

  app.post("/api/seller/apply", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const existing = await storage.getSellerApplication(userId);
    if (existing && existing.status === "pending") {
      return res.status(400).json({ message: "You already have a pending application" });
    }
    const { note } = req.body;
    const code = "SELL-" + Math.random().toString(36).toUpperCase().slice(2, 8);
    const app = await storage.createSellerApplication(userId, code);
    // store note in the application
    if (note) {
      await db.execute(sql`UPDATE seller_applications SET note = ${String(note)} WHERE id = ${app.id}`);
    }
    res.json({ ok: true });
  });

  app.get("/api/admin/seller-applications", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const apps = await storage.getAllSellerApplications();
    res.json(apps);
  });

  app.post("/api/admin/seller-applications/:id/approve", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await storage.approveSellerApplication(Number(req.params.id));
    res.json({ ok: true });
  });

  app.post("/api/admin/seller-applications/:id/reject", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { note } = req.body;
    await storage.rejectSellerApplication(Number(req.params.id));
    if (note) {
      await db.execute(sql`UPDATE seller_applications SET note = ${String(note)} WHERE id = ${Number(req.params.id)}`);
    }
    res.json({ ok: true });
  });

  // === FEATURE FLAGS ===
  app.get("/api/settings/features", async (_req, res) => {
    const reseller = await storage.getSetting("feature_reseller", "true");
    const ranks = await storage.getSetting("feature_ranks", "true");
    const logs = await storage.getSetting("feature_logs", "true");
    const cards = await storage.getSetting("feature_cards", "true");
    res.json({ reseller: reseller !== "false", ranks: ranks !== "false", logs: logs !== "false", cards: cards !== "false" });
  });

  app.post("/api/admin/settings/features", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { reseller, ranks, logs, cards } = req.body;
    if (reseller !== undefined) await storage.setSetting("feature_reseller", reseller ? "true" : "false");
    if (ranks !== undefined) await storage.setSetting("feature_ranks", ranks ? "true" : "false");
    if (logs !== undefined) await storage.setSetting("feature_logs", logs ? "true" : "false");
    if (cards !== undefined) await storage.setSetting("feature_cards", cards ? "true" : "false");
    res.json({ ok: true });
  });

  return httpServer;
}
