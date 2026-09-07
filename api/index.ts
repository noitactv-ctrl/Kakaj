import type { Request, Response } from "express";
import { createApp } from "../server/app";

let appPromise: ReturnType<typeof createApp> | undefined;

function getApp() {
  appPromise ??= createApp({ serveClient: false });
  return appPromise;
}

export default async function handler(req: Request, res: Response) {
  const { app } = await getApp();
  return app(req, res);
}