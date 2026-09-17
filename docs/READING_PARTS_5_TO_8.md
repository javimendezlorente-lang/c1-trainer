# Reading Parts 5–8

Phase 8 implements the Cambridge C1 Advanced Reading tasks without copying Cambridge examination content. Format claims were checked against Cambridge English's [official exam format](https://www.cambridgeenglish.org/exams-and-tests/qualifications/advanced/format/), [C1 Advanced Handbook](https://www.cambridgeenglish.org/images/167804-c1-advanced-handbook.pdf), and [preparation page](https://www.cambridgeenglish.org/exams-and-tests/qualifications/advanced/preparation/).

| Part | Task contract | Items | Raw marks |
| --- | --- | ---: | ---: |
| 5 | One text, four options per question | 6 | 12 |
| 6 | Four short texts, cross-text matching | 4 | 8 |
| 7 | One gapped text, six used paragraphs + one extra | 6 | 12 |
| 8 | One or more labelled text sections, multiple matching | 10 | 10 |

The corpus contains three original approved exercises per part. Stable IDs identify exercises, questions, text sections and Part 7 paragraph candidates. Part 7 answers cannot reuse a paragraph; Parts 6 and 8 allow a target text to be selected more than once, as required by their matching semantics.

Each grader is pure and deterministic. `gradeExercise(exercise, answers)` produces marks only; `createAttemptEvent()` enriches each result with the selected/correct target IDs, compact labels, prompt and (for Part 7) a bounded context snapshot. The event is appended idempotently to IndexedDB, then Error Bank, Progress and FSRS cards are rebuilt from the ledgers.

Backup format `1.x.x` and IndexedDB version 3 are unchanged. Export contains only AttemptEvents and ReviewEvents; restoring a mixed Parts 1–8 backup reconstructs the derived projections. No Cambridge scale conversion, adaptive recommendation, runtime AI or optimizer is included.

## QA policy

- Content must pass AJV plus semantic validation before bundling.
- Every exercise has `source.kind: original_manual` and `reviewStatus: approved`.
- Part 5 has six questions and four unique options per question.
- Part 6 has exactly four stable text targets and valid target IDs.
- Part 7 has six gaps, seven candidates, unique correct paragraph IDs and one unused candidate.
- Part 8 has ten questions and valid, reusable target IDs.
