# Architecture

Status: Phase 6.5 implemented; see [ARCHITECTURE_DECISION.md](ARCHITECTURE_DECISION.md), [ATTEMPT_EVENT_IMPLEMENTATION.md](ATTEMPT_EVENT_IMPLEMENTATION.md), [FSRS_MODEL.md](FSRS_MODEL.md), and [BACKUP_RESTORE.md](BACKUP_RESTORE.md)

## Runtime shape

```text
React UI
  ↓
application state / session orchestration
  ↓
exam contracts + pure graders
  ↓
content catalogue + local persistence
  ↓
IndexedDB in the browser
```

The deployed artifact is a static PWA served by GitHub Pages. GitHub Actions runs validation, tests, and the production build. There is no permanent server in v0.1.

The implementation strategy is reuse-first with a license-first gate: the audited `examiner` shell is the preferred technical foundation, `ts-fsrs` is isolated behind the FSRS adapter, `cae-tutor` is a reviewed pedagogical reference, and unlicensed or GPL-covered application code is not part of the initial client.

## Proposed boundaries

```text
src/
  app/          routing, shell, session lifecycle
  components/   reusable presentational controls
  exam/         task models and session rules
  grading/      pure deterministic graders
  learning/     Error Bank, review scheduling, adaptive selection
  storage/      IndexedDB repository and migrations
  stats/        derived learning metrics
content/
  candidates/  generated or drafted items awaiting review
  approved/    published items only
  rejected/    retained for audit, never bundled
schemas/       JSON Schema and schema-related types
scripts/       validation and content build tooling
tests/         unit, integration, and content fixtures
```

## Data flow

1. The build reads only `content/approved/`.
2. Validation rejects malformed, ambiguous, duplicated, or incomplete content before build.
3. The app loads the approved catalogue into a session.
4. A pure grader returns marks, correctness, and feedback references.
5. `createAttemptEvent` snapshots the graded submission.
6. The append-only IndexedDB repository stores the AttemptEvent idempotently.
7. Error Bank and practice Progress are rebuilt from AttemptEvents.
8. ReviewEvents are appended after explicit ratings; ReviewCards and review Progress are rebuilt from both ledgers.

## Persistence

IndexedDB is the storage layer. AttemptEvents are versioned and migrated; the storage boundary allows a future sync implementation without coupling UI code to IndexedDB. Projections are never authoritative and must remain rebuildable.

Minimum stores:

- `attempts` and `attemptKeys`
- `reviewEvents` and `reviewKeys`
- `reviewCards` (materialized projection)
- `meta`

`AttemptEvent` and `ReviewEvent` are the historical authorities; card state is never the sole source of truth.

Backup/restore is local and application-level: export includes only the two historical ledgers; restore validates and merges them before rebuilding projections. There is no cloud sync or background backup.

No sensitive personal data is required for v0.1.

## Grading boundary

Graders are pure functions: same item plus same response produces the same result. UI code must not contain answer logic. Each grader has focused unit tests, including accepted variants and malformed inputs.

## Build and deployment

- Node tooling is used only in development and CI.
- CI runs typecheck, tests, content validation, and build.
- GitHub Pages serves the generated static files.
- The PWA manifest and service worker are required for the installable shell and offline cache.
