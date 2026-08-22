---
name: Bulk card bundle pricing
description: Rules for the fixed-size discounted card bundle across payment methods.
---

A bulk card bundle is exactly 20 unique available cards, priced at 50% of each card's server-side price. It cannot be combined with product items, coupons, or rank discounts.

**Why:** The client only carries card identifiers and display estimates. Recalculating availability and prices on the server keeps the special offer consistent and prevents cart or request tampering.

**How to apply:** Keep the exact-card-count, uniqueness, availability, and effective-price checks in every checkout path that can create a card order, including wallet and pending external-payment flows.