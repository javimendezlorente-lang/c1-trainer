# `open-spaced-repetition/ts-fsrs` audit

Audit snapshot: 2026-09-17  
Audited commit: `c8ca282edc3fe1cdfa1c24912437938b63a25cb3` (`ci: align PR preview deployment lifecycle (#501)`)  
Repository: <https://github.com/open-spaced-repetition/ts-fsrs>

## Executive finding

Use the published `ts-fsrs` package for scheduling once the Error Bank exists. Do not implement FSRS ourselves and do not add the optional optimizer/binding package to the browser app.

## License and package evidence

- `packages/fsrs/package.json` identifies package version 5.4.2 and MIT licensing.
- The repository root contains the MIT license notice.
- The package exports ESM, CommonJS, and UMD builds and documents browser use.
- The audited README requires Node.js 20 or newer for the repository’s package workflow. The final app’s browser compatibility must be tested against the built bundle, not inferred solely from the development runtime requirement.

## Relevant API surface

The package documents `createEmptyCard`, `fsrs`, and `Rating`, with `repeat()` for previewing outcomes and `next()` for applying a selected rating. It also exposes retrievability, rollback/forget, rescheduling, and state helpers.

## Proposed integration

1. Give each reviewable Error Bank concept a stable local card ID, independent of the exercise ID when the same collocation or transformation is tested by multiple items.
2. Store the serializable FSRS card state and review log in IndexedDB through the project storage boundary.
3. Map the product’s review outcomes to FSRS ratings in one adapter, with tests for every mapping.
4. Call `next()` only after a completed learner review; use `repeat()` only for an explicit scheduling preview.
5. Keep the scheduler version and parameter set in the database schema so future migrations are possible.
6. Start with the library defaults and a small pilot. Do not train custom parameters from insufficient personal data.

## Risks

- FSRS schedules memory review; it does not decide whether a learner’s answer is linguistically correct. Grading remains a separate concern.
- A question-level Error Bank and a concept-level SRS card are different grains and must not be conflated.
- Date/time and timezone handling can change due dates; test around daylight-saving transitions and offline resume.
- Library upgrades can alter scheduling behavior. Pin the dependency and record upgrade notes.
- The package’s optional native/WASI optimizer is unnecessary for the v0.1 browser bundle.

## Recommendation

**REUSE `ts-fsrs` as a small, isolated scheduling dependency after tracking is stable.** Preserve MIT attribution and keep all product-specific mapping and persistence in C1 Trainer code.

