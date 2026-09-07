import type { Request, Response } from "express";
import type { Express } from "express";
import type { Server } from "http";
import { createRequire } from "node:module";

const runtimeRequire = createRequire(import.meta.url);

type AppResult = {
  app: Express;
  httpServer: Server;
};

let appPromise: Promise<AppResult> | undefined;

async function getApp(): Promise<AppResult> {
  appPromise ??= Promise.resolve()
    .then(() => {
      const { createApp } = runtimeRequire("../server/app") as typeof import("../server/app");
      return createApp({ serveClient: false });
    })
    .catch((error) => {
    // Allow a later serverless invocation to retry after a transient database
    // or environment configuration failure instead of caching a rejected app.
    appPromise = undefined;
    throw error;
    });
  return appPromise;
}

function initializationMessage(error: unknown): string {
  if (!process.env.DATABASE_URL) {
    return "DATABASE_URL is not configured in the Vercel environment.";
  }
  if (!process.env.SESSION_SECRET) {
    return "SESSION_SECRET is not configured in the Vercel environment.";
  }

  const rawMessage = error instanceof Error ? error.message : String(error);
  const safeMessage = rawMessage
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "postgresql://[redacted]")
    .replace(/(password\s*[=:]\s*)[^\s]+/gi, "$1[redacted]")
    .slice(0, 240);
  const errorCode = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";

  if (/database|postgres|relation|connection|timeout|authentication|invalid.*url|url.*invalid/i.test(rawMessage)) {
    return `The Vercel function could not initialize its PostgreSQL connection or schema${errorCode ? ` (${errorCode})` : ""}: ${safeMessage}`;
  }

  return `The Vercel function failed during server initialization${errorCode ? ` (${errorCode})` : ""}: ${safeMessage}`;
}

export default async function handler(req: Request, res: Response) {
  try {
    const { app } = await getApp();
    return app(req, res);
  } catch (error) {
    // Never leave the browser waiting when the serverless app cannot initialize.
    // Keep the response generic so database connection details are not exposed.
    return res.status(503).json({
      message: initializationMessage(error),
    });
  }
}