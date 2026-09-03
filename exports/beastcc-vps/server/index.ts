import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { storage } from "./storage";
import { pool, db } from "./db";
import { sql } from "drizzle-orm";
import { ensureApiSettingsSchema, migrateLegacySecretSettings, removeRetiredApiSettings } from "./settings";
import { reconcilePlisioIntents } from "./plisio-reconciler";
import { startTelegramBot, stopTelegramBot } from "./telegram-bot";

const app = express();
const httpServer = createServer(app);

function requireProductionSecrets() {
  if (process.env.NODE_ENV !== "production") return;
  const insecureValues = new Set([
    "",
    "replace-with-a-long-random-secret",
    "replace-with-a-different-long-random-secret",
    "rulf_fallback_dev_secret_change_in_prod",
  ]);
  // Settings encryption intentionally supports SESSION_SECRET as a secure
  // fallback, so only the session secret is mandatory in production.
  for (const key of ["SESSION_SECRET"]) {
    if (insecureValues.has(process.env[key]?.trim() ?? "")) {
      throw new Error(`${key} must be set to a unique, non-template value in production.`);
    }
  }
}

requireProductionSecrets();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: "5mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // Never serialize API response bodies into logs: authenticated
      // responses can contain delivered stock, card data, or account details.
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  // Ensure the session table exists (connect-pg-simple needs this)
  // DB schema migrations

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
    ) WITH (OIDS=FALSE)
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")`);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS "IDX_cards_available_bin_prefix"
    ON "cards" ("card_number" text_pattern_ops)
    WHERE "is_sold" = false
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS "IDX_cards_number_fingerprint"
    ON "cards" ((regexp_replace("card_number", '\\D', '', 'g')))
  `);
  await ensureApiSettingsSchema();
  await migrateLegacySecretSettings();
  await removeRetiredApiSettings();

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Seed default site settings (idempotent — only sets if not already present)
  try {
    await db.execute(sql`
      INSERT INTO site_settings (key, value) VALUES
        ('cashapp_tag',            '$Jacobgettinmotionx'),
        ('payment_method_cashapp', 'true'),
        ('payment_method_chime',   'false'),
        ('payment_method_zelle',   'false'),
        ('payment_method_crypto',  'true')
      ON CONFLICT (key) DO NOTHING
    `);
    await storage.seedCryptoCurrencies();
    log("Site settings seed complete");
  } catch (e) {
    console.error("Site settings seed failed:", e);
  }

  // Cancel stale pending orders (older than 1 hour) — releases reserved stock back
  const cancelStaleOrders = async () => {
    try {
      const cancelled = await storage.cancelStalePendingOrders(60 * 60 * 1000);
      if (cancelled > 0) {
        log(`Cancelled ${cancelled} stale pending order(s) older than 1 hour`);
      }
    } catch (err) {
      console.error("Error in stale order cleanup job:", err);
    }
  };
  cancelStaleOrders();
  setInterval(cancelStaleOrders, 5 * 60 * 1000);

  // Reconcile only ambiguous Plisio invoice-creation attempts. Completed and
  // terminal payments are still driven by Plisio's signed callbacks.
  const reconcileCryptoIntents = async () => {
    try {
      await reconcilePlisioIntents();
    } catch (err) {
      console.error("Error reconciling Plisio payment intents:", err);
    }
  };
  reconcileCryptoIntents();
  setInterval(reconcileCryptoIntents, 60 * 1000);

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`serving on port ${port}`);
    startTelegramBot();
  });

  // Graceful shutdown — close the HTTP server on SIGTERM/SIGINT so the port
  // is released before the process exits, preventing EADDRINUSE on restart.
  const shutdown = () => {
    stopTelegramBot();
    httpServer.close(() => process.exit(0));
    pool.end().catch((error) => console.error("[db] shutdown error:", error));
    setTimeout(() => process.exit(0), 3000); // hard exit after 3 s
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT",  shutdown);
})();
