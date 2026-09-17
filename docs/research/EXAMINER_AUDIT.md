# `dhanak/examiner` audit

Audit snapshot: 2026-09-17  
Audited commit: `df862f7fcc8f82271bfc53f54396a86c599eb861` (`chore: fix build warnings`)  
Repository: <https://github.com/dhanak/examiner>

## Executive finding

Use this repository as the technical starting point, preferably by forking it and stripping it down. It already supplies the React/Vite application shell, hash routing, Zustand patterns, responsive CSS, reusable practice controls, and a substantial test harness. It does **not** supply a CAE content model, a CAE grader, an Error Bank, a real IndexedDB repository, or explicit PWA support.

## License

The repository contains a root `LICENSE` file with the MIT License and copyright notice for David Hanak. Any copied or adapted code must retain the notice and license text. Dependency licenses must be inventoried separately.

## Observed stack and structure

- React 19.2, Vite 7.2, React Router 6.28, Zustand 5, Recharts, and Vitest.
- `src/App.jsx` owns the header and routes; `src/main.jsx` uses `HashRouter`.
- Existing routes are dashboard, vocabulary, and practice.
- Existing components include `MultipleChoice`, `FillBlanks`, `MatchPairs`, `FlipCard`, `FlipCardDeck`, and practice controls.
- Existing stores cover practice settings/statistics, vocabulary progress/mistakes, theme, and language.
- Tests cover app routing, themes, pages, stores, utilities, and the practice components.
- `vite.config.js` sets a GitHub Pages-style base path (`/examiner/`) and a jsdom/Vitest configuration.

## What is reusable

## Module classification

| Module / component | Classification | Audit conclusion |
| --- | --- | --- |
| `src/main.jsx` and Vite entry | KEEP/ADAPT | Keep the entry pattern; adapt the router/base path for the new Pages site. |
| `src/App.jsx` | ADAPT | Keep shell composition; replace language controls and generic routes with C1 routes. |
| `src/pages/Dashboard.jsx` | ADAPT | Keep layout ideas; replace vocabulary metrics with internal C1 practice metrics. |
| `src/pages/Practice.jsx` | ADAPT | Keep page/session composition; route to content-backed CAE parts. |
| `src/pages/VocabularyPractice.jsx` | REMOVE from v0.1 | Generic vocabulary mode is not the C1 core. |
| `src/components/MultipleChoice.*` | ADAPT | Reuse control styling/interaction, replace question generation and grading flow. |
| `src/components/FillBlanks.*` | ADAPT | Reuse interaction ideas only; current generator is vocabulary-specific. |
| `src/components/FlipCard*`, `MatchPairs*` | REMOVE/DEFER | Not needed for the first CAE milestones. |
| `src/store/practiceStore.js` | ADAPT/REPLACE | Keep UI settings patterns; replace flat counters and vocabulary assumptions. |
| `src/store/vocabularyStore.js` | REMOVE/REPLACE | Replace with Error Bank and storage repositories. |
| `src/store/themeStore.js` | KEEP/ADAPT | Keep preference pattern; retain only small settings in localStorage. |
| `src/store/languageStore.js` and `src/i18n/*` | REMOVE from C1 core | Remove German/Hungarian/Goethe scope; add only required UI copy. |
| `src/utils/*` vocabulary/inflections/TTS | REMOVE from C1 core | Not relevant to content-driven CAE tasks. |
| `src/data/*` vocabulary JSON | REMOVE from C1 corpus | Do not treat generic vocabulary data as original CAE content. |
| `src/**/*.test.*` and Vitest setup | KEEP/EXTEND | Preserve test conventions and add domain/content/PWA coverage. |
| `vite.config.js`, ESLint, package scripts | KEEP/ADAPT | Reuse tooling; add PWA, TypeScript, and content-validation commands. |
| `dexie-react-hooks` dependency | REPLACE/VERIFY | No source import was found; choose and configure a real IndexedDB layer deliberately. |

### Keep

- Vite build and test configuration as a baseline.
- React application composition and CSS variable theme approach.
- Hash-based routing pattern, subject to a C1 Trainer route redesign.
- Vitest + Testing Library setup and the existing regression-test style.
- Generic button, card, loading, and empty-state patterns after accessibility review.

### Adapt

- `MultipleChoice.jsx`: keep the option-selection interaction, but replace vocabulary generation with a content-driven Part 1 renderer. It needs explicit submit/check state, answer changes before submission, explanations, and an attempt event.
- `FillBlanks.jsx`: use only as an interaction reference for Part 2/3. Its current implementation generates blanks from vocabulary examples and contains language-specific heuristics; it is not a CAE open-cloze or word-formation grader.
- `practiceStore.js`: split ephemeral session/UI state from durable learning records. Move attempts and Error Bank data behind an IndexedDB repository.
- `Dashboard.jsx` and chart patterns: rebuild around “what to practise now”, with internal practice metrics clearly labelled as non-official.
- CSS and layout: retain useful responsive primitives, but apply the mobile-first UI contract in `docs/UI_SPEC.md`.
- JavaScript modules: migrate progressively to TypeScript only where domain contracts and graders benefit from it; do not create a broad rewrite before tests exist.

### Remove from the C1 core

- German/English target-language switching, Hungarian translation assumptions, Goethe references, and language-specific i18n strings.
- Vocabulary JSON, inflection precomputation, text-to-speech, and generic vocabulary/matching modes from the first CAE milestone.
- Vocabulary-specific `learnedWords`/`mistakeWords` state as the Error Bank model.

### Replace

- The practice domain with versioned C1 activity schemas.
- Stringly or component-local answer logic with pure graders in `src/grading/`.
- Zustand persistence for substantive history with Dexie/IndexedDB; keep Zustand for UI/session state and small preferences.
- Missing manifest, service worker, and installability checks with an explicit PWA layer.

## Important limitations and risks

1. The source is JavaScript/JSX, not TypeScript. A full conversion would create unnecessary risk; introduce typed boundaries around new domain code first.
2. `dexie-react-hooks` appears in `package.json`, but static inspection found no source import of Dexie or IndexedDB. It should not be treated as an existing database layer.
3. The current `MultipleChoice` grades immediately when an option is clicked and generates random vocabulary distractors. That interaction cannot be copied as-is for a CAE passage.
4. Existing persisted state is shaped for vocabulary learning. A migration plan is required before users create real C1 history.
5. `vite.config.js` has a base path but no PWA plugin or service-worker configuration.
6. GitHub Pages deployment is represented by the base path and README workflow claims, but must be re-established in the new repository’s CI.

## Verification run

In the audit clone, `pnpm install --no-frozen-lockfile --ignore-scripts` was required because the environment had no `npm` executable and the repository has no `pnpm-lock.yaml`. With the resolved dependencies:

- Vitest: **21 test files passed; 192 tests passed**.
- Vite production build: **passed**.
- ESLint: **failed with 6 existing errors**, all in `FillBlanks.jsx` and `MatchPairs.jsx` for synchronous state updates in effects and ref access during render.

These results establish that the upstream interaction/test surface is usable, but the baseline is not lint-clean and should be recorded before any C1 adaptation.

## Recommendation

**REUSE the application skeleton; ADAPT selected UI/test patterns; REMOVE the generic language-learning domain; REPLACE persistence, content, grading, and PWA layers.** Preserve MIT attribution in the resulting repository. Do not copy vocabulary data as C1 content.
