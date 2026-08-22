---
name: Plinko transactional settlement
description: Wallet safety rule for server-settled Plinko wagers and payouts.
---

Settle every Plinko wager, its ledger entry, and any payout in one database transaction. The initial balance deduction must be conditional on the user having enough funds.

**Why:** Separate balance and transaction writes can leave a customer charged without the matching payout or ledger record if a later write fails. A conditional deduction also prevents concurrent plays from overspending a wallet.

**How to apply:** Keep the random result server-selected, then call one settlement operation that either returns the final stored balance or rejects the play for insufficient funds. Do not reintroduce client-side balance authority or split the game writes across independent calls.