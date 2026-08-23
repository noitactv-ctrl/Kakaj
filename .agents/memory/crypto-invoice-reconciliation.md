---
name: Crypto invoice reconciliation
description: Safety rule for hosted crypto invoices when provider requests or callbacks are delayed.
---

Treat a lost or timed-out invoice-creation response as ambiguous, not failed. Persist a local payment intent before contacting the provider, retain it until a verified provider operation or callback settles it, and make retries idempotent.

**Why:** A provider can create an invoice before its response is lost. Deleting the local record or releasing the order based only on a local timeout can turn a valid paid callback into an uncredited deposit or an unfulfilled order.

**How to apply:** Bind a recovered provider transaction and settle it atomically with the payment status change. Reconciliation must remain retryable through process restarts and must never use an incomplete provider listing as proof that an invoice does not exist.