---
name: Bulk card bundle pricing
description: Rules for the fixed-size discounted card bundle across payment methods.
---

A bulk card bundle is exactly 20 unique available cards, priced at 50% of each card's server-side price. It cannot be combined with product items, coupons, or rank discounts. Every purchased card must be recorded as its own order with a unique public order ID; never group multiple cards into one order, including bulk purchases.

**Why:** The client only carries card identifiers and display estimates. Recalculating availability and prices on the server keeps the special offer consistent and prevents cart or request tampering. Separate orders make each card independently visible, supportable, and refundable.

**How to apply:** Keep the exact-card-count, uniqueness, availability, and effective-price checks in every checkout path that can create a card order. After settlement, create one order and one order item per card while preserving the exact combined discounted total.