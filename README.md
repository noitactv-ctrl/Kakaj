# NYCHQ Website

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

The application listens on port `5000` by default. The source package does not
include `node_modules`, build output, database contents, Git history, or secret
files.