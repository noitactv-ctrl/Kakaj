# BEASTCC — Digital Marketplace

## What This Is

A pixel-styled digital marketplace for selling digital items (logs and cards) with stock-based delivery. Built with React + Express + PostgreSQL.

**Customer brand:** BEASTCC

---

## Features

- **Logs** — searchable product listings with variants and stock counts
- **Cart** — add products or cards, then check out from the responsive cart sidebar
- **Wallet** — top up balance with manual payment methods, crypto invoices, or redeemable codes
- **Manual payments** — user sends the exact amount with a generated note; admin confirms or marks the payment unpaid
- **Stock System** — admin pre-loads text items per variant; each purchase pulls one item off the stack
- **Admin Dashboard** — manage products, variants, stock, orders, users, redeem codes, announcements
- **Payment Method Toggles** — admin can show/hide Wallet, CashApp, and Crypto per customer
- **Games** — Plinko
- **Orders** — order history with exact delivery content and support links
- **Pixel theme** — dark blue storefront with BEASTCC branding and custom arrow/hand/text cursors

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Wouter, TanStack Query, Zustand, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL (Drizzle ORM) |
| Auth | Passport.js (local strategy), express-session, connect-pg-simple |
| Payments | Manual deposits and configurable crypto invoices via Plisio |

---

## Setup After Remix

### 1. Database

The Replit PostgreSQL database is already configured. On first run the app automatically creates:
- All schema tables via Drizzle (`npm run db:push`)
- The `session` table (created in `server/index.ts` on startup)

**Run schema push after any schema change:**
```
npm run db:push
```

### 2. Environment Variables

Set these in the Replit **Secrets** panel:

| Secret | Required | Description |
|---|---|---|
| `DATABASE_URL` | Auto-set | Set automatically when you create a Replit DB |
| `SESSION_SECRET` | Required in production | Random string for signing session cookies |
| `SETTINGS_ENCRYPTION_KEY` | Required for provider secrets | Dedicated key used to encrypt admin-managed provider secrets |
| `ADMIN_EMAILS` | Required for bootstrap | Comma-separated email addresses that receive admin access |
| `OWNER_EMAILS` | Required for owner controls | Comma-separated email addresses allowed to manage admins and workers |
| `PLISIO_API_KEY` | Optional fallback | Plisio secret key; can instead be encrypted in Admin → Integrations |
| `PLISIO_PUBLIC_APP_URL` | Required for crypto | HTTPS public app URL for Plisio callbacks and return links; can instead be set in Admin → Integrations |

### 3. Admin Account

Admin accounts are granted based on email address. Set `ADMIN_EMAILS` before registering the administrator:

```typescript
ADMIN_EMAILS=your@email.com,another@email.com
```

Register on the site with one of those emails — you'll automatically be granted admin role.

### 4. Payment Setup (Admin Panel → Integrations)

1. Go to **Admin → Integrations**
2. Configure the enabled manual payment handles and descriptions
3. Configure the Plisio secret and HTTPS public app URL if crypto is needed
4. Enable the desired payment methods
5. Users will only see methods that are enabled and fully configured

### 5. Adding Stock (Admin Panel → Products)

1. Create a product and add variants (with prices in cents, e.g. `500` = $5.00)
2. Click the variant to open the stock panel
3. Paste your stock items — each item separated by a **blank line** (`\n\n`)
4. Items are delivered one-by-one per order

### 6. Creating Redeem Codes (Admin Panel → Codes)

1. Go to **Admin → Codes**
2. Enter a reward amount and number of codes
3. Give the generated one-time codes to users; they redeem them on the Redeem page

---

## Manual Product Order Flow

1. Customer adds products or cards to the cart
2. Customer selects a configured manual payment method and submits the order
3. A confirmation panel shows the exact amount, destination, and generated payment note
4. Admin sees the pending order in **Orders** and confirms payment or marks it unpaid
5. **Paid** → reserved product stock or selected cards are delivered to the user
6. **Unpaid** → reserved product stock is released and the order waits for payment

---

## Order Status Reference

| Status | Meaning |
|---|---|
| `pending` | Manual-payment order placed, awaiting admin confirmation |
| `waiting_payment` | Admin marked as unpaid |
| `fulfilled` | Wallet order paid, items assigned |
| `delivering` | CashApp order confirmed by admin, stock delivered |
| `refunded` | Order refunded to wallet |

---

## Key Files

| File | Purpose |
|---|---|
| `shared/schema.ts` | Database schema (Drizzle ORM) — single source of truth |
| `server/routes.ts` | All API routes |
| `server/storage.ts` | Database operations (IStorage interface) |
| `server/auth.ts` | Authentication setup, admin email list |
| `server/index.ts` | Server startup, session table auto-creation |
| `client/src/pages/AdminPage.tsx` | Full admin dashboard |
| `client/src/components/CartSidebar.tsx` | Responsive cart and wallet checkout |
| `client/src/pages/RedeemPage.tsx` | Reward-code redemption |
| `client/src/pages/LogsPage.tsx` | Product listings |
| `client/src/App.tsx` | Routes, global polling |

---

## Development

The workflow `Start application` runs `npm run dev` which starts both the Express backend and Vite frontend on port 5000.

```
npm run dev        # Start dev server
npm run db:push    # Push schema changes to database
npm run build      # Build for production
```

---

## System Architecture

### Frontend
- React 18 + TypeScript, Wouter for routing
- TanStack Query for all server state/caching
- Zustand for cart persistence (localStorage)
- shadcn/ui components + Tailwind CSS
- Framer Motion for game animations

### Backend
- Express 5, TypeScript (ESM modules)
- Passport.js local strategy, session-based auth
- PostgreSQL sessions via connect-pg-simple
- Drizzle ORM, drizzle-zod for validation

### Data Models
- **Users** — auth, balance (cents), role (user/admin), ban status
- **Products + Variants** — products have multiple variants with prices
- **Stock Items** — text items per variant, pulled on purchase (`isSold: true`)
- **Orders + OrderItems** — track purchases; orderItems link to stockItems
- **Transactions** — wallet history (top-ups, purchases, game wins/losses)
- **Redeem Codes** — one-time codes for wallet top-up
- **Site Settings** — payment handles, method toggles, fees, minimums, and announcements
- **Crypto Payments** — Plisio payment tracking; the historical provider-ID column is retained for existing records

### Build System
- Dev: Vite HMR proxied through Express
- Prod: Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`

### User Preferences
Preferred communication style: Simple, everyday language.
