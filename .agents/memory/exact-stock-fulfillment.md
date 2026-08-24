---
name: Exact stock fulfillment
description: Rules for delivering assigned product and card inventory without substitution.
---

Product fulfillment must deliver only the stock item reserved for each order item, in order, and must never pull a replacement from general inventory when that assignment is missing.

**Why:** Substitution can deliver a different seller-supplied record. A later unavailable item must also not leave earlier claims consumed with an undelivered pending order.

**How to apply:** Keep stock/card claims, delivery-content creation, and the pending-to-delivering status change in one transaction. Treat any missing, sold, or cross-order assignment as a terminal fulfillment error that rolls the whole attempt back.