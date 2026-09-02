---
name: Bulk product stock safety
description: Safety rule for generic product inventory imports.
---

Generic bulk product stock rejects payment-card credential data by default. The same admin protection also requires complete BIN metadata for dedicated card imports; one explicit opt-out disables both checks.

**Why:** Product-stock import is a broad delivery-content path, and incomplete card metadata can hide imported cards. One secure-by-default control keeps these related import protections consistent while supporting an intentional opt-out.

**How to apply:** Keep product-stock validation in the shared storage layer and have card import/listing read the same setting. Preserve duplicate skipping and require explicit confirmation before disabling both protections.