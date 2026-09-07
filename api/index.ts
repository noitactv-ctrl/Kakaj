import type { Request, Response } from "express";
import { createApp } from "../server/app";

let appPromise: ReturnType<typeof createApp> | undefined;

function getApp() {
  appPromise ??= createApp({ serveClient: false }).catch((error) => {
    // Allow a later serverless invocation to retry after a transient database
    // or environment configuration failure instead of caching a rejected app.
    appPromise = undefined;
    throw error;
  });
  return appPromise;
}

export default async function handler(req: Request, res: Response) {
  try {
    const { app } = await getApp();
    return app(req, res);
  } catch {
    // Never leave the browser waiting when the serverless app cannot initialize.
    // Keep the response generic so database connection details are not exposed.
    return res.status(503).json({
      message: "The TurtleCC API could not initialize. Verify DATABASE_URL and SESSION_SECRET in the deployment environment.",
    });
  }
}