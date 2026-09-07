# TurtleCC Website

This is a React, Express, and PostgreSQL digital marketplace. For complete
self-hosting instructions, see [`HOSTING.md`](./HOSTING.md).

## Quick start

```bash
npm ci
cp .env.example .env
# Edit .env with your own PostgreSQL URL and secrets.
npm run db:push
npm run dev
```

The production flow is:

```bash
npm run check
npm run build
npm run start
```

To create a clean archive for a VPS:

```bash
npm run package:vps
```

The archive is written to `release/` and excludes secrets, databases, build
output, dependencies, and workspace-only files. Upload it to the VPS and follow
[`HOSTING.md`](./HOSTING.md).

The application listens on port `5000` by default. The source package does not
include `node_modules`, build output, database contents, Git history, or secret
files.

## Vercel deployment

This project includes `vercel.json` and `api/index.ts` for Vercel's Node.js
serverless runtime.

1. Import the repository into Vercel.
2. Use `npm run build` as the build command.
3. Use `dist/public` as the output directory.
4. Add the variables from `.env.example` in the Vercel project settings,
   including `DATABASE_URL`, `SESSION_SECRET`, `SETTINGS_ENCRYPTION_KEY`,
   `ADMIN_EMAILS`, `OWNER_EMAILS`, and `CRON_SECRET`.
5. Run `npm run db:push` once against the production PostgreSQL URL before
   registering the first account.
6. Set `PLISIO_PUBLIC_APP_URL` to the final HTTPS Vercel domain before enabling
   crypto payments.

Vercel can serve the web app, API routes, authentication, database sessions,
payments, and the protected five-minute maintenance cron. Telegram polling is
not run inside Vercel serverless functions; keep the existing VPS process or a
separate always-on worker for the Telegram bot. The VPS setup remains available
in [`HOSTING.md`](./HOSTING.md).