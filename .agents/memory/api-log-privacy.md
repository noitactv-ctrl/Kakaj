---
name: API log privacy
description: Privacy boundary for server request logging
---

API request logs may include method, path, status, and duration, but never serialized response bodies.

**Why:** Customer delivery responses and account data can be returned from authenticated endpoints. Logging those bodies creates an unnecessary sensitive-data copy in workflow and deployment logs.

**How to apply:** Keep request logging metadata-only. If debugging a response is necessary, log an explicitly reviewed, field-level summary with sensitive values removed.