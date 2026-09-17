# UI specification

Status: v0.1 proposal

## Interaction priorities

The primary device is an iPhone in portrait orientation. A learner should be able to start a practice session with one thumb, read comfortably, answer without accidental submission, and understand feedback immediately.

## Information architecture

```text
Home
├── Today's training
├── Use of English
│   ├── Part 1 Multiple-choice cloze
│   ├── Part 2 Open cloze
│   ├── Part 3 Word formation
│   └── Part 4 Key word transformations
├── Error Bank
└── Statistics
```

Parts 5–8, Writing, Listening, and Speaking may be visible as planned areas only if clearly marked as unavailable; they must not appear complete in v0.1.

## Home screen

Show:

- product name and learner-local profile label;
- primary “Start training” action;
- current practice accuracy labelled as internal;
- per-part accuracy only where attempts exist;
- due Error Bank count;
- a short list of weak tags.

Avoid a dashboard full of decorative charts. The screen should make the next action obvious.

## Exercise screen

- Show part, activity title, progress, and instructions.
- Keep the text and answer controls in a predictable vertical order.
- Allow changing an answer before checking.
- Keep “Check” separate from “Next”.
- After checking, show score state, correct answer, learner answer, and explanation.
- Provide a deliberate “Add to Error Bank” action; default it on for incorrect responses and allow removal.
- Preserve the current item if the browser is backgrounded or briefly offline.

## Mobile constraints

- Comfortable tap targets and visible focus states.
- No hover-only information.
- No essential side-by-side layout on narrow screens.
- Long text must scroll independently from fixed controls only when this improves usability and remains accessible.
- Respect safe-area insets and text zoom.

## Accessibility

- Semantic headings, labels, fieldsets, and live feedback regions.
- Keyboard-operable controls and logical focus order.
- Do not encode correctness by colour alone.
- Sufficient contrast in light and dark themes if both are offered.
- Clear error messages for incomplete answers.

## Visual direction

Calm, editorial, study-focused, and fast. Use restrained colour, strong typography, generous spacing, and a consistent card/action pattern. The interface should feel like a serious study tool rather than a game.

