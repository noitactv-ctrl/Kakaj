# Self-hosting BEASTCC

This guide runs the website on your own Linux server, VPS, or container host.
It does not copy the current Replit database or provider accounts. The
application code is portable, but the services around it belong to the host.

## What you need

- Node.js 20 or newer, or Docker Engine with Compose
- PostgreSQL 16 or a compatible PostgreSQL service
- A domain name and HTTPS for production
- A process manager or Docker restart policy
- A secure place for environment variables and backups

The app uses PostgreSQL for marketplace data **and login sessions**. Use a
persistent database, not an ephemeral container or local temporary filesystem.

## Restoring uploaded assets

The self-hosting source archive contains the application code and deployment
files. If separate `assets` archives were provided with it, extract the source
archive first, then extract every asset archive into that same destination
directory. They merge into `attached_assets/`, which preserves uploaded images
that may be referenced by records restored from an existing database backup.

The application can start without those optional archives on a brand-new
database.

## Option A: Docker Compose

1. Copy the safe template and edit it:

   ```bash
   cp .env.example .env
   ```

2. For the included PostgreSQL container, set matching values in `.env`:

   ```dotenv
   POSTGRES_DB=nychq
   POSTGRES_USER=nychq
   POSTGRES_PASSWORD=use-a-long-password
   DATABASE_URL=postgresql://nychq:use-a-long-password@db:5432/nychq
   SESSION_SECRET=use-a-long-random-secret
   SETTINGS_ENCRYPTION_KEY=use-a-different-long-random-secret
   ADMIN_EMAILS=your-real-admin-email@example.com
   OWNER_EMAILS=your-real-owner-email@example.com
   ```

   If a password contains URL-reserved characters, URL-encode it in
   `DATABASE_URL`.

3. Build and start:

   ```bash
   docker compose up -d --build
   docker compose ps
   docker compose logs -f app
   ```

   Compose waits for PostgreSQL, runs the schema push once, and then starts the
   production server. The app health check is available at
   `GET /api/health`.

4. Put Nginx, Caddy, or another HTTPS reverse proxy in front of port `5000`.
   A sample Nginx configuration is in [`deploy/nginx.conf`](./deploy/nginx.conf).
   Do not expose the database port publicly.

To stop the app without deleting data:

```bash
docker compose down
```

Do **not** use `docker compose down -v` unless you intentionally want to
delete the PostgreSQL volume and all data in it.

## Option B: Node.js and system PostgreSQL

1. Create an empty PostgreSQL database and set `DATABASE_URL`.
2. Install the source dependencies:

   ```bash
   npm ci
   ```

3. Create a private `.env` file from `.env.example` and set at least:

   ```dotenv
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
   SESSION_SECRET=use-a-long-random-secret
   SETTINGS_ENCRYPTION_KEY=use-a-different-long-random-secret
   ADMIN_EMAILS=your-real-admin-email@example.com
   OWNER_EMAILS=your-real-owner-email@example.com
   PORT=5000
   ```

4. Initialize the schema and validate the source:

   ```bash
   npm run db:push
   npm run check
   npm run build
   ```

5. Run the production server under systemd, PM2, or another supervisor:

   ```bash
   npm run start
   ```

   Configure the supervisor to restart the process after failure and start it
   automatically after a reboot. Keep the reverse proxy and database separate
   from the Node process.

## Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string for app data and sessions |
| `SESSION_SECRET` | Yes in production | Signs login-session cookies; never use the development fallback |
| `SETTINGS_ENCRYPTION_KEY` | Yes for provider secrets | Encrypts API secrets stored by the admin integration settings |
| `ADMIN_EMAILS` | Yes for bootstrap | Comma-separated admin email addresses |
| `OWNER_EMAILS` | Yes for owner controls | Comma-separated owner email addresses allowed to manage admins and workers |
| `PORT` | Optional | HTTP port; defaults to `5000` |
| `PLISIO_PUBLIC_APP_URL` | Crypto only | The exact public HTTPS origin used for crypto return links and callbacks |
| `PLISIO_API_KEY` | Crypto only | Plisio secret key; can also be entered through the admin integrations page |
| `PLISIO_API_BASE_URL` | Crypto only | Plisio API base URL; normally the official default |

Keep `SESSION_SECRET` and `SETTINGS_ENCRYPTION_KEY` stable after deployment.
Changing either can invalidate sessions or make previously encrypted provider
settings unreadable. Store them in the host's secret manager, not in Git or
the archive.

## Admin and first-run setup

Set both `ADMIN_EMAILS` and `OWNER_EMAILS` before registering the first
administrator account. New accounts using `ADMIN_EMAILS` receive the admin
role, and an existing account is promoted when it logs in with a matching
address. `OWNER_EMAILS` controls the separate permission to manage admins and
workers. The portable startup contains no hidden privileged identities or
environment-specific automatic promotions.

After signing in as an administrator:

1. Add products, variants, and stock.
2. Configure manual payment handles and payment toggles.
3. Configure Plisio and enable currencies only if crypto is wanted.
4. Create a test redeem code and remove or disable it after testing.

## Payment callbacks

Manual CashApp, Venmo, Chime, and Zelle flows require the administrator's
payment details and manual confirmation workflow. They do not become
connected merely because the app is hosted.

For Plisio crypto checkout, the public site must be reachable over HTTPS and
the provider must be able to reach:

```text
https://your-domain.example/api/webhooks/plisio?json=true
```

Set the public app URL in the environment or admin integration settings, add
the Plisio secret, and verify a small test payment before accepting real
payments. If the provider is not configured, the app intentionally reports
crypto as unavailable instead of pretending it is ready.

## Data migration and backups

The source archive contains no users, balances, orders, stock, uploaded
database images, or sessions. To move existing data, make a deliberate
PostgreSQL backup and restore it into the new database using your database
provider's secure transfer process. For a command-line PostgreSQL transfer,
the shape is:

```bash
pg_dump --format=custom --no-owner --no-acl "$SOURCE_DATABASE_URL" > backup.dump
pg_restore --clean --if-exists --no-owner --no-acl \
  --dbname="$TARGET_DATABASE_URL" backup.dump
```

Treat the dump as highly sensitive. Delete temporary dumps after confirming
the restore and take regular encrypted backups of the new database. Never put a
dump, `.env`, API key, or stock export into the website archive.

## Verification checklist

Run these checks on the real HTTPS hostname, not only on localhost:

- `GET /api/health` returns `{ "ok": true }`.
- A new user can register, log in, refresh, and remain logged in.
- A deliberately wrong password is rejected and rate limiting responds safely.
- An administrator email receives admin access; a normal email does not.
- A product, variant, and one test stock item can be created.
- A wallet/redeem-code purchase updates the balance and creates a transaction.
- A test order delivers only the stock attached to that order.
- A manual-payment order remains pending until an admin confirms it.
- Refund and support actions are restricted to the intended admin workflow.
- Plisio checkout is tested only after its key, HTTPS URL, currencies, and
  callback are configured.
- Restarting the app does not lose users, sessions, orders, or stock.
- PostgreSQL backups can be restored to a separate test database.
- The reverse proxy sends `Host`, `X-Forwarded-Proto`, and upgrade headers.

## What will and will not work automatically

The marketplace, authentication, PostgreSQL sessions, stock fulfillment,
wallet, games, admin pages, and manual payment workflow are included in the
application and can run on a properly configured host.

No source package can automatically provide your database contents, domain,
TLS certificate, payment account, payment credentials, provider webhook
permissions, backups, or third-party uptime. Those are the parts that must be
created and verified on your hosting provider before calling the site
production-ready.