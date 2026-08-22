---
name: Retired provider compatibility
description: Non-destructive policy for removing third-party integrations.
---

Remove retired providers from application routes, UI, configuration, runtime jobs, and dependencies. Keep historical database columns and tables that record legacy payments or account links unless the user explicitly asks to purge that data.

**Why:** Historical orders and payment references may still need to be viewed or reconciled. Dropping legacy database structures as part of an integration cleanup risks unnecessary data loss.

**How to apply:** Rename application-level identifiers to the active provider where a legacy column must remain for compatibility, and make clear that any remaining legacy database names are inactive records rather than live integrations.