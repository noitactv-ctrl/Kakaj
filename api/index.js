let appPromise;
const appModulePath = require.resolve("../server/app");

function getApp() {
  appPromise ??= Promise.resolve()
    .then(() => {
      // Keep module evaluation inside the promise so Vercel can return a
      // controlled initialization error instead of crashing the invocation.
      return import(appModulePath).then(({ createApp }) =>
        createApp({ serveClient: false }),
      );
    })
    .catch((error) => {
      appPromise = undefined;
      throw error;
    });
  return appPromise;
}

function initializationMessage(error) {
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
  const errorCode = error && typeof error === "object" && "code" in error
    ? String(error.code ?? "")
    : "";

  if (/database|postgres|relation|connection|timeout|authentication|invalid.*url|url.*invalid/i.test(rawMessage)) {
    return `The Vercel function could not initialize its PostgreSQL connection or schema${errorCode ? ` (${errorCode})` : ""}: ${safeMessage}`;
  }

  return `The Vercel function failed during server initialization${errorCode ? ` (${errorCode})` : ""}: ${safeMessage}`;
}

module.exports = async function handler(req, res) {
  try {
    const { app } = await getApp();
    return app(req, res);
  } catch (error) {
    return res.status(503).json({
      message: initializationMessage(error),
    });
  }
};