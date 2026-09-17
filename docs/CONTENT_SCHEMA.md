# Content schema

## Philosophy

JSON Schema is the canonical external format for C1 Trainer content. Future content may be authored or generated outside the application, so it must be independently machine-validatable before it can be bundled. The application domain layer mirrors the validated shape but does not define a second runtime content format.

The current schemas use JSON Schema Draft 2020-12 and are split by responsibility:

```text
schemas/c1/v1/
├── shared.schema.json       # metadata, provenance, skills, cloze text
├── exercise.schema.json     # discriminated Part 1–8 union
├── part1.schema.json        # multiple-choice cloze
├── part2.schema.json        # open cloze
├── part3.schema.json        # word formation
├── part4.schema.json        # key word transformation
├── part5.schema.json        # multiple-choice reading
├── part6.schema.json        # cross-text multiple matching
├── part7.schema.json        # gapped text
└── part8.schema.json        # multiple matching
```

Every exercise has stable metadata: a semantic version, globally unique corpus ID, exam/paper, part/type, title, internal difficulty, topic, provenance, and controlled skills. Content does not contain UI preferences such as `inlineOptions`, React state, CSS concerns, or screen-size assumptions.

## IDs and provenance

Exercise IDs follow `c1-ruoe-p{part}-{six-digit-sequence}`, for example `c1-ruoe-p1-000001`. Question IDs are local to an exercise (`q1` … `q8` or `q6` for Part 4), while cloze gaps are local (`g1` … `g8`). Exercise IDs are the stable global identity used by future attempts, Error Bank records, and content review logs.

`source.kind` distinguishes `original_manual`, `original_ai`, and `imported_permitted`. `reviewStatus` distinguishes draft, review, approved, and rejected. Provenance stores metadata, not copied Cambridge text.

## Versioning and compatibility

The initial supported version is `1.0.0`. The validator rejects unsupported versions and unsupported major versions rather than silently parsing them.

- PATCH: documentation or non-breaking clarification.
- MINOR: backward-compatible optional fields.
- MAJOR: breaking content-format changes.

Each major version receives a separate schema directory. A future reader may support multiple majors explicitly, but it must never guess compatibility.

## Structural versus semantic validation

AJV validates JSON Schema structure. The semantic validator then checks constraints that are inconvenient or unsafe to express only in JSON Schema, including duplicate IDs, option-text uniqueness, answer membership, root/answer transformation, keyword preservation, Part 4's 3–6-word policy, reading target membership, and the Part 7 one-use/one-distractor rule.

Run validation with:

```bash
npm run validate:content -- content/approved
npm run validate:content -- tests/fixtures/content/valid
```

The command recursively visits JSON files, reports `STRUCTURAL` or `SEMANTIC`, includes the exact file path, and exits non-zero on failure. The invalid fixtures are intentionally excluded from the passing command and are exercised by automated tests.

## Minimal examples

Part 1 stores stable option IDs rather than treating array positions as answer truth:

```json
{
  "id": "q1",
  "gap": 1,
  "options": [
    { "id": "A", "text": "first" },
    { "id": "B", "text": "second" },
    { "id": "C", "text": "third" },
    { "id": "D", "text": "fourth" }
  ],
  "correctOptionId": "B",
  "explanation": "The second option fits the context."
}
```

Part 4 stores multiple accepted solutions and an optional, currently empty partial-credit extension:

```json
{
  "keyword": "HAVE",
  "secondSentence": "Lena {{answer}} the briefing.",
  "canonicalAnswer": "need not have attended",
  "acceptedAnswers": ["need not have attended"],
  "maxMarks": 2,
  "scoring": { "maxMarks": 2, "units": [] }
}
```

Fixtures under `tests/fixtures/content/` are original test infrastructure only. They are not a learner corpus and must not contain copied Cambridge sample-paper text.
