import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // A failed external database must not leave a serverless request hanging
  // indefinitely. This is especially important on Vercel, where the client
  // would otherwise remain on the app's loading screen forever.
  connectionTimeoutMillis: 10_000,
  query_timeout: 10_000,
  statement_timeout: 10_000,
  idleTimeoutMillis: 30_000,
  max: process.env.VERCEL === "1" ? 5 : 10,
});
pool.on("error", (error) => {
  // PostgreSQL can terminate an idle client during maintenance or a database
  // restart. The pool removes that client; keep the web process alive so the
  // next query can obtain a fresh connection.
  console.error("[db] idle client error:", error);
});
export const db = drizzle(pool, { schema });
