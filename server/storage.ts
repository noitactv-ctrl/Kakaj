import { db } from "./db";
import { extractCardMetadata, formatCardDeliveryContent, normalizeCardNumber } from "./card-privacy";
import { appendUniqueDeliveryContent, serializeDeliveryParts, type DeliveryParts } from "./delivery-content";
import { 
  users, productCategories, products, variants, stockItems, orders, orderItems, transactions, redeemCodes, announcements, uploadedImages, cards, cardBases, supportTickets, cryptoPayments, mails, mailReads, siteSettings, discountCodes, sellerApplications, achs, cryptoAddresses, cryptoCurrencies,
  type User, type InsertUser, type ProductCategory, type Product, type InsertProduct, type Variant, type InsertVariant,
  type StockItem, type Order, type OrderItem, type Transaction, type RedeemCode, type Announcement, type InsertAnnouncement, type UploadedImage,
  type Card, type InsertCard, type CardBase, type SellerApplication, type Ach, type InsertAch, type CryptoAddress, type CryptoCurrency
} from "@shared/schema";
import { eq, and, sql, desc, asc, lt, ne } from "drizzle-orm";
import { pool } from "./db";
import { calculateDepositCredit } from "@shared/deposit";
import { assertSafeProductStockContent } from "./stock-safety";
import { decryptSettingValue, encryptSettingValue, isKnownSecretKey } from "./settings";
import { DEFAULT_CRYPTO_CURRENCIES } from "@shared/crypto-currencies";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, amountCents: number): Promise<User>;
  settlePlinkoGame(userId: number, betCents: number, payoutCents: number): Promise<User | undefined>;
  settlePlinkoGames(userId: number, games: { betCents: number; payoutCents: number }[]): Promise<User | undefined>;
  updateProtectedBalance(userId: number, amountCents: number): Promise<User>;
  setProtectedBalance(userId: number, value: number): Promise<User>;
  updateLastDailySpin(userId: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<User>): Promise<User>;

  // Products & Variants
  getProductCategories(): Promise<(ProductCategory & { productCount: number })[]>;
  createProductCategory(name: string): Promise<ProductCategory | undefined>;
  renameProductCategory(id: number, name: string): Promise<ProductCategory | undefined>;
  deleteProductCategory(id: number): Promise<boolean>;
  getProducts(): Promise<(Product & { variants: (Variant & { stockCount: number })[] })[]>;
  getAllProducts(): Promise<(Product & { variants: (Variant & { stockCount: number })[] })[]>;
  getProduct(id: number): Promise<(Product & { variants: (Variant & { stockCount: number })[] }) | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<Product>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  createVariant(variant: InsertVariant): Promise<Variant>;
  updateVariant(id: number, data: Partial<Variant>): Promise<Variant>;
  deleteVariant(id: number): Promise<void>;
  
  // Stock
  addStockItems(variantId: number, content: string): Promise<{ added: number; skipped: number }>;
  addSingleStockItem(variantId: number, content: string): Promise<StockItem>;
  getStockItems(variantId: number): Promise<StockItem[]>;
  deleteStockItem(id: number): Promise<void>;
  reserveStockItem(variantId: number): Promise<StockItem | undefined>;
  holdStockItem(variantId: number, orderId: number): Promise<StockItem | undefined>;
  releaseHeldStock(orderId: number): Promise<void>;
  
  // Orders
  createOrder(userId: number, items: { variantId: number; quantity: number }[], cardIds?: number[]): Promise<Order>;
  getOrders(userId: number): Promise<(Order & { items: (OrderItem & { stockItem: StockItem | null, variant: Variant | null })[] })[]>;
  getOrder(id: number): Promise<(Order & { items: (OrderItem & { stockItem: StockItem | null, variant: Variant | null })[] }) | undefined>;
  getAllOrders(): Promise<any[]>;
  refundOrder(orderId: number): Promise<Order>;
  
  // Wallet
  createTransaction(userId: number, amount: number, type: string, description: string): Promise<Transaction>;
  createTransactionWithMethod(userId: number, amount: number, type: string, description: string, paymentMethod: string): Promise<Transaction>;
  getTransactions(userId: number): Promise<Transaction[]>;
  getRedeemCode(code: string): Promise<RedeemCode | undefined>;
  markRedeemCodeUsed(id: number, userId: number): Promise<void>;
  createRedeemCode(code: string, amount: number): Promise<RedeemCode>;
  getAllRedeemCodes(): Promise<RedeemCode[]>;
  
  // Admin
  getDashboardStats(): Promise<{ totalUsers: number; totalSales: number; storeBalance: number; itemsInStock: number; itemsSold: number; totalOrders: number; pendingOrders: number; totalRevenue: number; stockWorth: number }>;
  getAdminLogs(): Promise<any[]>;
  updateOrderDelivery(orderId: number, deliveryContent: string): Promise<Order>;
  banUser(userId: number): Promise<User>;
  unbanUser(userId: number): Promise<User>;
  
  // Announcements
  getAnnouncements(): Promise<Announcement[]>;
  getAllAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  
  // Images
  uploadImage(filename: string, mimeType: string, data: string): Promise<UploadedImage>;
  getImage(id: number): Promise<UploadedImage | undefined>;

  // Support
  createSupportTicket(ticket: any): Promise<any>;
  createSupportTicketForOrder(ticket: any): Promise<any>;
  getSupportTickets(userId?: number): Promise<any[]>;
  getSupportTicket(id: number): Promise<any>;
  updateSupportTicket(id: number, data: any): Promise<any>;

  // Cards
  getCards(): Promise<Card[]>;
  getCard(id: number): Promise<Card | undefined>;
  createCard(card: InsertCard): Promise<Card>;
  updateCard(id: number, data: Partial<Card>): Promise<Card>;
  purchaseCard(cardId: number, userId: number): Promise<Card>;

  // ACH
  getAchs(): Promise<Ach[]>;
  getAch(id: number): Promise<Ach | undefined>;
  createAch(ach: InsertAch & { sellerId?: number }): Promise<Ach>;
  purchaseAch(achId: number): Promise<Ach>;
  deleteAch(id: number): Promise<void>;
  getSellerAchs(sellerId: number): Promise<Ach[]>;

  // Settings
  getSetting(key: string, defaultValue?: string): Promise<string>;
  setSetting(key: string, value: string): Promise<void>;
  getPaymentMethodsConfig(): Promise<Record<string, boolean>>;
  getCryptoCurrencies(enabledOnly?: boolean): Promise<CryptoCurrency[]>;
  getCryptoCurrencyByCode(code: string): Promise<CryptoCurrency | undefined>;
  createCryptoCurrency(currency: { code: string; name: string; ticker: string; color: string; enabled?: boolean; sortOrder?: number }): Promise<CryptoCurrency>;
  updateCryptoCurrency(id: number, currency: Partial<Pick<CryptoCurrency, "name" | "ticker" | "color" | "enabled" | "sortOrder">>): Promise<CryptoCurrency | undefined>;
  seedCryptoCurrencies(): Promise<void>;
  getUserCards(userId: number): Promise<Card[]>;
  deleteCard(id: number): Promise<void>;

  // Card Bases
  getCardBasesWithCount(): Promise<(CardBase & { count: number })[]>;
  createCardBase(name: string): Promise<CardBase>;
  deleteCardBase(id: number): Promise<void>;
  getCardsByBase(baseId: number): Promise<Card[]>;

  // Seller Applications
  createSellerApplication(userId: number, sellerCode: string): Promise<SellerApplication>;
  getSellerApplication(userId: number): Promise<SellerApplication | undefined>;
  getAllSellerApplications(): Promise<(SellerApplication & { username: string })[]>;
  approveSellerApplication(id: number): Promise<void>;
  rejectSellerApplication(id: number): Promise<void>;

  // CashApp (with optional paidAmount)
  fulfillCashappOrder(orderId: number, paidAmount?: number): Promise<Order>;
  approveManualDeposit(orderId: number, paidAmount?: number): Promise<Order>;
  markManualDepositUnpaid(orderId: number): Promise<Order>;

  // Crypto Addresses
  getCryptoAddresses(userId: number): Promise<CryptoAddress[]>;
  setCryptoAddress(userId: number, currency: string, address: string): Promise<CryptoAddress>;
}

export class DatabaseStorage implements IStorage {
  private assertCardBinIsSellable(card: Card): void {
    const binData = card.binData as Record<string, any> | null;
    const issuer = binData?.bank || binData?.Issuer || binData?.issuer;
    const type = binData?.type || binData?.Type || binData?.cardType;
    if (binData?.lookupStatus === "non" || !issuer || !type) {
      throw new Error("Card BIN is flagged NON because issuer and type could not be verified");
    }
  }

  private async assertCardNumberIsUnique(client: any, cardNumber: string): Promise<void> {
    const fingerprint = normalizeCardNumber(cardNumber);
    if (fingerprint.length < 6) throw new Error("Card number must contain a valid BIN");

    const result = await client.execute(sql`
      SELECT COUNT(*)::int AS count
      FROM cards
      WHERE regexp_replace(card_number, '\\D', '', 'g') = ${fingerprint}
    `);
    if (Number((result.rows[0] as any)?.count ?? 0) !== 1) {
      throw new Error("Duplicate card stock detected; refresh card stock before selling");
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserBalance(userId: number, amountCents: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ balance: sql`${users.balance} + ${amountCents}` })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async settlePlinkoGame(userId: number, betCents: number, payoutCents: number): Promise<User | undefined> {
    return this.settlePlinkoGames(userId, [{ betCents, payoutCents }]);
  }

  async settlePlinkoGames(userId: number, games: { betCents: number; payoutCents: number }[]): Promise<User | undefined> {
    if (games.length === 0) return undefined;

    try {
      return await db.transaction(async (tx) => {
        let settledUser: User | undefined;

        for (const game of games) {
          const [debitedUser] = await tx
            .update(users)
            .set({ balance: sql`${users.balance} - ${game.betCents}` })
            .where(and(eq(users.id, userId), sql`${users.balance} >= ${game.betCents}`))
            .returning();

          if (!debitedUser) throw new Error("INSUFFICIENT_PLINKO_BALANCE");

          await tx.insert(transactions).values({
            userId,
            amount: -game.betCents,
            type: "loss",
            description: "Plinko game bet",
          });

          settledUser = debitedUser;
          if (game.payoutCents <= 0) continue;

          const [winner] = await tx
            .update(users)
            .set({ balance: sql`${users.balance} + ${game.payoutCents}` })
            .where(eq(users.id, userId))
            .returning();

          await tx.insert(transactions).values({
            userId,
            amount: game.payoutCents,
            type: "win",
            description: "Plinko game payout",
          });

          settledUser = winner;
        }

        return settledUser;
      });
    } catch (error: any) {
      if (error?.message === "INSUFFICIENT_PLINKO_BALANCE") return undefined;
      throw error;
    }
  }

  async updateProtectedBalance(userId: number, amountCents: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ protectedBalance: sql`GREATEST(0, ${users.protectedBalance} + ${amountCents})` })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async setProtectedBalance(userId: number, value: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ protectedBalance: Math.max(0, value) })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateLastDailySpin(userId: number): Promise<void> {
    await db.update(users).set({ lastDailySpin: new Date() }).where(eq(users.id, userId));
  }


  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async banUser(userId: number): Promise<User> {
    const [user] = await db.update(users).set({ isBanned: true }).where(eq(users.id, userId)).returning();
    return user;
  }

  async unbanUser(userId: number): Promise<User> {
    const [user] = await db.update(users).set({ isBanned: false }).where(eq(users.id, userId)).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  private normalizeProductCategoryName(name: string): string {
    return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
  }

  private cleanProductCategoryName(name: string): string {
    return name.trim().replace(/\s+/g, " ");
  }

  private async ensureProductCategory(name: string, executor: any = db, lockForAssignment = false): Promise<string> {
    const cleanName = this.cleanProductCategoryName(name);
    if (!cleanName) return "";

    const normalizedName = this.normalizeProductCategoryName(cleanName);
    if (lockForAssignment) {
      await executor.execute(sql`select pg_advisory_xact_lock(hashtext(${normalizedName}))`);
    }

    const [existing] = await executor.select().from(productCategories).where(eq(productCategories.normalizedName, normalizedName));
    if (existing) return existing.name;

    const [created] = await executor
      .insert(productCategories)
      .values({ name: cleanName, normalizedName })
      .onConflictDoNothing({ target: productCategories.normalizedName })
      .returning();
    if (created) return created.name;

    const [concurrent] = await executor.select().from(productCategories).where(eq(productCategories.normalizedName, normalizedName));
    return concurrent?.name ?? cleanName;
  }

  private async syncProductCategoriesFromProducts(): Promise<void> {
    const rows = await db
      .selectDistinct({ name: products.category })
      .from(products)
      .where(sql`trim(coalesce(${products.category}, '')) <> ''`);

    for (const row of rows) {
      if (!row.name) continue;
      const canonicalName = await this.ensureProductCategory(row.name);
      if (canonicalName !== row.name) {
        await db.update(products).set({ category: canonicalName }).where(eq(products.category, row.name));
      }
    }
  }

  async getProductCategories(): Promise<(ProductCategory & { productCount: number })[]> {
    await this.syncProductCategoriesFromProducts();
    const categories = await db.select().from(productCategories).orderBy(asc(productCategories.name));
    const result = [];

    for (const category of categories) {
      const [usage] = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(sql`lower(regexp_replace(trim(coalesce(${products.category}, '')), '[[:space:]]+', ' ', 'g')) = ${category.normalizedName}`);
      result.push({ ...category, productCount: Number(usage.count) });
    }

    return result;
  }

  async createProductCategory(name: string): Promise<ProductCategory | undefined> {
    const cleanName = this.cleanProductCategoryName(name);
    const normalizedName = this.normalizeProductCategoryName(cleanName);
    return db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${normalizedName}))`);
      const [created] = await tx
        .insert(productCategories)
        .values({ name: cleanName, normalizedName })
        .onConflictDoNothing({ target: productCategories.normalizedName })
        .returning();
      return created;
    });
  }

  async renameProductCategory(id: number, name: string): Promise<ProductCategory | undefined> {
    const cleanName = this.cleanProductCategoryName(name);
    const normalizedName = this.normalizeProductCategoryName(cleanName);

    return db.transaction(async (tx) => {
      let [current] = await tx.select().from(productCategories).where(eq(productCategories.id, id));
      if (!current) return undefined;

      for (const lockName of Array.from(new Set([current.normalizedName, normalizedName])).sort()) {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${lockName}))`);
      }

      [current] = await tx.select().from(productCategories).where(eq(productCategories.id, id));
      if (!current) return undefined;
      const [duplicate] = await tx.select().from(productCategories).where(eq(productCategories.normalizedName, normalizedName));
      if (duplicate && duplicate.id !== id) throw new Error("CATEGORY_EXISTS");

      const [updated] = await tx
        .update(productCategories)
        .set({ name: cleanName, normalizedName, updatedAt: new Date() })
        .where(eq(productCategories.id, id))
        .returning();

      await tx
        .update(products)
        .set({ category: cleanName })
        .where(sql`lower(regexp_replace(trim(coalesce(${products.category}, '')), '[[:space:]]+', ' ', 'g')) = ${current.normalizedName}`);

      return updated;
    });
  }

  async deleteProductCategory(id: number): Promise<boolean> {
    return db.transaction(async (tx) => {
      let [category] = await tx.select().from(productCategories).where(eq(productCategories.id, id));
      if (!category) return false;

      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${category.normalizedName}))`);
      [category] = await tx.select().from(productCategories).where(eq(productCategories.id, id));
      if (!category) return false;
      const [usage] = await tx
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(sql`lower(regexp_replace(trim(coalesce(${products.category}, '')), '[[:space:]]+', ' ', 'g')) = ${category.normalizedName}`);
      if (Number(usage.count) > 0) throw new Error("CATEGORY_IN_USE");

      await tx.delete(productCategories).where(eq(productCategories.id, id));
      return true;
    });
  }

  async getProducts(): Promise<(Product & { variants: (Variant & { stockCount: number })[] })[]> {
    const allProducts = await db.select().from(products).where(eq(products.active, true));
    return this.enrichProductsWithVariants(allProducts);
  }

  async getAllProducts(): Promise<(Product & { variants: (Variant & { stockCount: number })[] })[]> {
    const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
    return this.enrichProductsWithVariants(allProducts);
  }

  private async enrichProductsWithVariants(allProducts: Product[]): Promise<(Product & { variants: (Variant & { stockCount: number })[] })[]> {
    const result = [];
    for (const prod of allProducts) {
      const prodVariants = await db.select().from(variants).where(eq(variants.productId, prod.id));
      const variantsWithStock = [];

      for (const v of prodVariants) {
        const [count] = await db
          .select({ count: sql<number>`count(*)` })
          .from(stockItems)
          .where(and(eq(stockItems.variantId, v.id), eq(stockItems.isSold, false), eq(stockItems.isReserved, false)));

        variantsWithStock.push({ ...v, stockCount: Number(count.count) });
      }
      result.push({ ...prod, variants: variantsWithStock });
    }
    return result;
  }

  async getProduct(id: number): Promise<(Product & { variants: (Variant & { stockCount: number })[] }) | undefined> {
    const [prod] = await db.select().from(products).where(eq(products.id, id));
    if (!prod) return undefined;

    const prodVariants = await db.select().from(variants).where(eq(variants.productId, prod.id));
    const variantsWithStock = [];
      
    for (const v of prodVariants) {
      const [count] = await db
        .select({ count: sql<number>`count(*)` })
        .from(stockItems)
        .where(and(eq(stockItems.variantId, v.id), eq(stockItems.isSold, false), eq(stockItems.isReserved, false)));
      
      variantsWithStock.push({ ...v, stockCount: Number(count.count) });
    }
    
    return { ...prod, variants: variantsWithStock };
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    return db.transaction(async (tx) => {
      const category = insertProduct.category ? await this.ensureProductCategory(insertProduct.category, tx, true) : "";
      const [prod] = await tx.insert(products).values({ ...insertProduct, category }).returning();
      return prod;
    });
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    return db.transaction(async (tx) => {
      const nextData = { ...data };
      if ("category" in nextData) {
        nextData.category = nextData.category ? await this.ensureProductCategory(nextData.category, tx, true) : "";
      }
      const [prod] = await tx.update(products).set(nextData).where(eq(products.id, id)).returning();
      return prod;
    });
  }

  async createVariant(insertVariant: InsertVariant): Promise<Variant> {
    const [variant] = await db.insert(variants).values(insertVariant).returning();
    return variant;
  }

  async updateVariant(id: number, data: Partial<Variant>): Promise<Variant> {
    const [variant] = await db.update(variants).set(data).where(eq(variants.id, id)).returning();
    return variant;
  }

  async deleteVariant(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      const [usage] = await tx.select({ count: sql<number>`count(*)` }).from(orderItems).where(eq(orderItems.variantId, id));
      if (Number(usage.count) > 0) throw new Error("VARIANT_IN_USE");
      await tx.delete(stockItems).where(eq(stockItems.variantId, id));
      await tx.delete(variants).where(eq(variants.id, id));
    });
  }

  async deleteProduct(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      const prodVariants = await tx.select().from(variants).where(eq(variants.productId, id));
      for (const variant of prodVariants) {
        const [usage] = await tx.select({ count: sql<number>`count(*)` }).from(orderItems).where(eq(orderItems.variantId, variant.id));
        if (Number(usage.count) > 0) throw new Error("PRODUCT_IN_USE");
      }
      for (const variant of prodVariants) {
        await tx.delete(stockItems).where(eq(stockItems.variantId, variant.id));
      }
      await tx.delete(variants).where(eq(variants.productId, id));
      await tx.delete(products).where(eq(products.id, id));
    });
  }

  async addStockItems(variantId: number, content: string, sellerId?: number): Promise<{ added: number; skipped: number }> {
    const rejectPaymentCardCredentials = (await this.getSetting("allow_payment_card_product_stock", "false")) !== "true";
    content = assertSafeProductStockContent(content, { rejectPaymentCardCredentials });
    const items = splitStockContent(content);
    if (items.length === 0) return { added: 0, skipped: 0 };

    let added = 0;
    let skipped = 0;
    for (const itemContent of items) {
      const existing = await db.select({ id: stockItems.id }).from(stockItems)
        .where(and(eq(stockItems.variantId, variantId), eq(stockItems.content, itemContent))).limit(1);
      if (existing.length > 0) { skipped++; continue; }
      await db.insert(stockItems).values({ variantId, content: itemContent, isSold: false, sellerId: sellerId ?? null });
      added++;
    }
    return { added, skipped };
  }

  async addSingleStockItem(variantId: number, content: string): Promise<StockItem> {
    const rejectPaymentCardCredentials = (await this.getSetting("allow_payment_card_product_stock", "false")) !== "true";
    content = assertSafeProductStockContent(content, { rejectPaymentCardCredentials });
    const existing = await db.select({ id: stockItems.id }).from(stockItems)
      .where(eq(stockItems.content, content)).limit(1);
    if (existing.length > 0) throw new Error("Duplicate: this item already exists in the database");
    const [item] = await db.insert(stockItems).values({
      variantId,
      content,
      isSold: false
    }).returning();
    return item;
  }

  async getStockItems(variantId: number): Promise<StockItem[]> {
    return db.select().from(stockItems)
      .where(and(eq(stockItems.variantId, variantId), eq(stockItems.isSold, false), eq(stockItems.isReserved, false)))
      .orderBy(desc(stockItems.createdAt));
  }

  async deleteStockItem(id: number): Promise<void> {
    await db.delete(stockItems).where(eq(stockItems.id, id));
  }

  // Reserve stock for immediate (wallet) purchase — marks as sold right away.
  // Uses a single atomic UPDATE with subquery to avoid race conditions.
  async reserveStockItem(variantId: number, sellerId?: number): Promise<StockItem | undefined> {
    let result;
    if (sellerId === -1) {
      // Admin-only stock (seller_id IS NULL)
      result = await db.execute(sql`
        UPDATE stock_items
        SET is_sold = true
        WHERE id = (
          SELECT id FROM stock_items
          WHERE variant_id = ${variantId}
            AND is_sold = false
            AND is_reserved = false
            AND seller_id IS NULL
          ORDER BY id
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *
      `);
    } else if (sellerId) {
      result = await db.execute(sql`
        UPDATE stock_items
        SET is_sold = true
        WHERE id = (
          SELECT id FROM stock_items
          WHERE variant_id = ${variantId}
            AND is_sold = false
            AND is_reserved = false
            AND seller_id = ${sellerId}
          ORDER BY id
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *
      `);
    } else {
      result = await db.execute(sql`
        UPDATE stock_items
        SET is_sold = true
        WHERE id = (
          SELECT id FROM stock_items
          WHERE variant_id = ${variantId}
            AND is_sold = false
            AND is_reserved = false
          ORDER BY id
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *
      `);
    }
    return result.rows[0] as StockItem | undefined;
  }

  // Hold stock for a pending order (CashApp/Crypto) — marks as reserved but not sold yet.
  // Uses a single atomic UPDATE with subquery to avoid race conditions.
  async holdStockItem(variantId: number, orderId: number): Promise<StockItem | undefined> {
    const result = await db.execute(sql`
      UPDATE stock_items
      SET is_reserved = true, order_id = ${orderId}
      WHERE id = (
        SELECT id FROM stock_items
        WHERE variant_id = ${variantId}
          AND is_sold = false
          AND is_reserved = false
        ORDER BY id
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *
    `);
    return result.rows[0] as StockItem | undefined;
  }

  // Release held stock back to available (e.g. when order marked unpaid or cancelled)
  async releaseHeldStock(orderId: number): Promise<void> {
    await db
      .update(stockItems)
      .set({ isReserved: false, orderId: null })
      .where(and(eq(stockItems.orderId, orderId), eq(stockItems.isReserved, true), eq(stockItems.isSold, false)));
  }

  async createOrder(userId: number, items: { variantId: number; quantity: number; sellerId?: number }[], cardIds: number[] = [], discountCodeId?: number | null, bulkCardIds: number[] = []): Promise<Order> {
    // ── Step 1: Calculate totals and validate BEFORE touching any stock ──
    if (!Array.isArray(items) || !Array.isArray(cardIds) || !Array.isArray(bulkCardIds)) {
      throw new Error("Invalid order items");
    }
    if (items.length === 0 && cardIds.length === 0) throw new Error("Order cannot be empty");
    for (const item of items) {
      if (!Number.isSafeInteger(item.variantId) || item.variantId <= 0 ||
          !Number.isSafeInteger(item.quantity) || item.quantity <= 0 || item.quantity > 100) {
        throw new Error("Item quantities must be whole numbers between 1 and 100");
      }
    }
    if (cardIds.some((id) => !Number.isSafeInteger(id) || id <= 0) ||
        bulkCardIds.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
      throw new Error("Invalid card selection");
    }
    let rawTotal = 0;
    const uniqueCardIds = new Set(cardIds);
    const bulkCardSet = new Set(bulkCardIds);
    const isBulkBundle = bulkCardIds.length > 0;
    if (uniqueCardIds.size !== cardIds.length) throw new Error("A card can only be selected once");
    if (isBulkBundle) {
      if (bulkCardSet.size !== 20 || cardIds.length !== 20 || cardIds.some(id => !bulkCardSet.has(id))) {
        throw new Error("Bulk bundles must contain exactly 20 unique cards");
      }
      if (items.length > 0 || discountCodeId) throw new Error("Bulk bundles cannot be combined with other items or coupons");
    }
    const variantMap: Record<number, typeof variants.$inferSelect> = {};

    for (const item of items) {
      const [variant] = await db.select().from(variants).where(eq(variants.id, item.variantId));
      if (!variant) throw new Error("Variant not found");
      variantMap[item.variantId] = variant;
      rawTotal += variant.price * item.quantity;
    }

    const cardMap: Record<number, typeof cards.$inferSelect> = {};
    const cardPurchases: { cardId: number; price: number }[] = [];
    for (const cardId of cardIds) {
      const [card] = await db.select().from(cards).where(eq(cards.id, cardId));
      if (!card) throw new Error("Card not found");
      if (card.isSold) throw new Error("Card already sold");
      this.assertCardBinIsSellable(card);
      await this.assertCardNumberIsUnique(db, card.cardNumber);
      cardMap[cardId] = card;
      const purchasePrice = isBulkBundle ? Math.round(card.price / 2) : card.price;
      rawTotal += purchasePrice;
      cardPurchases.push({ cardId, price: purchasePrice });
    }

    // Apply discount code
    let total = rawTotal;
    let discountApplied = false;
    let activeDiscount: typeof discountCodes.$inferSelect | null = null;
    if (discountCodeId && !isBulkBundle) {
      const [dc] = await db.select().from(discountCodes).where(eq(discountCodes.id, discountCodeId));
      if (!dc || !dc.isActive) throw new Error("Discount code is no longer active");
      if (dc.expiresAt && new Date(dc.expiresAt) < new Date()) throw new Error("Discount code has expired");
      if (dc.maxUses !== null && dc.usedCount >= dc.maxUses) throw new Error("Discount code has reached its usage limit");
      if (dc.minOrder && rawTotal < dc.minOrder) throw new Error(`Minimum order of $${(dc.minOrder / 100).toFixed(2)} required`);
      const discountAmount = dc.type === "percent"
        ? Math.round(rawTotal * dc.value / 100)
        : Math.min(dc.value, rawTotal);
      total = Math.max(0, rawTotal - discountAmount);
      activeDiscount = dc;
      discountApplied = true;
    }

    // Apply rank discount automatically
    const rankResult = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), sql`amount > 0`, sql`type IN ('deposit', 'manual_deposit')`));
    const totalDeposited = Number(rankResult[0]?.total ?? 0);
    const rankDiscountPct = totalDeposited >= 100000 ? 10 : totalDeposited >= 50000 ? 5 : totalDeposited >= 10000 ? 2 : 0;
    if (rankDiscountPct > 0 && !isBulkBundle) {
      total = Math.max(0, Math.round(total * (1 - rankDiscountPct / 100)));
    }

    if (rawTotal < 100) throw new Error("Order total must be at least $1.00");

    // Check balance BEFORE consuming any stock
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || user.balance < total) throw new Error("Insufficient balance");

    // ── Step 2: Reserve stock atomically ──
    const reservedStockItems: { variantId: number, stockItemId: number, price: number, content: string }[] = [];
    const claimedCards: (typeof cards.$inferSelect)[] = [];
    let discountClaimed = false;

    try {
      for (const item of items) {
        const variant = variantMap[item.variantId];
        for (let i = 0; i < item.quantity; i++) {
          const stockItem = await this.reserveStockItem(item.variantId, (item as any).sellerId || undefined);
          if (!stockItem) {
            throw new Error(`Out of stock: ${variant.name}`);
          }
          reservedStockItems.push({
            variantId: item.variantId,
            stockItemId: stockItem.id,
            price: variant.price,
            content: (stockItem as any).content ?? "",
          });
        }
      }
      if (activeDiscount) {
        const claimed = await db.update(discountCodes)
          .set({ usedCount: sql`${discountCodes.usedCount} + 1` })
          .where(sql`${discountCodes.id} = ${activeDiscount.id} AND ${discountCodes.isActive} = true AND (${discountCodes.maxUses} IS NULL OR ${discountCodes.usedCount} < ${discountCodes.maxUses}) AND (${discountCodes.expiresAt} IS NULL OR ${discountCodes.expiresAt} >= NOW())`)
          .returning({ id: discountCodes.id });
        if (claimed.length === 0) throw new Error("Discount code is no longer available");
        discountClaimed = true;
      }
      for (const cardPurchase of cardPurchases) {
        const originalCard = cardMap[cardPurchase.cardId];
        const [claimedCard] = await db.update(cards)
          .set({ isSold: true, userId })
          .where(and(eq(cards.id, cardPurchase.cardId), eq(cards.isSold, false)))
          .returning();
        if (!claimedCard || !originalCard) throw new Error("A card in this order is no longer available");
        claimedCards.push(originalCard);
      }
    } catch (err) {
      // Release any stock we already reserved before re-throwing
      for (const res of reservedStockItems) {
        await db.update(stockItems)
          .set({ isSold: false })
          .where(eq(stockItems.id, res.stockItemId));
      }
      if (discountClaimed && activeDiscount) {
        await db.update(discountCodes)
          .set({ usedCount: sql`GREATEST(${discountCodes.usedCount} - 1, 0)` })
          .where(eq(discountCodes.id, activeDiscount.id));
      }
      for (const card of claimedCards) {
        await db.update(cards)
          .set({ isSold: false, userId: card.userId })
          .where(and(eq(cards.id, card.id), eq(cards.isSold, true), eq(cards.userId, userId)));
      }
      throw err;
    }

    // ── Step 3: Deduct balance and create the order ──
    await this.updateUserBalance(userId, -total);
    await this.createTransaction(userId, -total, "purchase", `Order purchase`);

    const productRawTotal = reservedStockItems.reduce((sum, item) => sum + item.price, 0);
    const orderParts = [
      ...(reservedStockItems.length > 0 ? [{ key: "products", rawTotal: productRawTotal }] : []),
      ...cardPurchases.map(card => ({ key: `card:${card.cardId}`, rawTotal: card.price })),
    ];
    const allocatedTotals = new Map<string, number>();
    let allocated = 0;
    const proportionalParts = orderParts.map(part => {
      const exact = rawTotal > 0 ? total * part.rawTotal / rawTotal : 0;
      const cents = Math.floor(exact);
      allocated += cents;
      return { ...part, cents, fraction: exact - cents };
    });
    let remainder = total - allocated;
    proportionalParts
      .sort((a, b) => b.fraction - a.fraction)
      .forEach(part => {
        const extra = remainder > 0 ? 1 : 0;
        allocatedTotals.set(part.key, part.cents + extra);
        remainder -= extra;
      });

    const createdOrders: Order[] = [];
    const makeOrderId = (prefix = "") =>
      `${prefix}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    if (reservedStockItems.length > 0) {
      const deliveryParts: DeliveryParts = {};
      for (const res of reservedStockItems) {
        appendUniqueDeliveryContent(deliveryParts, String(res.variantId), res.content);
      }
      const productTotal = allocatedTotals.get("products") ?? productRawTotal;
      const [productOrder] = await db.insert(orders).values({
        userId,
        orderId: makeOrderId(),
        total: productTotal,
        paidAmount: productTotal,
        status: "delivering",
        deliveryContent: serializeDeliveryParts(deliveryParts),
      }).returning();
      createdOrders.push(productOrder);

      for (const res of reservedStockItems) {
        await db.insert(orderItems).values({
          orderId: productOrder.id,
          variantId: res.variantId,
          stockItemId: res.stockItemId,
          cardId: null,
          itemType: "product",
          price: res.price,
          quantity: 1
        });
        await db.update(stockItems).set({ orderId: productOrder.id }).where(eq(stockItems.id, res.stockItemId));
      }
    }

    for (const cp of cardPurchases) {
      const card = cardMap[cp.cardId];
      const cardTotal = allocatedTotals.get(`card:${cp.cardId}`) ?? cp.price;
      const cardDelivery: DeliveryParts = {};
      appendUniqueDeliveryContent(cardDelivery, "cards", formatCardDeliveryContent(card));
      const [cardOrder] = await db.insert(orders).values({
        userId,
        orderId: makeOrderId("CARD-"),
        total: cardTotal,
        paidAmount: cardTotal,
        status: "delivering",
        deliveryContent: serializeDeliveryParts(cardDelivery),
        paymentMethod: "wallet",
      }).returning();
      createdOrders.push(cardOrder);

      await db.insert(orderItems).values({
        orderId: cardOrder.id,
        variantId: null,
        cardId: cp.cardId,
        itemType: "card",
        price: cardTotal,
        quantity: 1
      });
    }

    const primaryOrder = createdOrders[0];
    if (!primaryOrder) throw new Error("Order could not be created");
    return primaryOrder;
  }

  async createPendingOrder(userId: number, items: { variantId: number; quantity: number }[], cardIds: number[] = [], discountCodeId?: number | null, bulkCardIds: number[] = []): Promise<Order> {
    if (!Array.isArray(items) || !Array.isArray(cardIds) || !Array.isArray(bulkCardIds)) {
      throw new Error("Invalid order items");
    }
    if (items.length === 0 && cardIds.length === 0) throw new Error("Order cannot be empty");
    for (const item of items) {
      if (!Number.isSafeInteger(item.variantId) || item.variantId <= 0 ||
          !Number.isSafeInteger(item.quantity) || item.quantity <= 0 || item.quantity > 100) {
        throw new Error("Item quantities must be whole numbers between 1 and 100");
      }
    }
    if (cardIds.some((id) => !Number.isSafeInteger(id) || id <= 0) ||
        bulkCardIds.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
      throw new Error("Invalid card selection");
    }
    let total = 0;
    const heldItems: { variantId: number; stockItemId: number; price: number; quantity: number }[] = [];
    const cardPurchases: { cardId: number; price: number }[] = [];
    const uniqueCardIds = new Set(cardIds);
    const bulkCardSet = new Set(bulkCardIds);
    const isBulkBundle = bulkCardIds.length > 0;
    if (uniqueCardIds.size !== cardIds.length) throw new Error("A card can only be selected once");
    if (isBulkBundle) {
      if (bulkCardSet.size !== 20 || cardIds.length !== 20 || cardIds.some(id => !bulkCardSet.has(id))) {
        throw new Error("Bulk bundles must contain exactly 20 unique cards");
      }
      if (items.length > 0 || discountCodeId) throw new Error("Bulk bundles cannot be combined with other items or coupons");
    }

    // Calculate total and check stock availability first
    for (const item of items) {
      const [variant] = await db.select().from(variants).where(eq(variants.id, item.variantId));
      if (!variant) throw new Error("Variant not found");
      total += variant.price * item.quantity;

      // Check there is enough stock before creating the order
      const [avail] = await db.select({ count: sql<number>`count(*)` }).from(stockItems)
        .where(and(eq(stockItems.variantId, item.variantId), eq(stockItems.isSold, false), eq(stockItems.isReserved, false)));
      if (Number(avail.count) < item.quantity) {
        throw new Error(`Insufficient stock for ${variant.name}`);
      }
    }

    for (const cardId of cardIds) {
      const [card] = await db.select().from(cards).where(eq(cards.id, cardId));
      if (!card || card.isSold) throw new Error("Card not found or already sold");
      this.assertCardBinIsSellable(card);
      await this.assertCardNumberIsUnique(db, card.cardNumber);
      const purchasePrice = isBulkBundle ? Math.round(card.price / 2) : card.price;
      total += purchasePrice;
      cardPurchases.push({ cardId, price: purchasePrice });
    }

    const rawTotal = total;
    let activeDiscount: typeof discountCodes.$inferSelect | null = null;
    if (discountCodeId && !isBulkBundle) {
      const [dc] = await db.select().from(discountCodes).where(eq(discountCodes.id, discountCodeId));
      if (!dc || !dc.isActive) throw new Error("Discount code is no longer active");
      if (dc.expiresAt && new Date(dc.expiresAt) < new Date()) throw new Error("Discount code has expired");
      if (dc.maxUses !== null && dc.usedCount >= dc.maxUses) throw new Error("Discount code has reached its usage limit");
      if (dc.minOrder && rawTotal < dc.minOrder) throw new Error(`Minimum order of $${(dc.minOrder / 100).toFixed(2)} required`);
      const discountAmount = dc.type === "percent"
        ? Math.round(rawTotal * dc.value / 100)
        : Math.min(dc.value, rawTotal);
      total = Math.max(0, rawTotal - discountAmount);
      activeDiscount = dc;
    }

    // Apply rank discount automatically
    const rankResult = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), sql`amount > 0`, sql`type IN ('deposit', 'manual_deposit')`));
    const totalDeposited = Number(rankResult[0]?.total ?? 0);
    const rankDiscountPct = totalDeposited >= 100000 ? 10 : totalDeposited >= 50000 ? 5 : totalDeposited >= 10000 ? 2 : 0;
    if (rankDiscountPct > 0 && !isBulkBundle) {
      total = Math.max(0, Math.round(total * (1 - rankDiscountPct / 100)));
    }
    if (rawTotal < 100 || total < 1) throw new Error("Order total must be at least $1.00");

    const publicOrderId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const [order] = await db.insert(orders).values({
      userId,
      orderId: publicOrderId,
      total,
      status: "pending"
    }).returning();

    // Hold one stock item per unit ordered — release everything and cancel the order if any hold fails
    const variantCache: Record<number, typeof variants.$inferSelect> = {};
    let discountClaimed = false;
    try {
      if (activeDiscount) {
        const claimed = await db.update(discountCodes)
          .set({ usedCount: sql`${discountCodes.usedCount} + 1` })
          .where(sql`${discountCodes.id} = ${activeDiscount.id} AND ${discountCodes.isActive} = true AND (${discountCodes.maxUses} IS NULL OR ${discountCodes.usedCount} < ${discountCodes.maxUses}) AND (${discountCodes.expiresAt} IS NULL OR ${discountCodes.expiresAt} >= NOW())`)
          .returning({ id: discountCodes.id });
        if (claimed.length === 0) throw new Error("Discount code is no longer available");
        discountClaimed = true;
      }
      for (const item of items) {
        const [variant] = await db.select().from(variants).where(eq(variants.id, item.variantId));
        if (!variant) throw new Error("Variant not found");
        variantCache[item.variantId] = variant;

        for (let i = 0; i < item.quantity; i++) {
          const held = await this.holdStockItem(item.variantId, order.id);
          if (!held) throw new Error(`Out of stock: ${variant.name}`);
          heldItems.push({ variantId: item.variantId, stockItemId: held.id, price: variant.price, quantity: 1 });
        }
      }
    } catch (err) {
      // Release any stock we already held and delete the skeleton order
      await this.releaseHeldStock(order.id);
      await db.delete(orders).where(eq(orders.id, order.id));
      if (discountClaimed && activeDiscount) {
        await db.update(discountCodes)
          .set({ usedCount: sql`GREATEST(${discountCodes.usedCount} - 1, 0)` })
          .where(eq(discountCodes.id, activeDiscount.id));
      }
      throw err;
    }

    // Create one order item per held stock item (each unit gets its own row)
    for (const h of heldItems) {
      await db.insert(orderItems).values({
        orderId: order.id,
        variantId: h.variantId,
        stockItemId: h.stockItemId,
        cardId: null,
        itemType: "product",
        price: h.price,
        quantity: 1,
      });
    }

    for (const cardPurchase of cardPurchases) {
      await db.insert(orderItems).values({
        orderId: order.id,
        variantId: null,
        stockItemId: null,
        cardId: cardPurchase.cardId,
        itemType: "card",
        price: cardPurchase.price,
        quantity: 1,
      });
    }

    return order;
  }

  async fulfillPendingOrder(orderId: number): Promise<Order> {
    return db.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId));
      if (!order) throw new Error("Order not found");
      if (order.status !== "pending") throw new Error("Order is not in a payable state");

      const items = await tx.select().from(orderItems)
        .where(eq(orderItems.orderId, orderId))
        .orderBy(asc(orderItems.id));
      const deliveryParts: DeliveryParts = {};

      for (const item of items) {
        if (item.cardId) {
          const [card] = await tx.select().from(cards).where(eq(cards.id, item.cardId));
          if (!card || card.isSold) throw new Error("A card in this order is no longer available");
          this.assertCardBinIsSellable(card);
          await this.assertCardNumberIsUnique(tx, card.cardNumber);
          const [claimedCard] = await tx.update(cards)
            .set({ isSold: true, userId: order.userId })
            .where(and(eq(cards.id, item.cardId), eq(cards.isSold, false)))
            .returning();
          if (!claimedCard) throw new Error("A card in this order is no longer available");
          appendUniqueDeliveryContent(deliveryParts, "cards", formatCardDeliveryContent(card));
          continue;
        }
        if (!item.variantId) continue;
        const key = String(item.variantId);
        if (!item.stockItemId) {
          throw new Error(`Order item ${item.id} has no assigned stock and cannot be substituted`);
        }

        const [stock] = await tx.select().from(stockItems).where(eq(stockItems.id, item.stockItemId));
        if (!stock || stock.isSold || stock.orderId !== order.id) {
          throw new Error(`Assigned stock item is unavailable for order item ${item.id}`);
        }
        const [deliveredStock] = await tx.update(stockItems)
          .set({ isSold: true, isReserved: false })
          .where(and(eq(stockItems.id, stock.id), eq(stockItems.isSold, false), eq(stockItems.orderId, order.id)))
          .returning();
        if (!deliveredStock) throw new Error(`Assigned stock item is unavailable for order item ${item.id}`);
        appendUniqueDeliveryContent(deliveryParts, key, stock.content);
      }

      const deliveryContent = serializeDeliveryParts(deliveryParts);
      const [updated] = await tx.update(orders)
        .set({ status: "delivering", deliveryContent, paidAmount: order.total })
        .where(and(eq(orders.id, orderId), eq(orders.status, "pending")))
        .returning();
      if (!updated) throw new Error("Order is not in a payable state");
      return updated;
    });
  }

  async approveManualDeposit(orderId: number, paidAmount?: number): Promise<Order> {
    return db.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId));
      if (!order) throw new Error("Order not found");
      if (order.status !== "pending") throw new Error("Deposit is not in a payable state");

      const manualMethods = ["CashApp", "Chime", "Venmo", "Zelle"];
      if (!manualMethods.includes(order.paymentMethod || "")) {
        throw new Error("Order is not a manual deposit");
      }

      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      if (items.length > 0) throw new Error("Order contains items and cannot be approved as a deposit");

      const grossAmount = paidAmount ?? order.total;
      if (!Number.isSafeInteger(grossAmount) || grossAmount <= 0) {
        throw new Error("A valid paid amount is required");
      }

      const feeKey = order.paymentMethod === "CashApp" ? "cashapp_fee"
        : order.paymentMethod === "Chime" ? "chime_fee"
        : order.paymentMethod === "Zelle" ? "zelle_fee"
        : null;
      let feePct = 0;
      if (feeKey) {
        const [feeSetting] = await tx.select({ value: siteSettings.value })
          .from(siteSettings)
          .where(eq(siteSettings.key, feeKey));
        feePct = parseFloat(feeSetting?.value || "0") || 0;
      }

      const credit = calculateDepositCredit(grossAmount, feePct);
      const [approved] = await tx.update(orders)
        .set({ status: "fulfilled", paidAmount: grossAmount, total: grossAmount })
        .where(and(eq(orders.id, orderId), eq(orders.status, "pending")))
        .returning();
      if (!approved) throw new Error("Deposit was already handled");

      await tx.update(users)
        .set({
          balance: sql`balance + ${credit.creditCents}`,
          protectedBalance: sql`protected_balance + ${credit.creditCents}`,
        })
        .where(eq(users.id, order.userId));

      const feeNote = credit.feeCents > 0
        ? ` (${feePct}% fee: -$${(credit.feeCents / 100).toFixed(2)})`
        : "";
      await tx.insert(transactions).values({
        userId: order.userId,
        amount: grossAmount - credit.feeCents,
        type: "deposit",
        description: `${order.paymentMethod} deposit confirmed (${order.orderId})${feeNote}`,
        paymentMethod: order.paymentMethod,
      });
      if (credit.bonusCents > 0) {
        await tx.insert(transactions).values({
          userId: order.userId,
          amount: credit.bonusCents,
          type: "deposit_bonus",
          description: `Deposit bonus (+${credit.bonusPercent}%)`,
          paymentMethod: order.paymentMethod,
        });
      }

      return approved;
    });
  }

  async fulfillCashappOrder(orderId: number, paidAmount?: number): Promise<Order> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) throw new Error("Order not found");
    if (order.status !== "pending") {
      throw new Error("Order is not in a payable state");
    }

    const items = await db.select().from(orderItems)
      .where(eq(orderItems.orderId, orderId))
      .orderBy(asc(orderItems.id));
    if (items.length === 0) {
      return this.approveManualDeposit(orderId, paidAmount);
    }
    return db.transaction(async (tx) => {
      const [pendingOrder] = await tx.select().from(orders).where(eq(orders.id, orderId));
      if (!pendingOrder || pendingOrder.status !== "pending") throw new Error("Order is not in a payable state");
      const confirmedPaidAmount = paidAmount ?? pendingOrder.total;
      if (!Number.isSafeInteger(confirmedPaidAmount) || confirmedPaidAmount < pendingOrder.total) {
        throw new Error("Paid amount cannot be less than the order total");
      }

      const pendingItems = await tx.select().from(orderItems)
        .where(eq(orderItems.orderId, orderId))
        .orderBy(asc(orderItems.id));
      const deliveryParts: DeliveryParts = {};

      for (const item of pendingItems) {
        if (item.cardId) {
          const [card] = await tx.select().from(cards).where(eq(cards.id, item.cardId));
          if (!card || card.isSold) throw new Error("A card in this order is no longer available");
          this.assertCardBinIsSellable(card);
          await this.assertCardNumberIsUnique(tx, card.cardNumber);
          const [claimedCard] = await tx.update(cards)
            .set({ isSold: true, userId: pendingOrder.userId })
            .where(and(eq(cards.id, item.cardId), eq(cards.isSold, false)))
            .returning();
          if (!claimedCard) throw new Error("A card in this order is no longer available");
          appendUniqueDeliveryContent(deliveryParts, "cards", formatCardDeliveryContent(card));
          continue;
        }
        if (!item.variantId) continue;
        const key = String(item.variantId);
        if (!item.stockItemId) {
          throw new Error(`Order item ${item.id} has no assigned stock and cannot be substituted`);
        }

        const [stock] = await tx.select().from(stockItems).where(eq(stockItems.id, item.stockItemId));
        if (!stock || stock.isSold || stock.orderId !== pendingOrder.id) {
          throw new Error(`Assigned stock item is unavailable for order item ${item.id}`);
        }
        const [deliveredStock] = await tx.update(stockItems)
          .set({ isSold: true, isReserved: false })
          .where(and(eq(stockItems.id, stock.id), eq(stockItems.isSold, false), eq(stockItems.orderId, pendingOrder.id)))
          .returning();
        if (!deliveredStock) throw new Error(`Assigned stock item is unavailable for order item ${item.id}`);
        appendUniqueDeliveryContent(deliveryParts, key, stock.content);
      }

      const deliveryContent = serializeDeliveryParts(deliveryParts);
      const [updated] = await tx.update(orders)
        .set({ status: "delivering", deliveryContent, paidAmount: confirmedPaidAmount })
        .where(and(eq(orders.id, orderId), eq(orders.status, "pending")))
        .returning();
      if (!updated) throw new Error("Order is not in a payable state");
      return updated;
    });
  }

  async markManualDepositUnpaid(orderId: number): Promise<Order> {
    return db.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId));
      if (!order) throw new Error("Order not found");
      if (order.status !== "pending") throw new Error("Deposit is not pending");
      if (!["CashApp", "Chime", "Venmo", "Zelle"].includes(order.paymentMethod || "")) {
        throw new Error("Order is not a manual deposit");
      }

      const items = await tx.select({ id: orderItems.id })
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId))
        .limit(1);
      if (items.length > 0) throw new Error("Order contains items and cannot be marked as an unpaid deposit");

      const [updated] = await tx.update(orders)
        .set({ status: "waiting_payment" })
        .where(and(eq(orders.id, orderId), eq(orders.status, "pending")))
        .returning();
      if (!updated) throw new Error("Deposit was already handled");
      return updated;
    });
  }

  async getCryptoAddresses(userId: number): Promise<CryptoAddress[]> {
    return db.select().from(cryptoAddresses).where(eq(cryptoAddresses.userId, userId));
  }

  async setCryptoAddress(userId: number, currency: string, address: string): Promise<CryptoAddress> {
    const existing = await db.select().from(cryptoAddresses)
      .where(and(eq(cryptoAddresses.userId, userId), eq(cryptoAddresses.currency, currency)));
    if (existing.length > 0) {
      const [updated] = await db.update(cryptoAddresses)
        .set({ address })
        .where(and(eq(cryptoAddresses.userId, userId), eq(cryptoAddresses.currency, currency)))
        .returning();
      return updated;
    }
    const [created] = await db.insert(cryptoAddresses).values({ userId, currency, address }).returning();
    return created;
  }

  async markOrderUnpaid(orderId: number): Promise<Order> {
    return db.transaction(async (tx) => {
      const [updated] = await tx.update(orders)
        .set({ status: "waiting_payment" })
        .where(and(eq(orders.id, orderId), eq(orders.status, "pending")))
        .returning();
      if (!updated) {
        const [existing] = await tx.select({ id: orders.id }).from(orders).where(eq(orders.id, orderId));
        if (!existing) throw new Error("Order not found");
        throw new Error("Order is not pending");
      }

      await tx.update(stockItems)
        .set({ isReserved: false, orderId: null })
        .where(and(eq(stockItems.orderId, orderId), eq(stockItems.isReserved, true), eq(stockItems.isSold, false)));
      return updated;
    });
  }

  async cancelPendingOrder(orderId: number): Promise<void> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order || order.status !== "pending") return;
    // Release held stock before cancelling
    await this.releaseHeldStock(orderId);
    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    await db.update(orders).set({ status: "waiting_payment" as any }).where(eq(orders.id, orderId));
  }

  async cancelStalePendingOrders(maxAgeMs: number = 60 * 60 * 1000): Promise<number> {
    const cutoff = new Date(Date.now() - maxAgeMs);
    const staleOrders = await db.select().from(orders)
      .where(and(eq(orders.status, "pending"), lt(orders.createdAt, cutoff)));
    let cancelled = 0;
    for (const order of staleOrders) {
      // Payment providers issue their own signed terminal status. Releasing
      // Plisio-held stock based only on a local timer can reject a confirmed
      // blockchain payment whose callback arrives late.
      if (order.paymentMethod === "CashApp" || order.paymentMethod === "Plisio") continue;
      await this.cancelPendingOrder(order.id);
      cancelled++;
    }
    return cancelled;
  }

  async expireStaleCryptoPayments(maxAgeMs: number = 2 * 60 * 60 * 1000): Promise<number> {
    const cutoff = new Date(Date.now() - maxAgeMs);
    const stale = await db.select().from(cryptoPayments)
      .where(and(eq(cryptoPayments.status, "pending"), lt(cryptoPayments.createdAt, cutoff)));
    if (stale.length === 0) return 0;
    await db.update(cryptoPayments)
      .set({ status: "expired" })
      .where(and(eq(cryptoPayments.status, "pending"), lt(cryptoPayments.createdAt, cutoff)));
    return stale.length;
  }

  async getOrders(userId: number): Promise<(Order & { items: (OrderItem & { stockItem: StockItem | null, variant: Variant | null })[] })[]> {
    const userOrders = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    
    const result = [];
    for (const o of userOrders) {
      const mayViewDelivery = ["delivering", "fulfilled", "replaced"].includes(o.status);
      const oItems = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
      const itemsWithDetails = [];
      for (const i of oItems) {
        const [stockItem] = mayViewDelivery && i.stockItemId
          ? await db.select().from(stockItems).where(eq(stockItems.id, i.stockItemId))
          : [undefined];
        const [variant] = i.variantId ? await db.select().from(variants).where(eq(variants.id, i.variantId)) : [undefined];
        const [product] = variant?.productId ? await db.select().from(products).where(eq(products.id, variant.productId)) : [undefined];
        const [card] = mayViewDelivery && i.cardId
          ? await db.select().from(cards).where(eq(cards.id, i.cardId))
          : [undefined];
        itemsWithDetails.push({ ...i, stockItem: stockItem || null, variant: variant || null, card: card || null, productName: product?.name || null });
      }
      result.push({ ...o, items: itemsWithDetails });
    }
    return result;
  }

  async getOrder(id: number) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const mayViewDelivery = ["delivering", "fulfilled", "replaced"].includes(order.status);
    const oItems = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    const itemsWithDetails = [];
    for (const i of oItems) {
      const [stockItem] = mayViewDelivery && i.stockItemId
        ? await db.select().from(stockItems).where(eq(stockItems.id, i.stockItemId))
        : [undefined];
      const [variant] = i.variantId ? await db.select().from(variants).where(eq(variants.id, i.variantId)) : [undefined];
      const [card] = mayViewDelivery && i.cardId
        ? await db.select().from(cards).where(eq(cards.id, i.cardId))
        : [undefined];
      itemsWithDetails.push({ ...i, stockItem: stockItem || null, variant: variant || null, card: card || null });
    }
    
    return { ...order, items: itemsWithDetails };
  }

  async getAllOrders(): Promise<any[]> {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const result = [];
    for (const o of allOrders) {
      const [user] = await db.select().from(users).where(eq(users.id, o.userId));
      const oItems = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
      const itemsWithDetails = [];
      for (const i of oItems) {
        const [stockItem] = i.stockItemId ? await db.select().from(stockItems).where(eq(stockItems.id, i.stockItemId)) : [undefined];
        const [variant] = i.variantId ? await db.select().from(variants).where(eq(variants.id, i.variantId)) : [undefined];
        const [product] = variant?.productId ? await db.select().from(products).where(eq(products.id, variant.productId)) : [undefined];
        const [card] = i.cardId ? await db.select().from(cards).where(eq(cards.id, i.cardId)) : [undefined];
        itemsWithDetails.push({ ...i, stockItem: stockItem || null, variant: variant || null, card: card || null, productName: product?.name || null });
      }
      let paymentMethod = "Unknown";
      try {
        if (o.paymentMethod) {
          paymentMethod = o.paymentMethod;
        } else {
          const [cryptoPay] = await db.select().from(cryptoPayments).where(eq(cryptoPayments.orderId, o.id));
          if (cryptoPay) {
            paymentMethod = "Crypto";
          } else {
            const purchaseTxs = await db.select().from(transactions)
              .where(and(eq(transactions.userId, o.userId), eq(transactions.type, "purchase")))
              .orderBy(desc(transactions.createdAt));
            const purchaseTx = purchaseTxs.find(tx => {
              const txTime = new Date(tx.createdAt).getTime();
              const orderTime = new Date(o.createdAt).getTime();
              return Math.abs(txTime - orderTime) < 30000;
            });
            if (purchaseTx?.paymentMethod) paymentMethod = purchaseTx.paymentMethod;
            else paymentMethod = "Wallet";
          }
        }
      } catch (e) {}
      result.push({ ...o, user: { id: user?.id, username: user?.username, email: user?.email }, items: itemsWithDetails, paymentMethod });
    }
    return result;
  }

  async refundOrder(orderId: number): Promise<Order> {
    return db.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId));
      if (!order) throw new Error("Order not found");
      if (order.status === "refunded") throw new Error("Order already refunded");

      // Claim the refund before touching inventory or the wallet so two
      // concurrent admin requests cannot credit the same order twice.
      const [refunded] = await tx
        .update(orders)
        .set({ status: "refunded" as const })
        .where(and(eq(orders.id, orderId), ne(orders.status, "refunded")))
        .returning();
      if (!refunded) throw new Error("Order already refunded");

      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      for (const item of items) {
        if (item.itemType === "product" && item.stockItemId) {
          await tx.update(orderItems).set({ stockItemId: null }).where(eq(orderItems.id, item.id));
          await tx.delete(stockItems).where(eq(stockItems.id, item.stockItemId));
        }
        if (item.itemType === "card" && item.cardId) {
          await tx.update(orderItems).set({ cardId: null }).where(eq(orderItems.id, item.id));
          await tx.delete(cards).where(eq(cards.id, item.cardId));
        }
      }

      await tx
        .update(users)
        .set({ balance: sql`${users.balance} + ${order.total}` })
        .where(eq(users.id, order.userId));
      await tx.insert(transactions).values({
        userId: order.userId,
        amount: order.total,
        type: "refund",
        description: `Refund for order #${order.orderId}`,
      });

      return refunded;
    });
  }

  async updateOrderDelivery(orderId: number, _deliveryContent: string): Promise<Order> {
    // Delivery data must always be generated from the exact stock IDs assigned
    // to this order. Never let an admin request inject unrelated inventory.
    return this.fulfillPendingOrder(orderId);
  }

  async createTransaction(userId: number, amount: number, type: string, description: string): Promise<Transaction> {
    const [tx] = await db.insert(transactions).values({
      userId,
      amount,
      type,
      description
    }).returning();
    return tx;
  }

  async createTransactionWithMethod(userId: number, amount: number, type: string, description: string, paymentMethod: string): Promise<Transaction> {
    const [tx] = await db.insert(transactions).values({
      userId,
      amount,
      type,
      description,
      paymentMethod
    }).returning();
    return tx;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async getRedeemCode(code: string): Promise<RedeemCode | undefined> {
    const [rc] = await db.select().from(redeemCodes).where(eq(redeemCodes.code, code));
    return rc;
  }

  async markRedeemCodeUsed(id: number, userId: number): Promise<void> {
    await db.update(redeemCodes).set({ isUsed: true, usedBy: userId }).where(eq(redeemCodes.id, id));
  }

  async createRedeemCode(code: string, amount: number): Promise<RedeemCode> {
    const [rc] = await db.insert(redeemCodes).values({ code, amount }).returning();
    return rc;
  }

  async getAllRedeemCodes(): Promise<RedeemCode[]> {
    return db.select().from(redeemCodes).orderBy(desc(redeemCodes.createdAt));
  }

  async getDashboardStats() {
    const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [salesSum] = await db.select({ sum: sql<number>`sum(${orders.total})` }).from(orders).where(eq(orders.status, 'fulfilled'));
    const [stockCount] = await db.select({ count: sql<number>`count(*)` }).from(stockItems).where(and(eq(stockItems.isSold, false), eq(stockItems.isReserved, false)));
    const [soldCount] = await db.select({ count: sql<number>`count(*)` }).from(stockItems).where(eq(stockItems.isSold, true));
    const [ordersCount] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const [pendingCount] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, 'waiting_payment'));
    const [stockWorthRow] = await db
      .select({ worth: sql<number>`coalesce(sum(${variants.price}), 0)` })
      .from(stockItems)
      .innerJoin(variants, eq(stockItems.variantId, variants.id))
      .where(and(eq(stockItems.isSold, false), eq(stockItems.isReserved, false)));

    return {
      totalUsers: Number(usersCount.count),
      totalSales: Number(salesSum.sum || 0),
      totalRevenue: Number(salesSum.sum || 0),
      storeBalance: 0,
      itemsInStock: Number(stockCount.count),
      itemsSold: Number(soldCount.count),
      totalOrders: Number(ordersCount.count),
      pendingOrders: Number(pendingCount.count),
      stockWorth: Number(stockWorthRow?.worth || 0),
    };
  }

  async getAdminLogs(): Promise<any[]> {
    return db.select().from(transactions).where(eq(transactions.type, "admin_adjustment")).orderBy(desc(transactions.createdAt)).limit(50);
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return db.select().from(announcements).where(eq(announcements.active, true)).orderBy(desc(announcements.createdAt));
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [ann] = await db.insert(announcements).values(announcement).returning();
    return ann;
  }

  async uploadImage(filename: string, mimeType: string, data: string): Promise<UploadedImage> {
    const [img] = await db.insert(uploadedImages).values({ filename, mimeType, data }).returning();
    return img;
  }

  async getImage(id: number): Promise<UploadedImage | undefined> {
    const [img] = await db.select().from(uploadedImages).where(eq(uploadedImages.id, id));
    return img;
  }

  async createSupportTicket(ticket: any): Promise<any> {
    const [t] = await db.insert(supportTickets).values(ticket).returning();
    return t;
  }

  async createSupportTicketForOrder(ticket: any): Promise<any> {
    const rows = await db.transaction(async (tx) => {
      const lockKey = `${ticket.userId}:${ticket.orderId}`;
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${lockKey}))`);

      const [existing] = await tx
        .select({ id: supportTickets.id })
        .from(supportTickets)
        .where(and(
          eq(supportTickets.userId, ticket.userId),
          eq(supportTickets.orderId, ticket.orderId),
        ))
        .limit(1);
      if (existing) throw new Error("TICKET_EXISTS");

      return tx.insert(supportTickets).values(ticket).returning();
    });
    return rows[0];
  }

  async getSupportTickets(userId?: number): Promise<any[]> {
    const q = db
      .select({
        ticket: supportTickets,
        purchaseAt: orders.createdAt,
        orderDbId: orders.id,
        orderStatus: orders.status,
        deliveryContent: orders.deliveryContent,
      })
      .from(supportTickets)
      .leftJoin(orders, and(
        eq(orders.orderId, supportTickets.orderId),
        eq(orders.userId, supportTickets.userId),
      ))
      .orderBy(desc(supportTickets.createdAt));
    const rows = userId
      ? await q.where(eq(supportTickets.userId, userId))
      : await q;
    return Promise.all(rows.map(async ({
      ticket,
      purchaseAt,
      orderDbId,
      orderStatus,
      deliveryContent,
    }) => {
      const canViewStock = ["delivering", "fulfilled", "replaced", "refunded"].includes(orderStatus ?? "");
      let purchasedStock: Array<{
        itemType: string;
        label: string;
        content: string;
        quantity: number;
      }> = [];

      if (orderDbId && canViewStock) {
        const itemRows = await db.select({
          itemType: orderItems.itemType,
          quantity: orderItems.quantity,
          cardNumber: cards.cardNumber,
          expiry: cards.expiry,
          cvv: cards.cvv,
          country: cards.country,
          extras: cards.extras,
          stockContent: stockItems.content,
          productName: products.name,
          variantName: variants.name,
        })
          .from(orderItems)
          .leftJoin(cards, eq(cards.id, orderItems.cardId))
          .leftJoin(stockItems, eq(stockItems.id, orderItems.stockItemId))
          .leftJoin(variants, eq(variants.id, orderItems.variantId))
          .leftJoin(products, eq(products.id, variants.productId))
          .where(eq(orderItems.orderId, orderDbId))
          .orderBy(asc(orderItems.id));

        purchasedStock = itemRows.flatMap(item => {
          if (item.itemType === "card" && item.cardNumber) {
            return [{
              itemType: "card",
              label: "Card",
              content: formatCardDeliveryContent({
                cardNumber: item.cardNumber,
                expiry: item.expiry ?? "",
                cvv: item.cvv ?? "",
                country: item.country ?? "",
                extras: item.extras,
              }),
              quantity: item.quantity ?? 1,
            }];
          }
          if (item.itemType === "product" && item.stockContent) {
            return [{
              itemType: "product",
              label: [item.productName, item.variantName].filter(Boolean).join(" · ") || "Product",
              content: item.stockContent,
              quantity: item.quantity ?? 1,
            }];
          }
          return [];
        });
      }

      // Refunded legacy orders may have deleted their linked inventory rows,
      // but the order-level delivery snapshot still preserves what was sold.
      if (purchasedStock.length === 0 && canViewStock && deliveryContent?.trim()) {
        purchasedStock = [{ itemType: "order", label: "Purchased stock", content: deliveryContent, quantity: 1 }];
      }

      return { ...ticket, purchaseAt, purchasedStock };
    }));
  }

  async getSupportTicket(id: number): Promise<any> {
    const [t] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return t;
  }

  async updateSupportTicket(id: number, data: any): Promise<any> {
    // Use raw SQL to avoid Drizzle's enum type-check on the status column
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      const col = key.replace(/([A-Z])/g, '_$1').toLowerCase(); // camelCase → snake_case
      setClauses.push(`${col} = $${idx++}`);
      values.push(value);
    }
    values.push(id);
    const result = await pool.query(
      `UPDATE support_tickets SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async getCards(): Promise<Card[]> {
    return db.select().from(cards).where(eq(cards.isSold, false)).orderBy(desc(cards.createdAt));
  }

  async getCard(id: number): Promise<Card | undefined> {
    const [card] = await db.select().from(cards).where(eq(cards.id, id));
    return card;
  }

  async createCard(insertCard: InsertCard): Promise<Card> {
    const inputBinData = insertCard.binData
      && typeof insertCard.binData === "object"
      && !Array.isArray(insertCard.binData)
      ? insertCard.binData as Record<string, any>
      : null;
    const metadata = extractCardMetadata(insertCard.extras, insertCard.cardNumber, inputBinData);
    if (!metadata.state || !metadata.zip) {
      const missing = [
        !metadata.state ? "a valid two-letter state" : "",
        !metadata.zip ? "a valid 5-digit ZIP" : "",
      ].filter(Boolean).join(" and ");
      throw new Error(`Card stock requires ${missing}`);
    }

    const binData = {
      ...(inputBinData ?? {}),
      bin: metadata.bin,
      state: metadata.state,
      city: metadata.city || null,
      zip: metadata.zip,
    };
    const fingerprint = normalizeCardNumber(insertCard.cardNumber);
    if (fingerprint.length < 6) throw new Error("Card number must contain a valid BIN");

    return db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${fingerprint}))`);
      const duplicate = await tx.execute(sql`
        SELECT id
        FROM cards
        WHERE regexp_replace(card_number, '\\D', '', 'g') = ${fingerprint}
        LIMIT 1
      `);
      if (duplicate.rows.length > 0) {
        throw new Error("Duplicate card stock detected; this card is already in inventory or order history");
      }

      const [card] = await tx.insert(cards).values({
        ...insertCard,
        binData,
      } as typeof cards.$inferInsert).returning();
      return card;
    });
  }

  async updateCard(id: number, data: Partial<Card>): Promise<Card> {
    const [card] = await db.update(cards).set(data).where(eq(cards.id, id)).returning();
    return card;
  }

  async purchaseCard(cardId: number, userId: number, finalPrice?: number): Promise<Card> {
    return db.transaction(async (tx) => {
      const [card] = await tx.select().from(cards).where(and(eq(cards.id, cardId), eq(cards.isSold, false)));
      if (!card) throw new Error("Card not found or already sold");
      this.assertCardBinIsSellable(card);
      await this.assertCardNumberIsUnique(tx, card.cardNumber);

      const paidTotal = finalPrice ?? card.price;
      const [debitedUser] = await tx.update(users)
        .set({ balance: sql`${users.balance} - ${paidTotal}` })
        .where(and(eq(users.id, userId), sql`${users.balance} >= ${paidTotal}`))
        .returning({ id: users.id });
      if (!debitedUser) throw new Error("Insufficient balance");

      const [updated] = await tx.update(cards)
        .set({ isSold: true, userId })
        .where(and(eq(cards.id, cardId), eq(cards.isSold, false)))
        .returning();
      if (!updated) throw new Error("Card not found or already sold");

      await tx.insert(transactions).values({
        userId,
        amount: -paidTotal,
        type: "purchase",
        description: `Purchased card ${card.maskedCard}`,
      });

      const publicOrderId = Math.random().toString(36).substring(2, 15);
      const [order] = await tx.insert(orders).values({
        userId,
        orderId: `CARD-${publicOrderId}`,
        total: paidTotal,
        paidAmount: paidTotal,
        status: "fulfilled",
        deliveryContent: formatCardDeliveryContent(card),
        paymentMethod: "wallet",
      }).returning();

      await tx.insert(orderItems).values({
        orderId: order.id,
        variantId: null,
        cardId: card.id,
        itemType: "card",
        price: card.price,
        quantity: 1,
      });

      return updated;
    });
  }

  async getUserCards(userId: number): Promise<Card[]> {
    return db.select().from(cards).where(eq(cards.userId, userId)).orderBy(desc(cards.createdAt));
  }

  async deleteCard(id: number): Promise<void> {
    await db.delete(cards).where(eq(cards.id, id));
  }

  async getCardBasesWithCount(): Promise<(CardBase & { count: number })[]> {
    const result = await db.execute(sql`
       SELECT cb.id, cb.name, cb.created_at,
              COUNT(c.id) FILTER (WHERE c.is_sold = false) as count
      FROM card_bases cb
      LEFT JOIN cards c ON c.base_id = cb.id
      GROUP BY cb.id, cb.name, cb.created_at
      ORDER BY cb.name
    `);
    return (result.rows as any[]).map((r: any) => ({
      id: r.id, name: r.name, createdAt: r.created_at, count: Number(r.count)
    }));
  }

  async createCardBase(name: string): Promise<CardBase> {
    const [base] = await db.insert(cardBases).values({ name }).returning();
    return base;
  }

  async updateCardBase(id: number, name: string): Promise<CardBase> {
    const [base] = await db.update(cardBases).set({ name }).where(eq(cardBases.id, id)).returning();
    return base;
  }

  async deleteCardBase(id: number): Promise<void> {
    const result = await db.execute(sql`SELECT COUNT(*) as n FROM cards WHERE base_id = ${id} AND is_sold = false`);
    const count = Number((result.rows[0] as any).n);
    if (count > 0) throw new Error("Cannot delete base with cards in stock");
    await db.delete(cardBases).where(eq(cardBases.id, id));
  }

  async getCardsByBase(baseId: number): Promise<Card[]> {
    return db.select().from(cards).where(and(
      eq(cards.baseId, baseId),
      eq(cards.isSold, false)
    )).orderBy(desc(cards.createdAt));
  }

  async createSellerApplication(userId: number, sellerCode: string): Promise<SellerApplication> {
    const [app] = await db.insert(sellerApplications).values({ userId, sellerCode, status: "pending" }).returning();
    return app;
  }

  async getSellerApplication(userId: number): Promise<SellerApplication | undefined> {
    const [app] = await db.select().from(sellerApplications).where(eq(sellerApplications.userId, userId));
    return app;
  }

  async getAllSellerApplications(): Promise<(SellerApplication & { username: string })[]> {
    const rows = await db
      .select({ app: sellerApplications, username: users.username })
      .from(sellerApplications)
      .leftJoin(users, eq(sellerApplications.userId, users.id))
      .orderBy(desc(sellerApplications.createdAt));
    return rows.map(r => ({ ...r.app, username: r.username ?? "" }));
  }

  async approveSellerApplication(id: number): Promise<void> {
    const [app] = await db.select().from(sellerApplications).where(eq(sellerApplications.id, id));
    if (!app) return;
    await db.update(sellerApplications).set({ status: "approved" }).where(eq(sellerApplications.id, id));
    await db.update(users).set({ isWorker: true }).where(eq(users.id, app.userId));
  }

  async rejectSellerApplication(id: number): Promise<void> {
    await db.update(sellerApplications).set({ status: "rejected" }).where(eq(sellerApplications.id, id));
  }

  async getAchs(): Promise<Ach[]> {
    return db.select().from(achs).where(eq(achs.isSold, false)).orderBy(desc(achs.createdAt));
  }

  async getAch(id: number): Promise<Ach | undefined> {
    const [ach] = await db.select().from(achs).where(eq(achs.id, id));
    return ach;
  }

  async createAch(data: InsertAch & { sellerId?: number }): Promise<Ach> {
    const [ach] = await db.insert(achs).values({ ...data, sellerId: data.sellerId ?? null } as any).returning();
    return ach;
  }

  async purchaseAch(achId: number): Promise<Ach> {
    const [updated] = await db.update(achs).set({ isSold: true }).where(eq(achs.id, achId)).returning();
    return updated;
  }

  async deleteAch(id: number): Promise<void> {
    await db.delete(achs).where(eq(achs.id, id));
  }

  async getSellerAchs(sellerId: number): Promise<Ach[]> {
    return db.select().from(achs).where(eq(achs.sellerId, sellerId)).orderBy(desc(achs.createdAt));
  }

  async getSetting(key: string, defaultValue: string = ""): Promise<string> {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    if (!row) return defaultValue;
    return row.isSecret ? decryptSettingValue(row.value) : row.value;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const isSecret = isKnownSecretKey(key);
    const storedValue = isSecret ? encryptSettingValue(value) : value;
    await db
      .insert(siteSettings)
      .values({ key, value: storedValue, isSecret, kind: isSecret ? "secret" : "text", updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: storedValue, isSecret, kind: isSecret ? "secret" : "text", updatedAt: new Date() },
      });
  }

  async getPaymentMethodsConfig(): Promise<Record<string, boolean>> {
    const rows = await db.select().from(siteSettings)
      .where(sql`key LIKE 'payment_method_%'`);
    const defaults: Record<string, boolean> = { wallet: true, cashapp: true, crypto: true, stars: true };
    for (const row of rows) {
      const method = row.key.replace("payment_method_", "");
      defaults[method] = row.value === "true";
    }
    return defaults;
  }

  async getCryptoCurrencies(enabledOnly: boolean = false): Promise<CryptoCurrency[]> {
    return db
      .select()
      .from(cryptoCurrencies)
      .where(enabledOnly ? eq(cryptoCurrencies.enabled, true) : undefined)
      .orderBy(asc(cryptoCurrencies.sortOrder), asc(cryptoCurrencies.id));
  }

  async getCryptoCurrencyByCode(code: string): Promise<CryptoCurrency | undefined> {
    const [currency] = await db
      .select()
      .from(cryptoCurrencies)
      .where(eq(cryptoCurrencies.code, code.trim().toUpperCase()))
      .limit(1);
    return currency;
  }

  async createCryptoCurrency(currency: { code: string; name: string; ticker: string; color: string; enabled?: boolean; sortOrder?: number }): Promise<CryptoCurrency> {
    const [created] = await db
      .insert(cryptoCurrencies)
      .values({
        code: currency.code.trim().toUpperCase(),
        name: currency.name.trim(),
        ticker: currency.ticker.trim().toUpperCase(),
        color: currency.color,
        enabled: currency.enabled ?? true,
        sortOrder: currency.sortOrder ?? 0,
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async updateCryptoCurrency(id: number, currency: Partial<Pick<CryptoCurrency, "name" | "ticker" | "color" | "enabled" | "sortOrder">>): Promise<CryptoCurrency | undefined> {
    const [updated] = await db
      .update(cryptoCurrencies)
      .set({ ...currency, updatedAt: new Date() })
      .where(eq(cryptoCurrencies.id, id))
      .returning();
    return updated;
  }

  async seedCryptoCurrencies(): Promise<void> {
    for (let sortOrder = 0; sortOrder < DEFAULT_CRYPTO_CURRENCIES.length; sortOrder++) {
      const currency = DEFAULT_CRYPTO_CURRENCIES[sortOrder];
      await db
        .insert(cryptoCurrencies)
        .values({ ...currency, sortOrder, enabled: true, updatedAt: new Date() })
        .onConflictDoNothing();
    }
  }

}

function splitStockContent(content: string): string[] {
  const raw = String(content ?? "");
  if (!raw.trim()) return [];

  const hasBlankLines = /\n[ \t]*\n/.test(raw);
  return hasBlankLines
    ? raw.split(/\n\s*\n/).map(block => block.trim()).filter(Boolean)
    : raw.split(/\n/).map(line => line.trim()).filter(Boolean);
}

export const storage = new DatabaseStorage();
