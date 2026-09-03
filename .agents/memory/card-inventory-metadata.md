---
name: Card inventory metadata
description: The operational metadata prioritized for card inventory tracking and display.
---

Every valid card inventory item should track its six-digit BIN. Location is optional and country-aware: preserve posted regions and numeric or alphanumeric postal codes without imposing U.S.-only state or ZIP rules. Card type filters must be generated from returned BIN types, including PREPAID and future values.

**Why:** BIN tracking supports stock categorization without blocking valid inventory when a public lookup provider lacks complete issuer metadata.

**How to apply:** Do not reject dedicated card stock for missing or non-U.S. location fields. Normalize U.S. state names when recognizable, preserve international region/postal values when provided, normalize provider type values, and keep manual refresh behavior intact.

Use HandyAPI as the primary keyless BIN source and BinList as fallback. Refresh runs as a tracked background job so the UI can report actual percentage completion.

**Why:** HandyAPI returned issuer and funding type for BINs that were incomplete in the previous single-provider flow; fallback coverage and visible progress make bulk rechecks more dependable.