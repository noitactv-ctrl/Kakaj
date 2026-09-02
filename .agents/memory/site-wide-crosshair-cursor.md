---
name: Site cursor states
description: The storefront uses three established custom cursor states on fine-pointer devices.
---

The storefront has three established cursor states: the custom white pixel arrow for normal areas, the custom pixel hand for clickable controls, and the custom pixel text cursor for text-entry fields. Log/product tiles use the normal arrow.

**Why:** The established three-state cursor behavior is part of the website identity; forcing one cursor globally makes the site feel broken.

**How to apply:** Preserve the correct state by element type. Do not add broad descendant cursor overrides; use the normal arrow for clickable cards unless they contain a specific control.