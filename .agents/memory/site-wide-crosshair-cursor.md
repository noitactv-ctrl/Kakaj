---
name: Site cursor states
description: The storefront uses three established custom cursor states on fine-pointer devices.
---

The storefront has three established cursor states: the custom white pixel arrow for normal areas, the custom pixel hand for clickable controls (including clickable cards), and the custom pixel text cursor for text-entry fields.

**Why:** The established three-state cursor behavior is part of the website identity; forcing one cursor globally makes the site feel broken.

**How to apply:** Preserve the correct state by element type. Use the hand for native or ARIA clickable controls and elements with the cursor-pointer utility, the text cursor for text entry, and the arrow for normal, default, or disabled areas.