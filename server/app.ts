import express, { type Express, type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import { createServer, type Server } from "http";
import { sql } from "drizzle-orm";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { storage } from "./storage";
import { pool, db } from "./db";
import { ensureApiSettingsSchema, migrateLegacySecretSettings, removeRetiredApiSettings } from "./settings";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export interface CreateAppOptions {
  serveClient: boolean;
}

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

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

async function initializeDatabase() {
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
}

async function seedDefaultSettings() {
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
  } catch (error) {
    console.error("Site settings seed failed:", error);
  }
}

export async function createApp({ serveClient }: CreateAppOptions): Promise<{
  app: Express;
  httpServer: Server;
}> {
  requireProductionSecrets();

  const app = express();
  const httpServer = createServer(app);

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  app.use(
    express.json({
      limit: "5mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: false }));

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

  await initializeDatabase();
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

  if (serveClient) {
    serveStatic(app);
  }

  await seedDefaultSettings();

  return { app, httpServer };
}