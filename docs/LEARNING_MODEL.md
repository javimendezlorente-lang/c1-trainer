# Learning model

The learning model has two historical ledgers and rebuildable projections:

```text
Approved content → grader → AttemptEvent → Error Bank / practice Progress
                              └──────────→ ReviewCard / review Progress
Review rating ───────────────→ ReviewEvent ─┘
```

`AttemptEvent` is the historical truth of normal practice and contains immutable answer and grade snapshots. `ReviewEvent` is the historical truth of a deliberate memory review and contains the explicit Again/Hard/Good/Easy rating plus before/after scheduling snapshots.

Error Bank, practice metrics, skill profile, ReviewCard state, and the due queue are projections. They can be deleted and rebuilt from AttemptEvents and ReviewEvents. A correct practice answer never silently becomes a Good review.

Practice accuracy and review activity are reported separately. ReviewEvents are not counted as normal exam-question attempts.
