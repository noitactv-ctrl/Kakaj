---
name: Provider secret storage
description: Security boundaries for administrator-managed provider URLs and credentials.
---

Provider credentials stored through the admin interface must be encrypted at rest with `SETTINGS_ENCRYPTION_KEY`, falling back to `SESSION_SECRET` only for self-hosting compatibility. Secret values are never returned to the browser; the UI receives configured state and a mask only.

**Why:** Self-hosters need to configure integrations through the site without copying credentials into source code, but a database-backed control plane must not turn credentials into client-visible settings or plaintext data.

**How to apply:** Resolve managed provider settings on the server at use time, retain documented environment variables only as fallback when no saved override exists, and reject legacy plaintext secrets until they can be encrypted. Provider URLs that receive credentials should be restricted to trusted HTTPS origins to prevent key forwarding or SSRF.