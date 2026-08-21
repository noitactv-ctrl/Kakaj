# Foodplug Website Source

## Run locally

1. Install Node.js 20 or newer.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a PostgreSQL database and set its connection string:
   ```bash
   export DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   ```
4. Set a session secret:
   ```bash
   export SESSION_SECRET="replace-with-a-long-random-string"
   ```
5. Create/update the database schema:
   ```bash
   npm run db:push
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

The site will run on port 5000 by default.

## Build for production

```bash
npm run build
npm run start
```

## Included contents

This source export contains the React client, Express server, shared schema, project configuration, package manifests, and uploaded design assets.

## Not included

The export intentionally excludes installed dependencies (`node_modules`), generated build output, Git history, database contents, local caches, and secret environment files. Configure your own credentials and services before running the project.