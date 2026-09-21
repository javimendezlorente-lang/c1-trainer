# UX/product reset — Phase 8.5D

The learner-facing product is a static, offline-first C1 trainer. Runtime generation, accounts, server storage and downloads are deliberately out of scope for this phase.

## Product decisions

- Practice starts from a part choice and says **Start practice**; it does not pretend that three bundled exercises form an infinite catalogue.
- Selection is eligible-only, unseen-first, then least recently attempted, while avoiding an immediate repeat where possible.
- Review shows learning context, answer/explanation and human labels; internal IDs and raw enum values are storage/debug concepts only.
- Practice performance (marks, accuracy, part comparison, skills and recent trend) is separate from memory review (due cards, ratings and dispositions).
- Mastered and archived are reversible dispositions over rebuildable learning projections; they never delete AttemptEvents or ReviewEvents.
- Settings backup remains merge-only and backward-compatible with existing 1.x backup envelopes.

## Scope boundary

The current 24-exercise corpus is a finite original fallback/regression corpus. It is not claimed to be official Cambridge material and no scale score is calculated. Future content packs may use the same `ExerciseSource` contract, but downloads are not implemented in 8.5D.
