# Roadmap

## Delivery rules

Each milestone must be independently testable and deployable. Do not begin a later milestone while the current milestone has conceptual bugs in its contracts or grading.

## Milestones

| Version | Scope | Exit criteria |
| --- | --- | --- |
| v0.1 | PWA shell | Installable shell, responsive navigation, offline app-shell smoke test |
| v0.2 | Part 1 | Deterministic multiple-choice cloze UI, grader, feedback, tests |
| v0.3 | Error Bank + stats | Attempts persist locally; error records and internal accuracy are derived correctly |
| v0.4 | Parts 2–4 | Dedicated content models and graders; accepted-answer tests |
| v0.5 | Adaptive practice + SRS | Transparent selection policy and review scheduling with tests |
| v0.6 | Content expansion | At least 500 approved questions/items, all validated and reviewed |
| v0.7 | Reading Parts 5–8 | Mobile long-text UX and format-specific graders |
| v0.8 | Writing | Prompt, editor, word count, timer, draft history; no runtime AI required |
| v0.9 | Exam simulation | Timed multi-part session and summary, subject to format verification |
| v1.0 | C1 Trainer core | Stable Parts 1–8, Writing, offline learning data, quality documentation |
| v1.x | Listening / Speaking / optional AI | Separate privacy, licensing, audio, and evaluation specifications required |

## Current checkpoint

- [x] Initial product boundary written.
- [x] Cambridge-format contract written and linked to official sources.
- [x] Canonical content contract drafted and validated for Parts 1–4.
- [x] Proposed architecture and mobile UI contract written.
- [x] Reference repositories and licenses audited.
- [x] Reuse matrix and architecture decision written.
- [x] Implementation milestones and acceptance criteria written.
- [x] Review and approve the docs.
- [x] Fork/baseline the technical foundation and record the inherited checks.
- [x] Strip unrelated language-learning functionality and establish the C1 Trainer shell.
- [x] Define the canonical C1 exercise domain and versioned content schema.
- [x] Build the installable PWA shell and offline app-shell smoke test.
- [x] Implement a complete original Part 1 vertical slice with bundled content, deterministic grading, and results explanations.
- [ ] Design the attempt/event model and Error Bank persistence.
