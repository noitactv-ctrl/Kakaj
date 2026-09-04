# BEASTCC VPS package

This folder is a complete self-hosting copy of the BEASTCC application. It includes the website source, all `attached_assets`, Docker deployment files, and a full PostgreSQL export from the development environment.

## Important security warning

`database/development-database.sql` contains the current development records. It may include private account data, password hashes, balances, orders, support tickets, payment settings, Telegram linkage data, and digital inventory. Keep this package private and delete the SQL dump after a successful restore.

No Replit Secrets, API keys, session secrets, or provider credentials are included. Create new values on the VPS.

## Docker quick start with a fresh database

```bash
cp .env.example .env
# Edit .env and set strong unique values, especially POSTGRES_PASSWORD,
# DATABASE_URL, SESSION_SECRET, SETTINGS_ENCRYPTION_KEY, ADMIN_EMAILS,
# and OWNER_EMAILS.
docker compose up -d --build
docker compose ps
curl http://127.0.0.1:5000/api/health
```

Put Nginx or Caddy with HTTPS in front of port 5000. Do not expose PostgreSQL publicly.

## Restore the included database

For an existing-data restore, use a separate PostgreSQL database/volume and import the dump before starting the app:

```bash
docker compose up -d db
# Wait until the database is healthy, then import:
psql "$DATABASE_URL" < database/development-database.sql
# Start the application after the import without running the blank-database migration:
docker compose up -d --build --no-deps app
```

For a fresh database, `docker compose up -d --build` runs the migration service automatically.

## Node.js option

Use Node.js 20+, PostgreSQL 16+, and the commands in `HOSTING.md`:

```bash
npm install
npm run db:push
npm run check
npm run build
npm run start
```

Use a process manager such as systemd or PM2 and configure the reverse proxy for HTTPS.

## Telegram Credit Bot

Set a new `TELEGRAM_BOT_TOKEN` and `Telegram_group_id` on the VPS if needed, or configure the token in the owner-only Credit Bot panel. Configure the main channel ID, channel link, and bot username there. The bot daily reward, automatic one-time 16-digit linking numbers, `/relink 16-digit-number`, and membership/name tracking are stored in the database.
