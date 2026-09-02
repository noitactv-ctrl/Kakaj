---
name: Bulk product stock safety
description: Safety rule for generic product inventory imports.
---

Generic bulk product stock accepts one item per line or blank-line-separated multi-line items, and rejects payment-card credential data by default; an explicit admin setting can opt out when intentionally selling that content as generic stock.

**Why:** Product-stock import is a broad delivery-content path. The secure default prevents card records from bypassing dedicated inventory safeguards, while the admin opt-out supports an intentional generic-stock use case.

**How to apply:** Keep validation in the shared storage layer so both the regular and bulk stock APIs enforce the setting. Preserve duplicate skipping, return actionable import errors to the admin UI, and require an explicit confirmation before disabling protection.