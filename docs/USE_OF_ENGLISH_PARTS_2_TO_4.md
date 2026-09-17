# Use of English Parts 2–4

Phase 7 completes the local vertical slices for Open Cloze, Word Formation, and Key Word Transformation. The approved corpus contains three original exercises per part: 24 Part 2/3 items and 18 Part 4 items, in addition to the three existing Part 1 exercises (90 items total).

`gradeExercise(exercise, answers)` is pure and deterministic. It never mutates content or answers and never uses fuzzy matching, an LLM, or a network service. Parts 2 and 3 accept one trimmed lexical token case-insensitively from the approved answer set. Part 4 requires 3–6 words plus the unchanged keyword, awards 2 marks for a full approved transformation, and awards 1 only for an explicit `scoring.units[].acceptedAnswers` match. `correct` is true only for 2/2.

The event boundary is shared by all four parts: approved content → pure grader → `createAttemptEvent` → append-only IndexedDB → rebuildable Error Bank, Progress, ReviewCards, and due queue. The event stores a generic answer observation (`choice`, `text`, or `transformation`) and an immutable answer/grade snapshot. Existing Part 1 events and version 1.x backups remain valid.

Progress reports both full-correct question accuracy and mark accuracy, so a 1/2 transformation is not presented as fully correct. Part 4 review cards retain the original sentence, keyword, second sentence, and canonical transformation; review teaches the transformation rather than exposing a previous score.

All four parts use the production PWA shell and local persistence. Text controls have explicit labels, disable browser correction/spellcheck, and expose results through semantic headings and live score text. The Part 4 partial-credit units are an internal machine-evaluation policy, not an official Cambridge marking key.
