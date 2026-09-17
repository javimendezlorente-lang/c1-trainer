# Repository instructions

## Source of truth

- `docs/CAMBRIDGE_SPEC.md` is the authority for exam-format claims.
- `docs/CONTENT_SCHEMA.md` is the authority for the content model.
- `docs/PRODUCT_SPEC.md` defines the current product boundary.
- If a requirement is absent or ambiguous, stop and record the decision in the relevant specification before implementing it.

## Non-negotiable rules

- Never invent or silently change Cambridge exam rules.
- Never change the content schema without an explicit specification update and migration note.
- Do not reproduce copyrighted Cambridge examination material or substantial source text.
- Every feature requires automated tests appropriate to its risk.
- Every published content item must pass schema, structural, grading, and duplicate checks.
- Keep grading independent from React components and presentation state.
- Keep v1 client-only: no backend, accounts, payments, server database, or runtime AI unless explicitly authorised.
- Mobile-first is the default; keyboard and desktop use must remain functional.
- Prefer small, reviewable changes. Update `docs/ROADMAP.md` when a milestone changes.

## Quality gates

Before merging a change:

1. Run formatting, type checking, unit tests, and content validation.
2. Confirm that existing user data remains readable or provide a migration.
3. Confirm that new exam-format claims cite the official Cambridge source in `docs/CAMBRIDGE_SPEC.md`.
4. Confirm that the offline build still loads the app shell and approved content.

## Content review

Generated content is a candidate, never an approved item. A human reviewer must be able to inspect the answer, distractors, explanation, tags, and provenance before an item moves to `approved/`.

