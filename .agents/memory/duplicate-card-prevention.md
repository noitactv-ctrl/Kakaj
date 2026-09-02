---
name: Duplicate card prevention
description: Rules for preventing the same normalized payment card from entering stock or being sold more than once.
---

Treat card numbers that normalize to the same digit string as duplicates across both available inventory and sold history. Reject duplicate stock uploads and block every payment route when a duplicate group is unresolved.

**Why:** Different formatting can hide the same card number, and checking only row IDs allows duplicate inventory or concurrent purchases to sell the same underlying card.

**How to apply:** Serialize same-card stock inserts, claim sales atomically, and have manual refresh remove only duplicate rows that are unsold and unreferenced by any order. Never delete sold records or order-linked rows during duplicate cleanup.