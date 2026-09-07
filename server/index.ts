import { createApp, log } from "./app";
import { pool } from "./db";
import { reconcilePlisioIntents } from "./plisio-reconciler";
import { startTelegramBot, stopTelegramBot } from "./telegram-bot";

(async () => {
  const isProduction = process.env.NODE_ENV === "production";
  const { app, httpServer } = await createApp({ serveClient: isProduction });

  if (!isProduction) {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // These jobs are intentionally started only by the long-running VPS process.
  // Vercel requests use api/index.ts and must not create unbounded timers.
  const cancelStaleOrders = async () => {
    try {
      const { storage } = await import("./storage");
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

  const reconcileCrypto = async () => {
    try {
      await reconcilePlisioIntents();
    } catch (err) {
      console.error("Error reconciling Plisio payment intents:", err);
    }
  };
  reconcileCrypto();
  setInterval(reconcileCrypto, 60 * 1000);

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`serving on port ${port}`);
    startTelegramBot();
  });

  const shutdown = () => {
    stopTelegramBot();
    httpServer.close(() => process.exit(0));
    pool.end().catch((error) => console.error("[db] shutdown error:", error));
    setTimeout(() => process.exit(0), 3000);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
})().catch((error) => {
  console.error("Application startup failed:", error);
  process.exit(1);
});