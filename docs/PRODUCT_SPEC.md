# Product specification

Status: Phase 8.5 product reset approved; Writing paused

## Product goal

C1 Trainer is a practically inexhaustible personal Cambridge C1 training engine. It helps one learner practise Reading and Use of English in short, repeatable sessions and should answer: **what should I practise now, and why?**

The primary action is **New exercise**. The product must not imply that the learner can reach the end of a small digital workbook.

## Target user

A self-directed C1 Advanced learner using an iPhone as the primary device and a desktop or iPad as a secondary device. The current product is single-user and local-first; online generation is an optional content-supply capability, not the authority for learning history.

## Current implemented foundation

- Installable mobile PWA with offline app shell and bundled content.
- Reading and Use of English Parts 1–8 with canonical schemas and deterministic graders.
- Append-only `AttemptEvent` and `ReviewEvent` ledgers in IndexedDB.
- Rebuildable Error Bank, Progress and FSRS review projections.
- Versioned local backup/merge restore of historical ledgers.
- Twenty-four bundled exercises used primarily for regression, reference and eligible offline fallback.

## Phase 8.5 in scope

- Cambridge calibration profiles and hard quality gates for Parts 1–8.
- A secure server-side generation service using the OpenAI Responses API and canonical structured output.
- Part 1-first generation planner, critic, semantic validation and novelty validation.
- Separate generated-content, generation-history and novelty-fingerprint storage.
- A configurable local ready pool, initially targeting three items per part when that part is enabled.
- Online replenishment with explicit offline fallback behavior.
- Learner-oriented Home, Practice, Review and Progress experiences with no exposed internal IDs.
- Local learner issue reporting and quality telemetry.
- Preservation of all existing event-sourced learning and backup guarantees.

The normative implementation contract is [PHASE_8_5_SPEC.md](PHASE_8_5_SPEC.md). Calibration profiles are under [`docs/calibration/`](calibration/README.md).

## Explicitly out of scope during Phase 8.5

- Writing implementation until the dynamic Reading and Use of English model passes its gates.
- User accounts, cloud history sync, payments or social features.
- Browser-held OpenAI credentials or direct browser-to-OpenAI calls.
- Arbitrary user prompts sent to the generation endpoint.
- Listening audio, Speaking recording, pronunciation analysis and AI writing assessment.
- Cambridge score prediction or claims of official exam equivalence.
- Copyrighted Cambridge past-paper reproduction.
- Simultaneous rollout of all eight dynamic generators before Part 1 quality is proven.

## Product principles

1. **Quality is conjunctive:** one critical failure rejects the exercise even when its average quality score is high.
2. **Validation before exposure:** no raw model output reaches a learner.
3. **Practically inexhaustible, deliberately varied:** novelty is planned and checked, not left to randomness.
4. **Historical truth remains local and durable:** generated content does not weaken the event ledgers.
5. **Human language in the UI:** IDs, storage concepts and projection mechanics belong in diagnostics, not normal study.
6. **Offline honesty:** cached/fallback study works offline; new generation does not pretend to.
7. **Specification before implementation:** Cambridge rules, internal targets, security and migrations are written first.

## Success criteria for Phase 8.5

- `New exercise` can supply validated Part 1 exercises without exposing a finite catalogue.
- A real 20-candidate Part 1 run demonstrates acceptable ambiguity, difficulty, length and novelty behavior before expansion.
- The API secret is absent from source, browser storage and production frontend artifacts.
- Generated exercises pass canonical schema, semantic, critic and novelty gates.
- Ready-pool consumption, replenishment and offline fallback are tested.
- Learners never see internal IDs in normal Practice, Review or Progress views.
- Attempts on generated and bundled exercises produce the same durable, replayable learning events.
- Existing backup 1.x data remains readable.
- The deployed PWA still supports offline attempts, Review, Progress and backup for locally available content.

## Metrics boundary

Accuracy and marks are internal learning metrics, not Cambridge grades. Empirical benchmark ranges are calibration targets derived from public samples, not official Cambridge rules. Generation quality and model telemetry are operational diagnostics and are not shown as learner performance.
