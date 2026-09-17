# Error Bank

The Error Bank is a question-level projection of AttemptEvent history. An item enters it after at least one incorrect response and is identified by `exerciseId:questionId`. A later correct practice answer changes the status to `cleared`, but does not erase the record or its review card.

Error Bank status and FSRS card state are separate concepts. Every error item is eligible for an initial review immediately; no random or adaptive selection is applied in Phase 6. Recovered items remain visible for browsing and their ReviewCard history is retained until learning data is explicitly reset.

`rebuildErrorBank()` is pure and deterministic. It is not an authority and may be replaced by a materialized cache without changing the historical ledger.
