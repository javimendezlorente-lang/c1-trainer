# C1 Trainer

Mobile-first browser application for deliberate practice of Cambridge C1 Advanced English, on the path to a full PWA.

This repository starts with the product and engineering contract. The implementation now has a small, stable shell plus the canonical domain and validation contract that will precede Reading and Use of English practice.

## Scope of the first release

- C1 Advanced Reading and Use of English Parts 1–4.
- Original, reviewable exercises; no copied Cambridge examination material.
- Automatic marking, explanations, attempt history, statistics, Error Bank, and local spaced review.
- React + Vite + Zustand, with no backend. Durable learning storage and exercise content are planned for later milestones.

## Current milestone

Phase 2 — Canonical C1 Exercise Domain Model + Versioned Content Schema is complete. The app still contains only the rebranded mobile shell, while the repository now defines and validates original Part 1–4 content contracts without bundling learner content.

The project is a personal, non-commercial study tool. It is independent and is not affiliated with, endorsed by, or sponsored by Cambridge English or the University of Cambridge.

Read [AGENTS.md](AGENTS.md) before making changes. The normative product documents are in [`docs/`](docs/).

## Planned delivery

1. PWA shell and offline installability.
2. Part 1 multiple-choice cloze.
3. Error Bank and statistics.
4. Parts 2–4 and their dedicated graders.

## Development

```bash
npm install
npm test -- --run
npm run lint
npm run typecheck
npm run validate:content -- tests/fixtures/content/valid
npm run build
```

The production bundle is written to `dist/`. See [AGENTS.md](AGENTS.md), [the implementation plan](docs/IMPLEMENTATION_PLAN.md), and [the audit record](docs/research/EXAMINER_BASELINE.md) for repository rules and current technical debt.
