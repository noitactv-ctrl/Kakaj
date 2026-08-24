---
name: Card inventory metadata
description: The operational metadata prioritized for card inventory tracking and display.
---

Card inventory should prioritize BIN, type, state, city, and ZIP as its operational metadata. Cardholder names must remain excluded from persisted, listed, and delivered details.

**Why:** These fields support stock categorization and filtering without retaining a holder identity.

**How to apply:** Keep metadata derived server-side and surface it in both Admin stock views and the card catalog. Do not reintroduce raw holder names to metadata, preview, or delivery output.

Cards lacking complete public BIN metadata (issuer, brand, type, country name, and two-letter country code) must not be created or displayed.

**Why:** Placeholder catalog rows misrepresent inventory when the BIN provider cannot identify the card.

**How to apply:** Validate normalized BIN data before inserting, store it atomically with the card, and apply the same completeness rule to customer listings, admin base views, and stock counts.