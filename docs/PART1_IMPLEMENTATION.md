# Part 1 implementation

Phase 4 implements a complete Cambridge C1 Advanced Reading & Use of English Part 1 vertical slice: an original multiple-choice cloze passage, eight four-option questions, deterministic marking, explanations, and a mobile-friendly practice flow.

## Boundaries

- The approved corpus is static JSON under `content/approved/part1/`.
- Every file is checked by `scripts/content-validator.mjs` before it is eligible for bundling.
- `src/content/contentRepository.ts` uses Vite's eager static glob to load only approved Part 1 JSON at build time and exposes stable-ID lookup.
- `src/grading/part1Grader.ts` is a pure, React-independent function. It returns the exercise ID, score, maximum score, completion flag, and one result for each of the eight questions.
- `src/features/part1/` owns ephemeral answer state. On submit, the application boundary creates an AttemptEvent and appends it to IndexedDB; Error Bank and Progress are derived from the event history. There is no adaptive selection or FSRS integration yet.

## User flow

Practice opens the Part 1 selector. Starting an exercise renders the passage with visible `(1) ______`-style gaps and eight radio-button question cards. Answers may be selected or changed. Submit is allowed with unanswered questions and identifies the remaining count. Correct answers and explanations are rendered only after submission; retry resets the local session and Back to Part 1 returns to the selector.

## Adding approved content

1. Create an original JSON file in `content/approved/part1/` that follows `schemas/c1/v1/part1.schema.json`.
2. Use a new stable ID, exactly eight gaps and questions, four unique options per question, and an answer explanation for every question.
3. Include skill tags, internal difficulty, and `original_manual`/`approved` provenance.
4. Run `npm run validate:content -- content/approved/part1`.
5. Run tests, typecheck, lint, production build, and `npm run verify:pwa` before review.

The Vite build embeds the approved corpus in the application JavaScript, so the Part 1 selector, passages, answers, grader inputs, and explanations are available to the generated PWA cache after a successful online load and service-worker installation.

## Verification

The automated suite covers repository discovery and lookup, all-correct/all-wrong/mixed/unanswered/invalid answer grading, input immutability, and the browser flow from selection through retry. Manual production-preview acceptance should additionally confirm the flow at approximately 390 px wide and confirm no horizontal overflow.
