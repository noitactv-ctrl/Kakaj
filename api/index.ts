import type { Request, Response } from "express";
import type { Express } from "express";
import type { Server } from "http";

type AppResult = {
  app: Express;
  httpServer: Server;
};

let appPromise: Promise<AppResult> | undefined;

async function getApp(): Promise<AppResult> {
  appPromise ??= import("../server/app").then(({ createApp }) => createApp({ serveClient: false })).catch((error) => {
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
  if (error instanceof Error && /database|postgres|relation|connection|timeout/i.test(error.message)) {
    return "The Vercel function could not initialize its PostgreSQL connection or schema.";
  }
  return "The Vercel function failed during server initialization.";
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