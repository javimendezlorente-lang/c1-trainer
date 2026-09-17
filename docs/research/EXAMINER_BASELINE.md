# Inherited `examiner` baseline

Baseline captured in the C1 Trainer workspace before any product-functionality deletion or rebranding.

## Source

- Repository: <https://github.com/dhanak/examiner>
- Upstream commit: `df862f7fcc8f82271bfc53f54396a86c599eb861`
- Foundation import: React/Vite source, configuration, tests, public assets, and GitHub Pages workflow.
- Installation environment: Node `v24.19.0`; `pnpm` `v11.19.0` because `npm` is not exposed in this environment.
- The imported repository provides `package-lock.json` but no `pnpm-lock.yaml`; the baseline install used `pnpm install --lockfile=false --ignore-scripts`.

## Results

| Check | Command | Result |
| --- | --- | --- |
| Tests | `pnpm exec vitest run` | **PASS** — 21 test files, 192 tests |
| Production build | `pnpm run build` | **PASS** — Vite production bundle generated |
| ESLint | `pnpm run lint` | **FAIL** — 6 errors, listed below |

## Inherited ESLint failures

All six failures were present before C1 Trainer changes:

- `src/components/FillBlanks.jsx:446`: synchronous state update in an effect (`setWord` and related exercise state).
- `src/components/FillBlanks.jsx:462`: synchronous state update in an effect (`setWord` and related exercise state).
- `src/components/FillBlanks.jsx:477`: synchronous `setFeedback` in an effect.
- `src/components/MatchPairs.jsx:148`: synchronous state updates in an effect while generating pairs.
- `src/components/MatchPairs.jsx:162`: synchronous `setAnimateSlide` in an effect.
- `src/components/MatchPairs.jsx:339`: reading `itemsAreNewRef.current` during render.

The baseline is not lint-clean. These errors must not be attributed to C1 Trainer cleanup unless a later change touches the affected code. The cleanup may remove the corresponding generic components and tests; it must not silently claim to have fixed these errors.

