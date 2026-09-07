---
name: External npm lockfiles
description: Replit-generated npm lockfiles can contain private package-firewall paths that external builders cannot resolve.
---

When deploying outside Replit, do not assume a workspace-generated npm lockfile is externally fetchable. Validate that resolved tarball URLs are public; if they contain a private Replit firewall host/path, the external install must bypass or regenerate the lockfile from the public registry.

**Why:** External builders can fail before the application build with DNS errors for `package-firewall.replit.local`, even though installs and builds succeed inside Replit.

**How to apply:** Inspect lockfile resolved URLs before external deployment. Prefer a public-registry install strategy for the external builder, then run a real clean install outside the workspace before redeploying.