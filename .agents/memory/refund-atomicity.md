---
name: Refund atomicity
description: Consistency requirements for order refunds
---

A refund must claim the order exactly once and update its status, wallet balance, ledger entry, and inventory cleanup in one database transaction.

**Why:** Concurrent admin actions or an intermediate database failure can otherwise issue duplicate credits or leave an order and its inventory in conflicting states.

**How to apply:** Use a conditional state update inside the transaction before mutating related rows, and perform all related writes through the same transaction executor.