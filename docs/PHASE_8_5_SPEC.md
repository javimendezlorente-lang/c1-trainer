# Phase 8.5 dynamic training specification

Status: normative product boundary for Phase 8.5

Phase 8.5A checkpoint commit: `6473f4c` (`docs: checkpoint Phase 8.5A audit`)

## Decision

Writing is paused. The next milestone is a practically inexhaustible, Cambridge-calibrated training engine for Reading and Use of English Parts 1–8. The current 24 exercises are regression/reference material and offline fallback candidates, not the product’s conceptual limit.

The current event-sourced learning architecture remains authoritative. Dynamic content adds a content supply layer; it does not replace `AttemptEvent`, `ReviewEvent`, deterministic grading, rebuildable projections, IndexedDB, FSRS or backup/restore.

## Required pipeline

```text
GenerationRequest
→ GenerationPlanner
→ OpenAI Responses API generator
→ canonical JSON Schema validation
→ semantic validation
→ independent quality critic
→ novelty validation
→ approved generated exercise
→ ReadyExercisePool
→ learner
```

Raw, malformed, ambiguous, under-calibrated or insufficiently novel model output must never be shown to a learner. Rejection causes regeneration up to a finite configured limit; exhausting that limit produces a controlled generation error and fallback path.

## Security boundary

- The browser sends structured intent, never arbitrary prompts.
- `OPENAI_API_KEY` remains server-side and must not appear in React source, shipped environment variables, browser storage, GitHub Pages or committed files.
- The backend validates part, difficulty and novelty parameters and owns prompt templates.
- The concrete deployment decision must be recorded in `docs/GENERATION_BACKEND.md` during 8.5B before backend implementation.

## Model routing boundary

Routing is configuration, not business logic. The requested initial routing is:

| Part | Generator | Critic | Escalation |
| --- | --- | --- | --- |
| 1–3 | `gpt-5.6-luna` | `gpt-5.6-terra` | `gpt-5.6-sol` for ambiguity/adjudication |
| 4 | `gpt-5.6-terra` | `gpt-5.6-terra` | `gpt-5.6-sol` when needed |
| 5–8 | `gpt-5.6-terra` | `gpt-5.6-terra` | `gpt-5.6-sol` when needed |

Availability, exact model identifiers and pricing must be verified against the API before implementation. No frontend code may depend directly on these names.

## Ready pool and offline contract

- Initial target: three validated ready exercises per part, configurable.
- `New exercise` consumes one ready item and triggers online replenishment.
- Validated generated exercises are stored in a separate IndexedDB repository.
- Offline study continues with ready items, eligible bundled fallback content and all existing learning-data features.
- If no item is available offline, say: “Connect to generate a new exercise.”
- Generated runtime content is never written into the Git repository.

## History and novelty contract

Retain compact metadata even when full generated items are pruned:

- exercise ID, part and generation timestamp
- domain, topic/subtopic and genre
- primary/secondary skills and target structures
- difficulty and recent answer lemmas where relevant
- normalized text and question/answer fingerprints
- generator/critic model, quality status and rejection reasons

Initial novelty checks require exact normalized hashes and local n-gram/shingle similarity. Semantic embeddings are deferred unless the local approach proves insufficient.

## Quality contract

The canonical schemas remain authoritative and will not be weakened to accommodate model failures. Critical dimensions are conjunctive: a candidate fails if any critical dimension fails, even when an average quality score is high.

Universal hard rejections include ambiguity, incorrect grading/explanation, unnatural text, structural/schema failure, benchmark-length failure, answer leakage, world-knowledge-only answers and recent-content duplication. Part-specific rules are in `docs/calibration/` and `CALIBRATION_PROFILES.json`.

## Learner presentation contract

- Internal exercise, question, review-card and storage IDs never appear in normal UI.
- Practice leads with **New exercise**, not numbered catalogue entries.
- Review leads with learning context, answer contrast, explanation, skill and due state.
- Explicit review disposition (`active`, `mastered`, `archived`) is separate from immutable history and FSRS recovery.
- Progress leads with marks/accuracy by part, weak skills, trend, reviews and recent performance.
- A subtle post-exercise issue report is stored locally without interrupting study.

## Backup decision

Backup 1.x remains unchanged during 8.5A–8.5D unless a separate compatibility decision is approved. Attempt and review ledgers remain mandatory. Generation fingerprints/preferences may later be an optional backward-compatible section; ready-pool content is reproducible cache and is not mandatory historical truth.

## Cost and failure controls

The backend must impose request, retry and output/token limits; capture API usage where available; enforce configurable daily/monthly guards; and prevent recursive or unbounded retries. Failures must not mutate the active exercise or store partial content. Prefer a ready item, then an eligible static fallback, then a clear error.

## Implementation order and gates

1. **8.5A — complete:** UX/product audit and Parts 1–8 calibration study.
2. **8.5B:** secure backend decision and Part 1 Responses API proof of concept.
3. **8.5C:** Part 1 planner, validation, critic and novelty engine.
4. **8.5D:** ready pool and generated-content IndexedDB repositories.
5. **8.5E:** Home, Practice and Review product redesign.
6. **8.5F:** generalize to Parts 2–4.
7. **8.5G:** generalize to Parts 5–8.

Before 8.5F, run at least 20 Part 1 candidates through the real pipeline and report first-pass acceptance, rejection/regeneration, ambiguity, difficulty, length and novelty failures, plus representative manual inspection. Expansion is blocked until the evidence is satisfactory.

## Required automated coverage

- schema and semantic compliance
- backend request contract and arbitrary-prompt rejection
- absence of secrets from frontend artifacts
- malformed output, quality rejection and finite retry handling
- novelty rejection and duplicate prevention
- ready-pool consumption/replenishment and offline fallback
- internal IDs absent from normal Practice, Review and Progress UI
- Mastered/Archive behavior without event deletion
- existing attempt/review replay and backup regression

## Subphase reporting

Every subphase reports architecture changes, models, prompt/version, quality results, measurable API usage/cost and latency, novelty behavior, benchmark conformity, tests, PWA/offline impact, UX changes and unresolved risks.
