# Architecture decision

Status: proposed; no product implementation authorised by this document

## Decision

Build C1 Trainer as a static React/Vite PWA, starting from a forked/adapted `dhanak/examiner` shell. Keep the first release client-only and deploy it to GitHub Pages. Use IndexedDB through a storage abstraction for learning history and small browser preferences through localStorage. Add `ts-fsrs` only after the Error Bank and attempt model are stable.

The project will be **reuse-first but license-first**: compatible MIT code may be adapted with notices, CC BY-NC material may be used only with attribution and non-commercial boundaries, the unlicensed benchmark remains reference-only, and GPL code is not part of the initial client.

## Target structure

```text
c1-trainer/
├── src/
│   ├── app/                 # shell, routes, session orchestration
│   ├── components/          # presentational controls
│   ├── domain/              # versioned types and domain invariants
│   ├── exam/                # part-specific renderers and session rules
│   ├── grading/             # pure deterministic graders
│   ├── learning/            # Error Bank, adaptive selection, FSRS adapter
│   ├── storage/             # IndexedDB/Dexie repositories and migrations
│   └── stats/               # derived internal learning metrics
├── content/
│   ├── candidates/          # not bundled
│   ├── approved/            # bundled after validation and review
│   └── rejected/            # audit trail, not bundled
├── schemas/                 # JSON Schema and schema fixtures
├── scripts/                 # validation, build-content, license checks
├── tests/                   # unit, integration, content, PWA checks
├── docs/
├── LICENSES/
└── AGENTS.md
```

## Boundary decisions

### UI and state

Retain React and the useful shell/state patterns from `examiner`. Zustand handles UI and active-session state only. Durable attempts, responses, errors, review cards, and drafts go through an async storage repository backed by IndexedDB.

### Content

Approved JSON content is loaded at build time and never generated at runtime in v0.1. Content schemas are versioned. A build must fail if an item is structurally invalid, ambiguous under its declared answer model, missing explanations/provenance, or contains a duplicate ID.

### Grading

Every grader is a pure function and is independent of React. Part 1 has deterministic option grading; Parts 2 and 3 have constrained accepted answers; Part 4 has an explicit answer set, word-count check, keyword check, and a separately specified partial-credit policy.

### Learning data

Question responses and concept-level review cards are separate records. The Error Bank is not just a set of failed question IDs. It retains the response event, skill tags, explanation reference, counts, and review state.

### Deployment

Use hash routing or another GitHub Pages-safe route strategy, an installable manifest, a service worker, and a CI build/deploy workflow. Offline behavior must be tested against a production build, not inferred from development mode.

## Rejected alternatives

- **New app from `npm create vite`:** rejected for now because `examiner` already provides a tested shell and interaction patterns.
- **Copying `curso-c1-advanced`:** rejected because no reusable license was found and its content/provenance must not enter the project.
- **Using `web_rephrasings` as Part 4 base:** rejected because the backend is out of scope, the code is GPL v3, and exact-string grading is insufficient.
- **Runtime LLM generation:** rejected for v0.1 because it adds backend, cost, latency, privacy, and QA risk.
- **Official-score prediction:** rejected until a separately verified scoring specification exists.

## Consequences

This choice minimizes infrastructure work but requires a careful migration from generic JS/JSX vocabulary flows to typed, content-driven CAE flows. It also makes licensing provenance an explicit build concern. The first technical milestone is therefore a baseline fork and audit trail, not Part 1 feature work.

