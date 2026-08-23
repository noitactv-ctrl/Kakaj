---
name: Plisio currency binding
description: Currency-integrity rule for Plisio invoices that may be created or reconciled asynchronously.
---

Every invoice must retain the requested catalog code, and provider-originated currency identifiers must match it before the app binds an external transaction or settles a payment. A provider mismatch is non-settleable and needs explicit manual/provider resolution.

**Why:** An invoice can be created even when its response is unexpected or lost. Matching only by merchant order number could otherwise credit a different provider currency under the customer’s requested label.

**How to apply:** Validate the invoice response before displaying it, require the same currency when binding intents from signed callbacks or operation reconciliation, and keep mismatches outside automatic settlement.