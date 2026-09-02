---
name: BIN lookup completeness
description: Reliability rules for issuer and card-type metadata from multiple BIN providers.
---

Treat a BIN lookup as complete only when it contains both issuer and card type. Normalize provider-specific field names into one internal shape before caching, storing, or displaying the result.

**Why:** A partial response was cached for 24 hours and prevented a later provider retry from filling the missing field. Refresh matching also failed when stored card numbers used formatting characters.

**How to apply:** Long-cache only complete issuer-and-type results, retry incomplete results on the short miss interval, support legacy/provider field variants, and match refresh updates against normalized card digits.