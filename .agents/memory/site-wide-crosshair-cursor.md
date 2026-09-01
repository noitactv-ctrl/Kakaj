---
name: Site-wide crosshair cursor
description: The storefront uses one custom pixel crosshair cursor everywhere on fine-pointer devices.
---

The storefront should keep a single custom pixel crosshair cursor across the entire visible site, including log/product cards, links, buttons, selects, and nested descendants.

**Why:** A mixed arrow/hand/pointer treatment breaks the intended pixel-art website identity, and child cursor utilities can otherwise override the site cursor.

**How to apply:** When adding storefront UI, do not introduce a competing cursor style. If a component uses `cursor-pointer` or another cursor utility, ensure the site-wide cursor rule still wins.