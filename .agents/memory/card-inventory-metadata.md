---
name: Card inventory metadata
description: The operational metadata prioritized for card inventory tracking and display.
---

Every valid card inventory item should track its six-digit BIN. Country, state, and ZIP supplied with the posted item remain the source of location details; provider enrichment is optional. Card type filters must be generated from returned BIN types, including PREPAID and future values.

**Why:** BIN tracking supports stock categorization without blocking valid inventory when a public lookup provider lacks complete issuer metadata.

**How to apply:** Never reject or hide a valid card solely because provider metadata is incomplete. Normalize provider type values for display, generate filters from the loaded inventory, and make manual refresh force BIN rechecks and reshuffle once per click.