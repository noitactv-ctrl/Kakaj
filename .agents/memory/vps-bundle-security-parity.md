---
name: VPS bundle security parity
description: Security and dependency parity rules for the standalone self-hosting export.
---

Keep the standalone VPS export aligned with the main application whenever dependency security or hosting guidance changes.

**Why:** The export is independently consumable and is included in workspace-wide security review; an outdated export manifest or lock can retain vulnerable versions even after the main app is fixed.

**How to apply:** Update the export manifest and self-hosting instructions in the same change, then run the dependency audit across the whole workspace before shipping.