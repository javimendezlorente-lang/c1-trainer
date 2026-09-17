# Architecture

Status: v0.1 proposal; see [ARCHITECTURE_DECISION.md](ARCHITECTURE_DECISION.md) and the [reuse matrix](research/REUSE_MATRIX.md)

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

The implementation strategy is reuse-first with a license-first gate: the audited `examiner` shell is the preferred technical foundation, `ts-fsrs` is a later dependency, `cae-tutor` is a reviewed pedagogical reference, and unlicensed or GPL-covered application code is not part of the initial client.

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
5. The session writer stores an attempt and creates or updates Error Bank records.
6. Statistics and review queues are derived from local records.

## Persistence

IndexedDB is the planned storage layer. Records must be versioned and migrated. The storage boundary must allow a future sync implementation without coupling UI code to IndexedDB.

Minimum stores:

- `attempts`
- `itemResponses`
- `errorBank`
- `reviewSchedule`
- `settings`

No sensitive personal data is required for v0.1.

## Grading boundary

Graders are pure functions: same item plus same response produces the same result. UI code must not contain answer logic. Each grader has focused unit tests, including accepted variants and malformed inputs.

## Build and deployment

- Node tooling is used only in development and CI.
- CI runs typecheck, tests, content validation, and build.
- GitHub Pages serves the generated static files.
- The PWA manifest and service worker are required for the installable shell and offline cache.
