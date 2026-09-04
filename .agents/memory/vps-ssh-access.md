---
name: VPS SSH access
description: Remote VPS updates require an SSH key or other authorized access in the active workspace.
---

Remote deployment cannot be completed unless the active workspace has an authorized SSH identity for the VPS. When access is unavailable, prepare and present a code-only update archive with safe apply commands rather than attempting to handle credentials in chat.

**Why:** The VPS host may be reachable while rejecting the workspace because no accepted key or password is available.

**How to apply:** Check SSH access before promising a live VPS update; preserve the VPS `.env` and PostgreSQL volume during any later update.