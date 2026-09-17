# AttemptEvent and learning projections

Phase 5 adds durable learning history without changing the Phase 4 content schema or `gradePart1` contract.

## Authority hierarchy

```text
Approved content  → truth of the exercise
AttemptEvent      → historical truth of the learner
Error Bank        → derived projection
Skill profile     → derived projection
Progress metrics  → derived projection
```

`AttemptEvent` is versioned independently from exercise content. A Part 1 event stores the exercise ID and schema version, idempotency key, event ID, timestamp, answer snapshot, grade snapshot, skills, and an explanation-reference map keyed by question ID. The grade snapshot is historical: later content edits cannot silently rewrite an old result.

## Application boundary

```text
gradePart1(exercise, answers)
        ↓
createAttemptEvent(...)
        ↓
AttemptRepository.append(event)
        ↓
rebuildLearningProjections(allEvents)
```

`src/application/part1Submission.ts` owns this orchestration. It first checks the idempotency key, so a retried submit returns the original event and grade. The grader remains a pure function and has no storage dependency.

## IndexedDB

`src/storage/attemptRepository.ts` uses a small Dexie adapter. The append-only `attempts` store is the historical source, while `attemptKeys` provides an atomic key-to-event lookup used for idempotence. Database version 3 adds append-only `reviewEvents`, `reviewKeys`, and materialized `reviewCards` without deleting old attempts. No projection is authoritative.

## Rebuildable projections

`src/learning/projections.ts` contains pure functions:

- `rebuildErrorBank(events)` groups responses by stable `exerciseId:questionId`, keeps counts and latest response state, and retains cleared records when a later answer is correct.
- `rebuildProgress(events)` derives attempts, questions, marks, accuracy, part totals, and a skill profile.
- `rebuildLearningProjections(events)` returns both projections from the same event list.

The UI pages under `src/features/learning/` read events and rebuild projections on load. A future materialized-cache optimization must preserve these functions as the recovery path.

## Current limits and next work

Review scheduling is documented in [`FSRS_MODEL.md`](FSRS_MODEL.md), [`REVIEW_EVENT.md`](REVIEW_EVENT.md), and [`REVIEW_SESSION.md`](REVIEW_SESSION.md). Export/import, adaptive selection, and multi-device sync remain future work.
