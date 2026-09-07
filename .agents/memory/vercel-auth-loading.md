---
name: Vercel auth loading
description: Serverless database startup failures can otherwise leave the SPA appearing blank while auth state is pending.
---

The Vercel entrypoint must bound external database connection time and the client must render a visible loading state while `/api/auth/me` initializes.

**Why:** A failed or unreachable hosted PostgreSQL connection can leave the auth query pending long enough that a null loading render looks like a black deployment, even though the static JavaScript bundle loaded correctly.

**How to apply:** Keep serverless database initialization retryable and time-bounded, and preserve a visible loading/error surface in the root router. Verify both the static bundle and `/api/health` after each Vercel deployment.