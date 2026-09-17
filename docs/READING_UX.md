# Reading UX

Reading Parts 5–8 use dedicated React renderers under `src/features/part5` through `src/features/part8`. The shared reading stylesheet supplies only layout and accessible controls; task semantics stay in each renderer.

The default layout is mobile-first. At narrow widths, passage/text cards and question forms stack vertically, controls retain touch-sized targets, Part 7 uses native selects rather than drag-only interaction, and the content uses `min-width: 0`/hidden overflow to avoid horizontal scrolling. At wider widths, the same regions can form a two-column reading layout.

Interaction rules:

- Part 5 uses labelled radio choices and shows correct option plus explanation after submit.
- Part 6 shows all four labelled texts before the matching questions.
- Part 7 shows the complete text with labelled gap selects and all seven paragraph options in accessible `details` cards.
- Part 8 shows labelled text sections followed by ten matching questions; target reuse is allowed.
- Every submit goes through the same `gradeExercise → createAttemptEvent → append → rebuild` application boundary.

The production acceptance target is a 390px-wide viewport with no horizontal scroll, readable text, keyboard/focus access, and a complete submit/results cycle offline after the PWA has cached the approved corpus. Automated gates cover the build, content, typecheck, lint, unit tests and PWA verification; device-level Safari installation remains a manual acceptance step.
