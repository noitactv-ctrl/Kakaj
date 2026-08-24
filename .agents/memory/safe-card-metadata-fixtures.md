---
name: Safe card metadata fixtures
description: Metadata-only card fixtures are intentionally separated from purchasable card stock.
---

Card metadata fixtures accept and retain only BIN, type, state, city, and ZIP. They are an Admin-only tracking tool and must never enter card delivery, purchase, checkout, or fulfillment paths.

**Why:** The user approved this as the safe alternative to weakening the existing credential-based card-stock validator.

**How to apply:** Keep fixture storage and APIs separate from cards. Reject any fixture input that is not exactly the five metadata fields, and use only synthetic metadata in examples.