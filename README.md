# C1 Trainer

Mobile-first browser application for deliberate practice of Cambridge C1 Advanced English, on the path to a full PWA.

This repository starts with the product and engineering contract. The implementation now has an installable shell, a canonical domain/content contract, a complete original Part 1 practice slice, and local FSRS-backed review sessions.

## Scope of the first release

- C1 Advanced Reading and Use of English Parts 1–4.
- Original, reviewable exercises; no copied Cambridge examination material.
- Automatic marking, explanations, attempt history, statistics, Error Bank, and local spaced review.
- React + Vite + Zustand, with no backend. Durable learning storage, Error Bank, progress projections, and offline review are implemented locally in IndexedDB.

## Current milestone

Phase 7 — Cambridge C1 Advanced Use of English Parts 1–4 is complete. The approved corpus contains 12 original exercises and 90 items; generic AttemptEvents, deterministic Part 2/3/4 graders, Error Bank, mark-aware Progress, FSRS review, and versioned backup/restore all work offline. Parts 5–8, Writing, Listening, Speaking, cloud sync, adaptive selection, and parameter optimization remain future milestones.

The project is a personal, non-commercial study tool. It is independent and is not affiliated with, endorsed by, or sponsored by Cambridge English or the University of Cambridge.

Read [AGENTS.md](AGENTS.md) before making changes. The normative product documents are in [`docs/`](docs/).

## Planned delivery

1. Transparent adaptive practice.
2. Optional cloud sync only after a separate privacy and conflict-resolution design.

## Development

```bash
npm install
npm test -- --run
npm run lint
npm run typecheck
npm run validate:content -- content/approved
npm run build
npm run verify:pwa
npm run preview -- --host 127.0.0.1
```

The production bundle is written to `dist/`. The PWA is configured for `https://USERNAME.github.io/c1-trainer/`; the local preview URL is `http://127.0.0.1:4173/c1-trainer/`. On iPhone Safari use **Share → Add to Home Screen**. After one successful online load, the shell, Parts 1–4 content, grading, explanations, review scheduling, backup/restore, and local IndexedDB history work offline where the browser supports service workers and IndexedDB. See [the Parts 2–4 implementation](docs/USE_OF_ENGLISH_PARTS_2_TO_4.md), [the PWA test plan](docs/PWA_TEST_PLAN.md), [the attempt-event implementation](docs/ATTEMPT_EVENT_IMPLEMENTATION.md), [the FSRS model](docs/FSRS_MODEL.md), [the review session](docs/REVIEW_SESSION.md), [the backup format](docs/BACKUP_FORMAT.md), [the backup/restore guide](docs/BACKUP_RESTORE.md), [AGENTS.md](AGENTS.md), and [the implementation plan](docs/IMPLEMENTATION_PLAN.md).
