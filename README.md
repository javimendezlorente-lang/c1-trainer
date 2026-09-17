# C1 Trainer

Mobile-first browser application for deliberate practice of Cambridge C1 Advanced English, on the path to a full PWA.

This repository starts with the product and engineering contract. The first implementation milestone is a small, stable offline shell followed by validated Reading and Use of English practice.

## Scope of the first release

- C1 Advanced Reading and Use of English Parts 1–4.
- Original, reviewable exercises; no copied Cambridge examination material.
- Automatic marking, explanations, attempt history, statistics, Error Bank, and local spaced review.
- React + Vite + Zustand, with no backend. Durable learning storage and exercise content are planned for later milestones.

## Current milestone

Phase 1 — Technical Foundation Baseline is complete. The app currently contains the rebranded mobile shell, five navigation destinations, light/dark theme support, GitHub Pages-compatible hash routing, and no learner content yet.

The project is a personal, non-commercial study tool. It is independent and is not affiliated with, endorsed by, or sponsored by Cambridge English or the University of Cambridge.

Read [AGENTS.md](AGENTS.md) before making changes. The normative product documents are in [`docs/`](docs/).

## Planned delivery

1. Canonical C1 exercise domain model and versioned content schema.
2. PWA shell and offline installability.
3. Part 1 multiple-choice cloze.
4. Error Bank and statistics.
5. Parts 2–4 and their dedicated graders.

## Development

```bash
npm install
npm test -- --run
npm run lint
npm run build
```

The production bundle is written to `dist/`. See [AGENTS.md](AGENTS.md), [the implementation plan](docs/IMPLEMENTATION_PLAN.md), and [the audit record](docs/research/EXAMINER_BASELINE.md) for repository rules and current technical debt.
