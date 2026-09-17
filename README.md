# C1 Trainer

Mobile-first Progressive Web App for deliberate practice of Cambridge C1 Advanced English.

This repository starts with the product and engineering contract. The first implementation milestone is a small, stable offline shell followed by validated Reading and Use of English practice.

## Scope of the first release

- C1 Advanced Reading and Use of English Parts 1–4.
- Original, reviewable exercises; no copied Cambridge examination material.
- Automatic marking, explanations, attempt history, statistics, Error Bank, and local spaced review.
- React + TypeScript + Vite + PWA, with browser-local persistence and no backend.

Read [AGENTS.md](AGENTS.md) before making changes. The normative product documents are in [`docs/`](docs/).

## Planned delivery

1. PWA shell and mobile navigation.
2. Canonical content schema and validator.
3. Part 1 multiple-choice cloze.
4. Error Bank and statistics.
5. Parts 2–4 and their dedicated graders.

The current repository intentionally contains specifications only; implementation begins after the contract is reviewed.

