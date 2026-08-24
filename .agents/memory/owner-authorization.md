---
name: Owner authorization
description: Owner privileges are derived from the protected founder identity, not a staff-editable database field.
---

The owner is identified server-side from the protected founder identity and remains an admin for compatibility with existing operational authorization. Owner status is exposed only as a derived authenticated-user property.

**Why:** Treating ownership as a normal role would require updating many existing admin checks and could allow staff-management APIs to demote or otherwise mutate the owner.

**How to apply:** Keep owner detection on the server. Any route that changes staff roles or worker access must require the derived owner permission, and every user-account mutation path must reject attempts to alter the protected owner.