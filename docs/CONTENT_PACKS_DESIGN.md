# Content packs design

Phase 8.5D introduces an interface, not a downloader. The learner currently receives a static, bundled `ExerciseSource` through `ExerciseLibrary`; this is the offline authority and is available without a network.

## Stable boundary

```ts
interface ExerciseSource {
  list(part?: number): readonly ImplementedExercise[]
}
```

`ExerciseLibrary` owns eligibility and deterministic selection. A future pack source may be added behind this interface, but it must return the same canonical schema and must not bypass validation, provenance, duplicate checks, or human approval. The current app does not download packs and does not need a server to study.

## Pack metadata (future-compatible proposal)

An optional pack descriptor may contain `packId`, `version`, `createdAt`, `source`, `contentSchemaVersion`, `exerciseIds`, and `reviewStatus`. These are supply metadata, not learner-facing labels. They must be optional in backups so a 1.x backup from the current app remains importable.

## Selection contract

1. Exclude quarantined, rejected, draft and unapproved items.
2. Prefer unseen items.
3. Otherwise choose the least recently attempted eligible item.
4. Avoid immediate repeats when another eligible item exists.
5. Use an injectable seed/tie-breaker; never call ambient `Math.random()` in selection.

When a future pack is unavailable offline, the bundled source remains the fallback. A partial or unvalidated candidate is never shown as a practice exercise.
