# Storage model

C1 Trainer uses Dexie over IndexedDB. Persisted dates are ISO 8601 UTC strings; the FSRS adapter converts them to `Date` only at its boundary.

Database `c1-trainer` is currently schema version 3:

| Store | Authority | Purpose |
| --- | --- | --- |
| `attempts` | historical | append-only AttemptEvents |
| `attemptKeys` | index | atomic attempt idempotency lookup |
| `reviewEvents` | historical | append-only ReviewEvents |
| `reviewKeys` | index | atomic review idempotency lookup |
| `reviewCards` | projection | materialized rebuildable FSRS cards |
| `meta` | metadata | schema marker |

Version 3 adds review stores and does not alter or delete Phase 5 attempts. The migration backfills review idempotency keys if any exist. `replaceReviewCards()` clears only the materialized card projection before writing the rebuilt set.

`clearLearningData()` clears attempts, review events, and review-card projections. Theme preferences live in Zustand/local storage and are intentionally outside this action.
