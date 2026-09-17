# C1 Trainer

Mobile-first browser application for deliberate practice of Cambridge C1 Advanced English, on the path to a full PWA.

This repository starts with the product and engineering contract. The implementation now has an installable shell, a canonical domain/content contract, and a complete original Part 1 practice slice.

## Scope of the first release

- C1 Advanced Reading and Use of English Parts 1–4.
- Original, reviewable exercises; no copied Cambridge examination material.
- Automatic marking, explanations, attempt history, statistics, Error Bank, and local spaced review.
- React + Vite + Zustand, with no backend. Durable learning storage and exercise content are planned for later milestones.

## Current milestone

Phase 4 — Cambridge C1 Advanced Part 1 Vertical Slice is complete. Practice now bundles three original, validated Part 1 multiple-choice cloze exercises with local answer state, deterministic grading, explanations, and a results flow. Attempts are not persisted and Parts 2–8, Error Bank, and adaptive learning remain future milestones.

The project is a personal, non-commercial study tool. It is independent and is not affiliated with, endorsed by, or sponsored by Cambridge English or the University of Cambridge.

Read [AGENTS.md](AGENTS.md) before making changes. The normative product documents are in [`docs/`](docs/).

## Planned delivery

1. Attempt/event model, Error Bank, and statistics.
2. Parts 2–4 and their dedicated graders.
3. Adaptive practice and spaced review.

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

The production bundle is written to `dist/`. The PWA is configured for `https://USERNAME.github.io/c1-trainer/`; the local preview URL is `http://127.0.0.1:4173/c1-trainer/`. On iPhone Safari use **Share → Add to Home Screen**. After one successful online load, the current app shell, routes, theme, and static assets work offline; this does not imply that future exercise content is available offline. See [the PWA test plan](docs/PWA_TEST_PLAN.md), [AGENTS.md](AGENTS.md), [the implementation plan](docs/IMPLEMENTATION_PLAN.md), and [the audit record](docs/research/EXAMINER_BASELINE.md).
