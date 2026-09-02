---
name: BIN lookup completeness
description: Reliability rules for issuer and card-type metadata from multiple BIN providers.
---

Treat a BIN lookup as complete only when it contains both issuer and card type. Normalize provider-specific field names into one internal shape before caching, storing, or displaying the result. Make three full provider attempts; if both fields still cannot be verified, flag the card `NON`.

**Why:** A partial response was cached for 24 hours and prevented a later provider retry from filling the missing field. Refresh matching also failed when stored card numbers used formatting characters.

**How to apply:** Long-cache only complete issuer-and-type results, run up to three provider rounds, support legacy/provider field variants, and match refresh updates against normalized card digits. Limit concurrent BIN work to a small provider-safe pool. `NON` cards stay visible to admins but must be hidden from buyers and blocked in every purchase path.