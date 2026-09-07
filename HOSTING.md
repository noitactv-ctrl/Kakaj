# Self-hosting TurtleCC securely

This single guide runs the website on your own Linux server or VPS.
It does not copy the current Replit database or provider accounts. The
application code is portable, but the services around it belong to the host.

The recommended setup is Docker Compose behind Caddy or Nginx:

```text
Internet → HTTPS reverse proxy → 127.0.0.1:5000 → TurtleCC → private PostgreSQL
```

The Compose file binds the app to localhost and does not publish PostgreSQL.
Do not change those bindings unless you understand the firewall and database
security consequences.

## Upload the application bundle

From the project workspace, create a clean archive:

```bash
npm ci
npm run check
npm run package:vps
```

The command creates a file such as
`release/turtlecc-vps-20260907-185901.tar.gz`. The archive includes the source
and Docker deployment files. It deliberately excludes `.env` files, databases,
`node_modules`, `dist/`, the large optional `attached_assets/` reference
folder, Git history, Replit-only folders, and previously created archives.
Product images uploaded through the admin panel are stored in PostgreSQL and
move with the database backup, not with this source archive.

Copy it to the VPS with your own SSH account:

```bash
scp release/turtlecc-vps-*.tar.gz deploy@YOUR_VPS_IP:/tmp/
ssh deploy@YOUR_VPS_IP
sudo mkdir -p /opt/turtlecc
sudo tar -xzf /tmp/turtlecc-vps-*.tar.gz -C /opt/turtlecc
sudo chown -R "$USER":"$USER" /opt/turtlecc
cd /opt/turtlecc
```

If your VPS user does not have permission to write under `/opt`, extract into
`$HOME/turtlecc` instead. Never upload `.env`, database dumps, API keys, or
payment stock exports as part of the source archive.

## What you need

- Node.js 20 or newer, or Docker Engine with Compose
- PostgreSQL 16 or a compatible PostgreSQL service
- A domain name and HTTPS for production
- A process manager or Docker restart policy
- A secure place for environment variables and backups

## 1. Prepare an Ubuntu VPS

Use a current Ubuntu LTS or another supported Linux distribution. Log in as a
non-root administrator and update the server:

```bash
sudo apt update && sudo apt full-upgrade -y
sudo apt install -y ca-certificates curl git ufw unattended-upgrades
```

Allow SSH and web traffic, then enable the firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status verbose
```

Use SSH keys, disable password SSH login after confirming the key works, and
never expose PostgreSQL (`5432`) or the app port (`5000`) to the public
internet. Enable automatic security updates:

```bash
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

Point your DNS `A`/`AAAA` record at the VPS before requesting HTTPS.

The app uses PostgreSQL for marketplace data **and login sessions**. Use a
persistent database, not an ephemeral container or local temporary filesystem.

## Restoring optional reference assets

The self-hosting source archive intentionally does not include the large
`attached_assets/` reference folder. If you separately need those files for
development or design reference, extract an asset archive into the same
destination directory after extracting the source archive.

The application can build and start without those optional reference files.

## Option A: Docker Compose

1. Copy the safe template and edit it:

   ```bash
   cp .env.example .env
   ```

2. Generate unique secrets and set matching values in `.env`. Do not use the
   example values literally:

   ```dotenv
   POSTGRES_DB=nychq
   POSTGRES_USER=nychq_app
   POSTGRES_PASSWORD=use-a-unique-database-password
   DATABASE_URL=postgresql://nychq_app:use-a-unique-database-password@db:5432/nychq
   SESSION_SECRET=use-a-unique-random-secret-at-least-32-characters
   SETTINGS_ENCRYPTION_KEY=use-a-different-unique-random-secret-at-least-32-characters
   ADMIN_EMAILS=your-real-admin-email@example.com
   OWNER_EMAILS=your-real-owner-email@example.com
   PORT=5000
   ```

   Generate values without putting them in shell history:

   ```bash
   umask 077
   openssl rand -hex 32
   openssl rand -hex 32
   ```

   Keep `.env` readable only by its owner:

   ```bash
   chmod 600 .env
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

4. Put Caddy, Nginx, or another HTTPS reverse proxy in front of port `5000`.
   Do not expose the database port publicly.

### First deployment with Docker Compose

After extracting the bundle:

```bash
cd /opt/turtlecc
cp .env.example .env
chmod 600 .env
```

Edit `.env` and replace every placeholder. At minimum, set
`POSTGRES_PASSWORD`, `DATABASE_URL`, `SESSION_SECRET`, `SETTINGS_ENCRYPTION_KEY`,
`ADMIN_EMAILS`, `OWNER_EMAILS`, and `PORT`. For Compose, `DATABASE_URL` must use
the service hostname `db`, not `localhost`:

```dotenv
POSTGRES_DB=turtlecc
POSTGRES_USER=turtlecc_app
POSTGRES_PASSWORD=use-a-unique-password
DATABASE_URL=postgresql://turtlecc_app:use-a-unique-password@db:5432/turtlecc
SESSION_SECRET=use-a-long-random-secret
SETTINGS_ENCRYPTION_KEY=use-a-different-long-random-secret
ADMIN_EMAILS=you@example.com
OWNER_EMAILS=you@example.com
PORT=5000
```

Generate secrets on the VPS without putting them in shell history:

```bash
umask 077
openssl rand -hex 32
openssl rand -hex 32
```

Build, migrate, and start the application:

```bash
docker compose up -d --build
docker compose ps
curl -fsS http://127.0.0.1:5000/api/health
```

The health check should return JSON containing `"ok":true`. View startup logs
with `docker compose logs -f app`. Then configure Caddy or Nginx and verify the
public HTTPS URL before enabling crypto callbacks.

To stop the app without deleting data:

```bash
docker compose down
```

Do **not** use `docker compose down -v` unless you intentionally want to
delete the PostgreSQL volume and all data in it.

### HTTPS with Caddy

Install Caddy using its official repository instructions, then create a
`/etc/caddy/Caddyfile` entry like this:

```text
your-domain.example {
    reverse_proxy 127.0.0.1:5000
}
```

Reload Caddy:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy obtains and renews the certificate automatically. Confirm HTTPS before
enabling crypto callbacks. If you use Nginx instead, the complete proxy
headers are in `deploy/nginx.conf`; obtain a certificate with Certbot and
redirect HTTP to HTTPS.

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

For a new VPS, Docker Compose is safer and simpler because it pins the
PostgreSQL service and keeps the app/database network boundary explicit.

## Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string for app data and sessions |
| `SESSION_SECRET` | Yes in production | Signs login-session cookies; never use the development fallback |
| `SETTINGS_ENCRYPTION_KEY` | Yes for provider secrets | Encrypts API secrets stored by the admin integration settings |
| `ADMIN_EMAILS` | Yes for bootstrap | Comma-separated admin email addresses |
| `OWNER_EMAILS` | Yes for owner controls | Comma-separated owner email addresses allowed to manage admins and workers |
| `PORT` | Optional | HTTP port; defaults to `5000` |
| `CRON_SECRET` | Vercel only | Secret used to authorize the scheduled maintenance endpoint |
| `PLISIO_PUBLIC_APP_URL` | Crypto only | The exact public HTTPS origin used for crypto return links and callbacks |
| `PLISIO_API_KEY` | Crypto only | Plisio secret key; can also be entered through the admin integrations page |
| `PLISIO_API_BASE_URL` | Crypto only | Plisio API base URL; normally the official default |

Keep `SESSION_SECRET` and `SETTINGS_ENCRYPTION_KEY` stable after deployment.
Changing either can invalidate sessions or make previously encrypted provider
settings unreadable. Store them in the host's secret manager, not in Git or
the archive.

Never paste secrets into chat, commit them, put them in a browser field meant
for a public setting, or include them in a database dump. The admin UI stores
provider secrets encrypted, but the encryption key itself must remain private.

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

For the Docker database, create a compressed backup from the app directory:

```bash
docker compose exec -T db sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner --no-acl' \
  > "backup-$(date +%F).dump"
chmod 600 backup-*.dump
```

Copy backups to separate storage, encrypt them at rest, retain multiple
recovery points, and test restoring one to a separate database. A backup on
the same VPS is not enough protection against disk loss or compromise.

## Updating safely

From the app directory:

```bash
 # Upload and extract a newer turtlecc-vps-*.tar.gz first, then:
docker compose exec -T db sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner --no-acl' \
  > "backup-before-update-$(date +%F).dump"
docker compose up -d --build
docker compose ps
curl -fsS https://your-domain.example/api/health
```

Take a database backup before schema changes. Never run `docker compose down -v`
for a normal update; `-v` deletes the database volume. Preserve the VPS `.env`
when replacing the application directory; the uploaded bundle intentionally does
not contain it.

## Security checklist before going live

- [ ] Only ports 22, 80, and 443 are allowed by the VPS firewall.
- [ ] SSH keys work and password SSH login is disabled.
- [ ] `.env` is mode `600` and is not tracked by Git.
- [ ] `SESSION_SECRET` and `SETTINGS_ENCRYPTION_KEY` are unique, long, and stable.
- [ ] `POSTGRES_PASSWORD` is unique and the database is not publicly exposed.
- [ ] The app is reachable only through HTTPS in production.
- [ ] `ADMIN_EMAILS` and `OWNER_EMAILS` contain only intended accounts.
- [ ] The first administrator can log in and a normal account cannot access Admin.
- [ ] Crypto callbacks use the exact HTTPS URL and provider secret.
- [ ] A backup was created, copied off-host, and successfully test-restored.
- [ ] Test payment, order, refund, and stock-delivery flows were verified.
- [ ] Logs and monitoring do not contain passwords, tokens, payment secrets, or stock.

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