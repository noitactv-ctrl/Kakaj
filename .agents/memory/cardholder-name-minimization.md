---
name: Cardholder-name minimization
description: Privacy rule for the legacy card stock workflow.
---

Cardholder names may be checked by the legacy stock validation gate, but must never be persisted in inventory or copied into fulfillment content.

**Why:** A holder name is unnecessary for inventory display or delivery and retaining it expands the sensitive data footprint.

**How to apply:** When changing card stock ingestion, listing, or order fulfillment, preserve name-free stored and returned details. Do not relax validation requirements to achieve this.