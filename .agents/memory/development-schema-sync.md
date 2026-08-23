---
name: Development schema sync
description: How to handle interactive schema-push rename prompts safely in this project.
---

When the schema-push tool proposes renaming an unrelated existing table to a newly declared table, do not accept the rename. Create only the intended new development table, and keep the matching Drizzle declaration as the source of truth for the publish-time schema diff.

**Why:** Automatic rename detection can suggest unrelated names. Accepting that suggestion would risk changing or repurposing existing application data.

**How to apply:** Review every rename prompt before confirming. For a truly new model, use the explicit create-table choice or safe development DDL when the interactive selector cannot be completed, then rely on the declared schema during Publish.