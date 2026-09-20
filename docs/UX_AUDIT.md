# Phase 8.5A product and UX audit

Status: complete audit; no redesign implemented

Audit date: 2026-09-17

Build inspected: local `c502285` (Parts 1–8) at desktop and 390 × 844 mobile viewport, plus the deployed GitHub Pages build where noted.

## Executive finding

C1 Trainer has a sound learning-data foundation, but its current product model behaves like a small digital workbook. The learner sees three numbered exercises per part, reaches a catalogue screen before studying, and receives little guidance about what to do next. The problem is structural, not cosmetic.

The event-sourced foundation remains valuable and must be preserved: deterministic graders, `AttemptEvent`, `ReviewEvent`, rebuildable projections, IndexedDB, FSRS, backup/restore and PWA support. Phase 8.5 must add a generated-content layer and learner-oriented presentation layer around those boundaries.

The approved seed corpus is not currently suitable as a Cambridge-calibrated production corpus. All 24 items remain useful as regression fixtures, offline fallback candidates and schema examples, but several require correction before they can be described as high-quality learner content.

## Method

The audit followed the principal learner journeys:

1. Home → Practice → part selection → exercise → submit → results.
2. Results → Progress → Review → FSRS rating.
3. Settings → export/import backup.
4. Desktop and iPhone-sized layouts.
5. Source inspection where learner-facing copy or state could not be understood from the UI alone.

Severity means:

- **CRITICAL:** prevents reliable study, corrupts task validity, or blocks the new product model.
- **HIGH:** materially harms learning, trust, or the primary workflow.
- **MEDIUM:** adds friction or exposes implementation detail without blocking study.
- **LOW:** polish or consistency issue with limited learning impact.

## Findings by severity

### CRITICAL

| Area | Finding | Evidence | Required outcome |
| --- | --- | --- | --- |
| Product model | Practice presents a finite catalogue of three numbered exercises per part. | Each part expands to `Exercise 1`, `Exercise 2`, `Exercise 3`; the learner can visibly finish the product. | Make **New exercise** the primary action and move static content to fallback/library status. |
| Content calibration | The corpus is materially shorter and less demanding than the official exemplars sampled. | Part 1 averages 67 words versus 145 observed; Part 5 averages 169 versus 770; Parts 6 and 8 are roughly one quarter of the sampled length. | Apply the per-part benchmark profiles before generation or seed-content promotion. |
| Answer validity | Approved Part 1 item `c1-ruoe-p1-000001` contains multiple defensible options. | Its own explanations admit alternatives such as “make notes”, “draw a conclusion”, “make a hasty decision”, “observe patterns” and “stay/go unnoticed”. | Quarantine or rewrite; ambiguity must be a hard rejection, not a lower critic score. |
| Transformation validity | Part 4 includes a completed sentence that duplicates its clause. | The first item becomes “until every figure had been checked every figure had been checked”. | Fix the seed item and add completed-sentence semantic validation. |
| Persistence confidence | The deployed build displayed “The attempt could not be saved locally” after submission in the in-app browser. | Reproduced by the learner on the public URL. Local HEAD did save during this audit, so production and local behavior differ. | Reproduce against the deployed commit/browser, add a persistence smoke test, and block release if an attempt cannot be stored. |

### HIGH

| Area | Finding | Evidence | Required outcome |
| --- | --- | --- | --- |
| Home | Home does not answer “What should I do now?”. | It mainly shows reviews due and a Review action; no New exercise, recent result or suggested next step. | Prioritize Continue training/New exercise, reviews due and recent progress. |
| Review item | Review exposes storage identity instead of learning context. | Cards show labels such as `c1-ruoe-p1-000001 · q1`. | Use part/task, a concise prompt excerpt, answer contrast, skill and due state. IDs belong only in diagnostics. |
| Review usefulness | Error cards omit the learner’s answer, correct answer, explanation, skill and failure history. | The list shows only a short prompt and “Needs review”. | Center the card on the mistake and supply Review, Mastered and Archive actions without deleting history. |
| FSRS session | Rating labels are unexplained and provide indistinguishable intervals. | Again/Hard/Good/Easy all displayed `<1 day` in the observed session. Original wrong answer and skill were absent. | Add pedagogical context and meaningful scheduling copy; preserve events separately from explicit disposition. |
| Reading mobile UX | Long source texts and questions are stacked into a single scrolling column. | Part 5 requires scrolling between a long text and questions; Parts 6–8 use the same pattern. | Add mobile reference affordances such as sticky text access, collapsible source panels or a controlled text/question switch. |
| Part 7 mobile UX | The learner must relate inline selectors, a long source and paragraph options across a very long page. | The options are far below the relevant gaps on a 390 px viewport. | Provide persistent paragraph access and clear used/available state. |
| Results workflow | Results are verbose but do not lead to the next useful action. | Repeated per-question blocks end without Review errors or New exercise calls to action. | Summarize first, progressively disclose detail, then offer Review errors/New exercise. |
| Quality governance | `approved` currently means schema-valid, not demonstrably Cambridge-calibrated or unambiguous. | Items with explicit ambiguity and invalid completion pass the current content pipeline. | Separate structural approval from quality approval and retain critic/reviewer evidence. |

### MEDIUM

| Area | Finding | Evidence | Required outcome |
| --- | --- | --- | --- |
| Navigation | Five top-level links plus theme controls are cramped on mobile. | At 390 px the navigation remains a dense single row. | Use a mobile navigation pattern with a clear current location and adequate targets. |
| Practice information hierarchy | Part descriptions visually concatenate with headings and counts. | Text such as task name, skill description and `3 exercises` runs together. | Use explicit block hierarchy and spacing. |
| Empty Review | Empty copy is stale and Part 1-specific. | “Complete a Part 1 exercise” remains after Parts 1–8 were added. | Explain how mistakes enter Review across all parts and offer Practice. |
| Progress language | Internal architecture terminology is shown to learners. | “derived from AttemptEvent history and can be rebuilt from scratch.” | Replace with learning language; keep rebuild details in diagnostics/docs. |
| Progress value | The page emphasizes lifetime totals and raw skill slugs rather than decisions. | Values such as `semantic_precision` appear verbatim; by-part and trend information is absent. | Show marks/accuracy by part, skill weaknesses, trend and recent performance with human labels. |
| Settings language | Backup copy names `AttemptEvents`, `ReviewEvents` and projection rebuilding. | These are implementation concepts, not backup decisions a learner needs. | Say what learning data is included, what is excluded and whether import merges or replaces. |
| Exercise selection | Selecting a part often leads to another list screen before study. | The extra “Choose an exercise” step is necessary only because of the finite catalogue. | A part’s New exercise action should open a ready item immediately. |
| Session continuity | Leaving an active review session loses its transient place. | Returning starts from the surrounding page rather than restoring the active card. | Decide and test whether active sessions resume or deliberately restart. |
| Part 6 validity | Most prompts can be answered as isolated attribution rather than genuine cross-text comparison. | Questions ask which writer independently mentions a single concern. | Require at least some relationships, agreement/disagreement or comparative stance across texts. |
| Part 7 validity | Per-gap prompts can reveal the content to match rather than testing paragraph placement through cohesion. | Prompts say what the missing paragraph “explains” or “presents”. | The text and paragraph fit must carry the solution; avoid answer-leading prompt paraphrases. |

### LOW

| Area | Finding | Required outcome |
| --- | --- | --- |
| Theme control | The sun icon and literal `light` label feel detached from the rest of navigation. | Give it an accessible label and consistent compact presentation. |
| Results density | Correct and incorrect item blocks repeat several labels even when no action is required. | Reduce repetition and use disclosure for explanations/distractor notes. |
| Diagnostics boundary | No deliberate learner/debug mode boundary is visible. | If IDs or projection details are needed, place them behind an explicit diagnostics view. |

## Route-by-route assessment

### Home

Home is technically correct but strategically empty. It does not surface a new exercise, recent performance or a recommendation. It reflects review count after activity, but not enough activity context to create a daily habit.

### Practice and exercise selection

The page exposes the exact corpus size. Part 1 expands inline while other parts introduce an additional selection screen, so behavior is inconsistent. The list is long on mobile and its copy hierarchy is weak. A learner’s mental model becomes “complete 24 exercises” instead of “train continuously”.

### Exercises

Parts 1–4 are operable on mobile, but the source material is compressed. Parts 5–8 need reading-reference controls rather than simple responsive stacking. Internal grading remains correctly separated from React and should not be disturbed.

### Results

The page provides deterministic explanations, which is valuable. It needs a compact score/diagnostic summary, clearer emphasis on errors and direct continuation actions. “Report issue” belongs here as a subtle, non-blocking action in a later subphase.

### Review and FSRS

The implementation models scheduling but not the learner’s relationship with an error. Review needs a separate rebuildable disposition (`active`, `mastered`, `archived`) so explicit intent is not confused with FSRS recovery. Archiving must never delete historical events.

### Progress

The projections already contain useful source data, but the page exposes how the system is implemented rather than what to study. Raw internal skill keys need presentation metadata. Trend, by-part performance and recent work should lead.

### Settings and backup

Export/import is important and should remain. The current copy is accurate for developers but unnecessarily technical. Backup 1.x must remain compatible; generated-content history can only be added later as an optional compatible section after a written decision.

## Product-model decision for later implementation

The target learner flow is:

```text
Home or Practice
→ New exercise
→ consume validated item from ready pool
→ complete and submit
→ deterministic grading
→ append AttemptEvent
→ results and useful next action
→ replenish pool online
```

If the ready pool is empty while online, the UI may wait on the generation pipeline. If it is empty offline, it must offer suitable static fallback content or clearly ask the learner to connect. No raw or partly validated generated item may enter the flow.

## Guardrails before redesign

- Keep all historical ledgers append-only and projections rebuildable.
- Never use an internal ID as learner-facing presentation metadata.
- Do not change backup 1.x during 8.5A.
- Do not describe empirical word ranges as Cambridge rules.
- Do not promote a candidate to learner-ready unless every critical quality dimension passes.
- Do not begin Writing while Phase 8.5 is active.

## 8.5A exit decision

The audit supports proceeding to a Part 1-only backend proof of concept, but not to learner-facing dynamic generation yet. The critical seed-content and deployed-persistence defects remain explicit release risks. The next implementation must follow the architecture and acceptance gates in [PHASE_8_5_SPEC.md](PHASE_8_5_SPEC.md).
