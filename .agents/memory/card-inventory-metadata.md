---
name: Card inventory metadata
description: The operational metadata prioritized for card inventory tracking and display.
---

Every valid card inventory item should track its six-digit BIN and must include a valid US state and five-digit ZIP at stock-entry time; accept either a state abbreviation or full name, then normalize to the two-letter code. Posted state and ZIP remain the source of location details; provider enrichment is optional. Card type filters must be generated from returned BIN types, including PREPAID and future values.

**Why:** BIN tracking supports stock categorization without blocking valid inventory when a public lookup provider lacks complete issuer metadata.

**How to apply:** Reject dedicated card-stock entries that are missing a valid state or ZIP, but never reject or hide an otherwise valid card solely because provider metadata is incomplete. Normalize posted full state names to abbreviations, normalize provider type values for display, generate filters from loaded inventory, preserve posted location metadata during BIN refresh, and make manual refresh force BIN rechecks and reshuffle once per click.

Use HandyAPI as the primary keyless BIN source and BinList as fallback. Refresh runs as a tracked background job so the UI can report actual percentage completion.

**Why:** HandyAPI returned issuer and funding type for BINs that were incomplete in the previous single-provider flow; fallback coverage and visible progress make bulk rechecks more dependable.