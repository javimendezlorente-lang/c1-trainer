# C1 Trainer

Mobile-first browser application for deliberate practice of Cambridge C1 Advanced English, on the path to a full PWA.

This repository starts with the product and engineering contract. The implementation now has an installable shell, a canonical domain/content contract, complete original Reading and Use of English Parts 1–8 practice, local FSRS-backed review sessions, and a separate authenticated Worker proof of concept for generating review-only Part 1 candidates.

## Scope of the first release

- C1 Advanced Reading and Use of English Parts 1–8.
- Original, reviewable exercises; no copied Cambridge examination material.
- Automatic marking, explanations, attempt history, statistics, Error Bank, and local spaced review.
- React + Vite + Zustand for the learner app. Durable learning storage, Error Bank, progress projections, and offline review remain local in IndexedDB. Dynamic generation is isolated in the optional Cloudflare Worker described in [`GENERATION_BACKEND.md`](docs/GENERATION_BACKEND.md); it is not required for offline study.

## Current milestone

Phase 8.5A is complete and 8.5B backend implementation is in progress. The approved corpus contains 24 original exercises and 168 scored items; dedicated deterministic reading graders, mixed Parts 1–8 AttemptEvents, rebuildable Error Bank/Progress/FSRS projections, and versioned backup/restore work offline. Writing remains frozen; the real five-candidate Part 1 generation report is still pending credentials.

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

The production bundle is written to `dist/`. The PWA is configured for `https://USERNAME.github.io/c1-trainer/`; the local preview URL is `http://127.0.0.1:4173/c1-trainer/`. On iPhone Safari use **Share → Add to Home Screen**. After one successful online load, the shell, Parts 1–8 content, grading, explanations, review scheduling, backup/restore, and local IndexedDB history work offline where the browser supports service workers and IndexedDB. See [Reading Parts 5–8](docs/READING_PARTS_5_TO_8.md), [Reading UX](docs/READING_UX.md), [the Parts 2–4 implementation](docs/USE_OF_ENGLISH_PARTS_2_TO_4.md), [the PWA test plan](docs/PWA_TEST_PLAN.md), [the attempt-event implementation](docs/ATTEMPT_EVENT_IMPLEMENTATION.md), [the FSRS model](docs/FSRS_MODEL.md), [the review session](docs/REVIEW_SESSION.md), [the backup format](docs/BACKUP_FORMAT.md), [the backup/restore guide](docs/BACKUP_RESTORE.md), [AGENTS.md](AGENTS.md), and [the implementation plan](docs/IMPLEMENTATION_PLAN.md).
