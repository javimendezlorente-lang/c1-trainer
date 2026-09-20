# Roadmap

Status: Writing frozen; Phase 8.5 active

## Delivery rules

Each milestone must be independently testable and deployable. A later subphase cannot begin while the current one has unresolved contract, grading, security or critical calibration defects. Existing event-sourced history and backup compatibility are release gates.

## Completed foundation

| Phase | Scope | Status |
| --- | --- | --- |
| 1–3 | Product contract, architecture, PWA shell and offline baseline | Complete |
| 4 | Part 1 vertical slice and deterministic grading | Complete |
| 5 | Attempt events, Error Bank and Progress projections | Complete |
| 6 | FSRS review events, queue and rebuildable cards | Complete |
| 6.5 | Versioned backup and merge-only restore | Complete |
| 7 | Use of English Parts 2–4 | Complete as technical foundation; content recalibration required |
| 8 | Reading Parts 5–8 | Complete as technical foundation; content and mobile UX recalibration required |

The former next milestone, Writing, is deliberately stopped. It is not resumed until Phase 8.5 is working well across Parts 1–8.

## Phase 8.5 — Dynamic content, calibration and product reset

| Subphase | Scope | Exit gate | Status |
| --- | --- | --- | --- |
| 8.5A | Product/UX audit and Cambridge calibration audit | UX audit, Parts 1–8 benchmarks, machine profile and updated specs | **Complete** |
| 8.5B | Secure backend/API proof of concept for Part 1 | Backend decision, secret boundary, structured Part 1 response, request/cost limits and contract tests | Code complete; real five-candidate evidence pending credentials |
| 8.5C | Part 1 planner, validation, critic and novelty engine | Real pipeline; finite retries; 20-candidate acceptance report passes | Blocked by 8.5B |
| 8.5D | Ready pool and generated-content IndexedDB | Consume/replenish/offline/failure behavior tested; history/fingerprints stored separately | Blocked by 8.5C |
| 8.5E | Home, Practice and Review product redesign | New exercise is primary; learner context replaces IDs; disposition actions preserve history | Blocked by 8.5D |
| 8.5F | Dynamic generation Parts 2–4 | Per-part validators/critics and calibrated sample evidence pass | Blocked by Part 1 gate |
| 8.5G | Dynamic generation Parts 5–8 | Reading calibration, mobile reference UX and quality evidence pass | Blocked by 8.5F |

## 8.5A deliverables

- [x] Audit Home, Practice, selection, Parts 1–8, Results, Review, FSRS, Progress, Settings and backup.
- [x] Classify findings CRITICAL/HIGH/MEDIUM/LOW in [`UX_AUDIT.md`](UX_AUDIT.md).
- [x] Measure two official public exemplars without copying their text.
- [x] Create Parts 1–8 calibration profiles under [`docs/calibration/`](calibration/README.md).
- [x] Record the dynamic-generation, security, ready-pool, novelty, offline and backup boundaries in [`PHASE_8_5_SPEC.md`](PHASE_8_5_SPEC.md).
- [x] Reframe the 24 bundled items as regression/reference/fallback content.
- [x] Freeze Writing.

## 8.5B deliverables

- [x] Separate Cloudflare Worker with explicit authentication and CORS boundary.
- [x] Responses API Structured Outputs candidate contract, canonical transformation and deterministic Part 1 checks.
- [x] Request limits, bounded output, cooldown, controlled errors and frontend-secret scan.
- [x] Mocked backend tests and deployment documentation.
- [ ] Generate and manually inspect five real Part 1 candidates; see [`PART1_POC_REPORT.md`](generation/PART1_POC_REPORT.md).

## Part 1 expansion gate

Before 8.5F, process at least 20 Part 1 candidates through the production-equivalent pipeline. Report first-pass acceptance, rejection/regeneration, ambiguity, difficulty, length and novelty failures, API usage/latency and a representative manual review. The gate fails if content is accepted by average score despite any critical-dimension failure.

## Later roadmap

| Milestone | Scope | Preconditions |
| --- | --- | --- |
| Writing | Prompt, editor, word count, timer and draft history | Phase 8.5G complete and stable |
| Exam simulation | Timed multi-part session and summary | Format and content supply verified |
| Listening/Speaking/optional evaluation | Separate privacy, licensing, audio and evaluation specs | Explicit authorization and new architecture decision |
