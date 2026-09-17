# Implementation plan

This plan follows the audit decision. Phase 6.5 adds local versioned backup/restore on top of the Phase 6 ledgers while keeping cloud sync, adaptive selection, and later parts out of scope.

## Milestone 0 — Baseline the foundation

**Goal:** create a reproducible starting point from the audited `examiner` snapshot.

Acceptance criteria:

- A fork/branch is created from the selected upstream commit and records the source URL and commit.
- Original upstream tests, lint, and production build run in CI and their baseline status is recorded.
- MIT attribution is retained in `LICENSES/THIRD-PARTY.md`.
- No C1 behavior or content has been added yet.

Status: complete. See [`research/EXAMINER_BASELINE.md`](research/EXAMINER_BASELINE.md) and commit `cd24f02`.

## Milestone 1 — Strip generic language-learning scope

**Goal:** convert the shell to C1 Advanced navigation without changing the grader contract.

Acceptance criteria:

- German, Hungarian, Goethe, translation-direction, TTS, and vocabulary-only navigation are removed or isolated from the C1 core.
- Home, Use of English, Error Bank, Statistics, and Settings routes have explicit empty states.
- Existing and new route tests pass.

Status: complete. The shell now exposes Home, Practice, Review, Progress, and Settings only.

## Milestone 2 — Canonical domain and versioned content schema

**Goal:** define one validated, versioned contract for every future exercise, grader, content generator, Error Bank record, and renderer.

Acceptance criteria:

- Draft 2020-12 schemas are split into shared metadata plus Part 1–4 schemas and a discriminated union.
- Domain-only TypeScript types mirror the JSON contract without migrating the React shell.
- Controlled skills, provenance, difficulty, stable IDs, and schema-version policy are documented.
- A single scoring definition derives 56 questions and 78 marks.
- Structural AJV validation is separate from semantic validation and is covered by original fixtures and tests.
- Part 4 explicitly uses 3–6 words including the unchanged keyword.

Status: complete. See [`CONTENT_SCHEMA.md`](CONTENT_SCHEMA.md), [`DOMAIN_MODEL.md`](DOMAIN_MODEL.md), [`CAMBRIDGE_RULES.md`](CAMBRIDGE_RULES.md), and `scripts/validate-content.mjs`.

## Milestone 3 — Foundation contracts and PWA

**Goal:** establish installable offline shell infrastructure without adding exercise behavior.

Acceptance criteria:

- `schemas/c1/v1/` and TypeScript domain types remain unchanged and continue to validate.
- `vite-plugin-pwa` uses `generateSW` with automatic update behavior.
- Manifest, neutral icons, service worker, standalone display, and GitHub Pages subpath configuration are generated.
- Production preview and a repeatable desktop offline acceptance test are documented.
- The workflow validates tests, lint, TypeScript, content, and build, and deploys only from `master`.

Status: complete. See [`PWA_TEST_PLAN.md`](PWA_TEST_PLAN.md).

## Milestone 4 — Part 1 engine

**Goal:** deliver one complete, deterministic multiple-choice cloze flow.

Acceptance criteria:

- Part 1 renders an original validated passage with exactly eight gaps and four options per gap.
- Learners can select/change answers, submit once, see raw marks, correct answers, and explanations.
- Grading is pure and unit tested, including empty and malformed responses.
- No content is bundled unless it passes the validator and has review metadata.

Status: complete. The selector, three-exercise approved corpus, local-only session flow, pure grader, and results feedback are implemented under `src/content/`, `src/grading/`, and `src/features/part1/`.

## Milestone 5 — Attempts, Error Bank, and statistics

**Goal:** make learning history durable and inspectable.

Acceptance criteria:

- Each response stores item ID, timestamp, selected answer, result, marks, skills, and explanation reference.
- Incorrect responses can enter the Error Bank without duplicating the same concept record.
- Part/tag accuracy is derived from stored events and labelled as internal practice data.
- Submission is idempotent by stable session key and cannot duplicate an AttemptEvent.
- Error Bank and Progress/skill profile are pure projections that can be rebuilt from the complete event history.
- IndexedDB has an explicit versioned migration with regression coverage.

Status: complete. See [`ATTEMPT_EVENT_IMPLEMENTATION.md`](ATTEMPT_EVENT_IMPLEMENTATION.md).

## Milestone 6 — FSRS scheduling and review sessions

**Goal:** schedule deliberate review of Error Bank items while preserving historical AttemptEvents and adding an append-only ReviewEvent ledger.

Acceptance criteria:

- `ts-fsrs` 5.4.2 is isolated behind a serializable ISO-date adapter with library defaults and no optimizer.
- ReviewEvents are idempotent and contain auditable before/after card snapshots.
- Due ReviewCards are deterministic, touch-friendly, offline, and rebuildable after deleting the materialized projection.
- Practice correctness remains separate from explicit Again/Hard/Good/Easy memory ratings.
- IndexedDB v3 preserves Phase 5 attempts and adds review stores.

Status: complete. See [`FSRS_MODEL.md`](FSRS_MODEL.md), [`REVIEW_EVENT.md`](REVIEW_EVENT.md), and [`REVIEW_SESSION.md`](REVIEW_SESSION.md).

## Milestone 6.5 — Versioned backup and restore

**Goal:** make the two historical ledgers portable without backing up or trusting derived projections.

Acceptance criteria:

- A versioned JSON envelope contains only AttemptEvents, ReviewEvents, and minimal metadata.
- Export is pure until the browser download boundary and uses a deterministic filename.
- Import validates the complete file before writing, previews a merge, detects immutable conflicts, and uses a transactional IndexedDB commit.
- Duplicate imports are idempotent and successful restore rebuilds all projections and ReviewCards.
- Settings exposes explicit export, import confirmation, and reset controls without changing theme preferences.

Status: complete. See [`BACKUP_FORMAT.md`](BACKUP_FORMAT.md) and [`BACKUP_RESTORE.md`](BACKUP_RESTORE.md).

## Milestone 7 — Parts 2 and 3

**Goal:** add open cloze and word formation with dedicated contracts.

Acceptance criteria:

- Eight gaps per activity, one-word enforcement for Part 2, and root-word transformation enforcement for Part 3.
- Accepted-answer and spelling policies are explicit and tested.
- Feedback explains grammar/morphology without claiming official Cambridge scoring beyond the documented raw marks.

Status: complete. Parts 2 and 3 ship with three approved original exercises each, deterministic graders, generic AttemptEvents, rebuildable learning projections, review cards, backup compatibility, and offline UI.

## Milestone 8 — Part 4

**Goal:** add key word transformations with defensible marking.

Acceptance criteria:

- Six items, immutable keyword, 3–6 words, and multiple accepted answers are represented in content.
- Partial-credit rules are documented before implementation and covered by tests.
- The grader never relies on exact-string equality alone and never silently invents semantic equivalence.

Status: complete. Part 4 ships with three approved original exercises, explicit full/partial accepted-answer units, mark-aware analytics, transformation review snapshots, and mixed-history backup regression coverage.

## Milestone 8.1 — Reading Parts 5–8

**Goal:** complete the Reading section’s remaining Cambridge task types over the existing event, review and backup contracts.

Acceptance criteria:

- Three original approved exercises per Part 5–8 pass structural and semantic validation.
- Dedicated renderers support multiple choice, cross-text matching, gapped text and multiple matching on mobile and desktop.
- Pure graders use official raw mark weights and stable target IDs; Part 7 enforces one use per paragraph and one extra paragraph.
- Mixed Parts 1–8 AttemptEvents rebuild Error Bank, Progress and FSRS cards and round-trip through the existing backup envelope.

Status: complete. The corpus contains 24 exercises and 168 scored items. Writing, Listening, Speaking, cloud sync, adaptive recommendations and FSRS parameter optimization remain out of scope.

## Milestone 9 — Adaptive practice

**Goal:** schedule review of errors and concepts.

Acceptance criteria:

- `ts-fsrs` is pinned, attributed, and isolated behind an adapter.
- Review-card grain is distinct from question-attempt grain.
- Again/Hard/Good/Easy mapping is documented and tested.
- Selection weights and “why this item was chosen” are deterministic and visible enough to debug.

## Milestone 10 — Content scale and QA

**Goal:** expand only after the pipeline is trusted.

Acceptance criteria:

- Candidate → schema validation → rule checks → review → approved workflow is documented.
- Duplicate, option-balance, explanation, ambiguity, and originality checks run in CI.
- A human review record exists for every approved item.

## Later milestones

Writing, exam simulation, Listening, Speaking, and optional AI evaluation each require their own Cambridge verification, content/licensing, privacy, and acceptance criteria. They do not block the current offline Reading and Use of English practice core.
