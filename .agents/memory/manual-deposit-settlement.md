---
name: Manual deposit settlement
description: Rules for safely approving or rejecting manual payment top-ups.
---

Manual CashApp, Chime, Venmo, and Zelle top-ups must settle only through pending, zero-item orders. Approval and rejection must each make a conditional state transition in a database transaction; approval creates the balance credit and ledger records within that same transaction.

**Why:** Admin decisions can be retried or race each other. Without a pending-state claim, the same payment can credit more than once or a credited balance can be relabeled unpaid.

**How to apply:** When adding a manual provider or admin action, include it in the shared manual-provider lifecycle and history queries. Route CashApp orders with any items—including card-only orders—to normal product fulfillment rather than wallet-deposit settlement.