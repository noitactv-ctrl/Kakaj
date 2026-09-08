import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

export const pool = new Pool({
  // Keep missing configuration from crashing the Vercel module before
  // api/index.ts can return a safe initialization diagnostic.
  ...(databaseUrl
    ? { connectionString: databaseUrl }
    : { host: "127.0.0.1", port: 1, user: "missing", database: "missing" }),
  // A failed external database must not leave a serverless request hanging
  // indefinitely. This is especially important on Vercel, where the client
  // would otherwise remain on the app's loading screen forever.
  connectionTimeoutMillis: 10_000,
  query_timeout: 10_000,
  statement_timeout: 10_000,
  idleTimeoutMillis: process.env.VERCEL === "1" ? 5_000 : 30_000,
  // Vercel can create many short-lived instances. Keep each instance to one
  // session so Supabase's session-mode pooler cannot be exhausted by fan-out.
  max: process.env.VERCEL === "1" ? 1 : 10,
});
pool.on("error", (error) => {
  // PostgreSQL can terminate an idle client during maintenance or a database
  // restart. The pool removes that client; keep the web process alive so the
  // next query can obtain a fresh connection.
  console.error("[db] idle client error:", error);
});
export const db = drizzle(pool, { schema });
