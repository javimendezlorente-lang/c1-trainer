# Domain model

## Exercise hierarchy

The domain model is a UI-independent TypeScript mirror of the canonical JSON Schema. `Exercise` is a discriminated union of implemented exercise types:

```text
Exercise
├── Part1Exercise  multiple_choice_cloze
├── Part2Exercise  open_cloze
├── Part3Exercise  word_formation
├── Part4Exercise  key_word_transformation
├── Part5Exercise  multiple_choice_reading
├── Part6Exercise  cross_text_multiple_matching
├── Part7Exercise  gapped_text
└── Part8Exercise  multiple_matching
```

Parts 5–8 use stable target IDs for options, source texts, and paragraph candidates. The renderer may reorder or restyle targets without changing historical answers.

The base metadata is shared by every exercise: `schemaVersion`, stable `id`, `exam`, `paper`, `part`, `type`, `title`, `difficulty`, `topic`, `source`, and `skills`. The part-specific payload owns the text, gaps, options, answers, and explanations.

## TypeScript strategy

TypeScript is introduced only in `src/domain/`; the React shell remains JavaScript/JSX. JSON Schema remains the external source of truth. The TypeScript interfaces are a small compile-time mirror, checked with `tsc --noEmit`, while AJV and semantic tests enforce the runtime contract. A code-generation dependency was not added: the split schemas and the discriminated union are small enough that generated declarations would add noise without improving the boundary in this milestone. Any future schema change must update the corresponding types and fixtures in the same commit.

## Skills

Skills are controlled values, not arbitrary tags. The initial taxonomy is deliberately compact:

- Lexis: collocation, fixed expression, phrasal verb, idiom, semantic precision, complementation, dependent preposition.
- Grammar: article, auxiliary, modal, tense/aspect, pronoun, determiner, conjunction, relative clause, comparison, conditionals, inversion, passive, reporting structure, causative, concession, preposition.
- Word formation: prefix, negative prefix, suffix, compound, internal change, word class change.
- Discourse/reading: cohesion, coherence, reference, inference, attitude, tone, purpose, detail, main idea.

Each exercise declares one `primarySkill` and zero or more unique `secondarySkills`.

## Difficulty and provenance

Difficulty is internal ordinal calibration:

1. lower C1 / accessible
2. standard C1
3. standard-to-demanding C1
4. demanding C1
5. C1+ / borderline C2

It is not an official Cambridge classification. Provenance distinguishes original manual, original AI-assisted, and permitted imported material. Review status makes the candidate-to-approved workflow explicit.

## Scoring

`src/domain/scoring.ts` is the sole code definition of the Reading and Use of English structure. It derives totals of 56 questions and 78 marks. Part 4 carries up to two marks per question; the schema can carry optional `scoring.units` for future defensible partial-credit descriptions, but this milestone does not implement a grader or invent partial-credit rules.
