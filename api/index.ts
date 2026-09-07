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
  const { app } = await getApp();
  return app(req, res);
}