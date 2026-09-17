# C1 Trainer

Mobile-first browser application for deliberate practice of Cambridge C1 Advanced English, on the path to a full PWA.

This repository starts with the product and engineering contract. The implementation now has an installable shell, a canonical domain/content contract, a complete original Part 1 practice slice, and local FSRS-backed review sessions.

## Scope of the first release

- C1 Advanced Reading and Use of English Parts 1–4.
- Original, reviewable exercises; no copied Cambridge examination material.
- Automatic marking, explanations, attempt history, statistics, Error Bank, and local spaced review.
- React + Vite + Zustand, with no backend. Durable learning storage, Error Bank, progress projections, and offline review are implemented locally in IndexedDB.

## Current milestone

Phase 6 — FSRS Scheduling and Review Sessions is complete. Part 1 submissions create idempotent AttemptEvents; deliberate ratings create idempotent ReviewEvents; Error Bank, Progress, ReviewCards, and the due queue are rebuildable projections. Parts 2–8, export/import, adaptive selection, and parameter optimization remain future milestones.

The project is a personal, non-commercial study tool. It is independent and is not affiliated with, endorsed by, or sponsored by Cambridge English or the University of Cambridge.

Read [AGENTS.md](AGENTS.md) before making changes. The normative product documents are in [`docs/`](docs/).

## Planned delivery

1. Versioned attempt export/import.
2. Parts 2–4 and their dedicated graders.
3. Transparent adaptive practice.

## Development

```bash
npm install
npm test -- --run
npm run lint
npm run typecheck
npm run validate:content -- content/approved/part1
npm run build
npm run verify:pwa
npm run preview -- --host 127.0.0.1
```

The production bundle is written to `dist/`. The PWA is configured for `https://USERNAME.github.io/c1-trainer/`; the local preview URL is `http://127.0.0.1:4173/c1-trainer/`. On iPhone Safari use **Share → Add to Home Screen**. After one successful online load, the shell, Part 1 content, grading, explanations, review scheduling, and local IndexedDB history work offline where the browser supports service workers and IndexedDB. See [the PWA test plan](docs/PWA_TEST_PLAN.md), [the Part 1 implementation](docs/PART1_IMPLEMENTATION.md), [the attempt-event implementation](docs/ATTEMPT_EVENT_IMPLEMENTATION.md), [the FSRS model](docs/FSRS_MODEL.md), [the review session](docs/REVIEW_SESSION.md), [AGENTS.md](AGENTS.md), and [the implementation plan](docs/IMPLEMENTATION_PLAN.md).
