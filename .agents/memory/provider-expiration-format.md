---
name: Provider expiration format
description: Crypto invoice expiration values may arrive as numeric timestamps, numeric strings, or date strings.
---

Treat the provider's invoice expiration field as an untrusted timestamp format and normalize numeric and date-string representations before sending it to the client.

**Why:** A valid expiration can be omitted if parsing assumes the provider always serializes the UTC expiry as a JSON number.

**How to apply:** Normalize the expiry at the provider boundary, then let the payment UI display the resulting absolute time in the user's local timezone.