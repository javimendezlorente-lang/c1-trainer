# Content schema

Status: normative v0.1 contract

## Design rules

- Content is data, not JSX or component code.
- Each activity has a stable ID and one task type.
- Answers and explanations are explicit and machine-checkable.
- `source: original` is required for all v0.1 approved items.
- Candidate content is isolated from approved content until reviewed.

## Common activity shape

```json
{
  "id": "C1-UOE-P1-0001",
  "level": "C1",
  "paper": "reading_use_of_english",
  "part": 1,
  "type": "multiple_choice_cloze",
  "title": "The psychology of waiting",
  "difficulty": 3,
  "source": "original",
  "tags": ["collocation", "lexical-precision"],
  "instructions": "For questions 1–8, choose the best answer.",
  "text": "...",
  "items": []
}
```

## Required common fields

| Field | Type | Rule |
| --- | --- | --- |
| `id` | string | Globally unique; `C1-UOE-P{1..4}-{4 digits}` for v0.1 |
| `level` | literal `C1` | Required |
| `paper` | literal `reading_and_use_of_english` | Required |
| `part` | integer 1–4 | Must match `type` |
| `type` | enum | One supported task type |
| `title` | string | Non-empty, original title |
| `difficulty` | integer 1–5 | Editorial estimate, not official Cambridge difficulty |
| `source` | literal `original` | Required in approved v0.1 content |
| `tags` | non-empty string array | Controlled vocabulary preferred |
| `instructions` | string | Non-empty |
| `text` | string | Original exercise text |
| `items` | array | Shape depends on task type |

## Part-specific rules

### Part 1: multiple-choice cloze

- Exactly 8 items.
- Exactly 4 non-empty options per item.
- Exactly one correct option, represented by zero-based `answerIndex`.
- Each item has a prompt marker that can be rendered in the text.
- Correct explanation is required; each distractor should have an explanation when it is pedagogically meaningful.

```json
{
  "number": 1,
  "options": ["raise", "cast", "place", "put"],
  "answerIndex": 1,
  "explanation": {
    "correct": "The fixed collocation is ...",
    "wrong": {
      "0": "...",
      "2": "...",
      "3": "..."
    }
  }
}
```

### Part 2: open cloze

- Exactly 8 items.
- One answer field per item.
- The learner response is one word only.
- `acceptedAnswers` supports orthographic variants only when they are genuinely equivalent.

### Part 3: word formation

- Exactly 8 items.
- Each item has one supplied `promptWord`.
- `acceptedAnswers` contains valid inflected or derived forms for the context.
- The validator must ensure the answer is derived from the prompt word according to the editorial answer record.

### Part 4: key word transformation

- Exactly 6 items.
- `keyword` is immutable and must appear in the learner-facing prompt.
- Accepted answers contain 3–6 whitespace-delimited words.
- Multiple legitimate answers may be stored.
- Marking must support partial credit up to 2 marks; exact partial-credit rules require a separate grading specification before implementation.

## Editorial metadata

Approved items should also contain `review`, with reviewer, reviewed date, and quality-check version. This metadata is not shown as learner content.

