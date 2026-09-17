# FSRS model

Phase 6 uses `ts-fsrs` `5.4.2` (MIT) behind `src/learning/fsrs/fsrsAdapter.ts`. The app uses scheduling only; the optional optimizer/binding package is not installed.

The adapter is the only production module that imports `ts-fsrs`. It maps the domain ratings `Again`, `Hard`, `Good`, and `Easy` to the library, calls `createEmptyCard()` for the first active error, and calls `next()` only after the learner explicitly rates a revealed item. `repeat()` is used only to preview the four outcomes.

Configuration is centralized and pinned: requested retention `0.9`, maximum interval `36500` days, short-term scheduling enabled, fuzzing disabled (the library default), and all other parameters from `generatorParameters()` defaults. This keeps offline replay deterministic.

The persisted `ReviewCardProjection` contains only storage-safe scalar fields and ISO dates. Its stable identity is `review-card:${exerciseId}:${questionId}`. It is a projection of AttemptEvent error identity plus ReviewEvent history, never historical truth.

Future parameter training may use the ReviewEvent ledger, but optimization is out of scope until there is enough reviewed data and a separate migration policy.
