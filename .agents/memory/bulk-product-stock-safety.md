---
name: Bulk product stock safety
description: Safety rule for generic product inventory imports.
---

Generic bulk product stock accepts one item per line or blank-line-separated multi-line items, but must reject payment-card credential data on every stock insertion path.

**Why:** Product-stock import is a broad delivery-content path. Allowing it to accept card records would bypass the dedicated inventory safeguards and retain unnecessary sensitive payment data.

**How to apply:** Keep validation in the shared storage layer so both the regular and bulk stock APIs enforce it. Preserve duplicate skipping and return actionable import errors to the admin UI.