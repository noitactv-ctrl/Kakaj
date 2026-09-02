---
name: Card inventory metadata
description: The operational metadata prioritized for card inventory tracking and display.
---

Every valid card inventory item should track its six-digit BIN. Country, state, and ZIP supplied with the posted item remain the source of location details; provider enrichment is optional.

**Why:** BIN tracking supports stock categorization without blocking valid inventory when a public lookup provider lacks complete issuer metadata.

**How to apply:** Never reject or hide a valid card solely because provider metadata is incomplete. A manual refresh should force BIN rechecks and reshuffle the visible inventory once per click.