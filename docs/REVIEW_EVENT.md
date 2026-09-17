# ReviewEvent

`ReviewEvent` is an immutable, append-only record of one deliberate spaced-repetition interaction. It is separate from `AttemptEvent`: a practice grader determines correctness, while the learner explicitly reports memory after seeing the reveal.

Each event stores its version, UUID event ID, unique idempotency key, stable card identity, exercise/question identity, ISO review timestamp, rating, previous card snapshot, resulting card snapshot, and optional source-attempt/skill metadata. The snapshots make the event auditable and preserve the historical scheduling result even if a future adapter changes.

Review submission follows this boundary:

```text
revealed card + explicit rating
  → applyReviewRating()
  → createReviewEvent()
  → appendReviewEvent() [idempotent]
  → rebuildReviewCards() and replaceReviewCards()
```

Retrying the same idempotency key returns the original event and creates no second event. ReviewEvents are never used to rewrite old AttemptEvents.
