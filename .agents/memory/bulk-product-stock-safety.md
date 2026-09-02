---
name: Bulk product stock safety
description: Safety rule for generic product inventory imports.
---

Generic bulk product stock rejects payment-card credential data by default; an explicit admin setting can opt out when intentionally selling that content as generic stock.

**Why:** Product-stock import is a broad delivery-content path. The secure default prevents card records from bypassing dedicated inventory safeguards while preserving an intentional generic-stock opt-out.

**How to apply:** Keep validation in the shared storage layer so regular and bulk product-stock APIs enforce the setting. Dedicated card imports must not read this setting.