---
name: Telegram rep rewards
description: Durable security and accounting rules for the Telegram account-linking and 24-hour reward system.
---

Telegram account numbers are one-time, short-lived link credentials. A Telegram chat can link to only one site account, and rotating a number invalidates the previous number.

**Why:** Link numbers act as temporary authentication credentials. Reuse or cross-account linking could let another Telegram account claim a user's rewards.

**How to apply:** Consume link numbers transactionally, never expose bot secrets, and keep all bot configuration owner-only.

Telegram username, first-name, or last-name changes reset the 24-hour reward timer. A reward claim must update the wallet balance, claim timestamp, and transaction ledger in one database transaction.

**Why:** Profile changes alter reward eligibility, while non-atomic credits can create duplicate balance or incomplete ledger records during concurrent bot checks.

**How to apply:** Re-check the current profile signature and channel membership before a reward; use a conditional database claim so simultaneous polling and message checks can credit at most once per interval.