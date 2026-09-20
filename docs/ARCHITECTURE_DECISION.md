# Architecture decision

Status: approved foundation decision; extended by Phase 8.5 product reset

## Decision

Build C1 Trainer as a static React/Vite browser application on the way to a PWA, starting from an adapted `dhanak/examiner` shell. Keep the first release client-only and deploy it to GitHub Pages. Use IndexedDB through a storage abstraction for learning history and small browser preferences through localStorage. Use `ts-fsrs` only behind a narrow adapter after the Error Bank and attempt model are stable.

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

Approved JSON content is loaded at build time and never generated at runtime in v0.1. Versioned Draft 2020-12 schemas live under `schemas/c1/v1/`, domain-only TypeScript types live under `src/domain/`, and `src/content/contentRepository.ts` exposes the bundled approved corpus to the UI. A content validation command must fail if an item is structurally invalid, violates semantic answer constraints, is missing explanations/provenance, or contains a duplicate ID.

### Grading

Every grader is a pure function and is independent of React. Part 1 has deterministic option grading through `gradePart1`; Parts 2 and 3 have constrained accepted answers; Part 4 has an explicit answer set, word-count check, keyword check, and a separately specified partial-credit policy.

### Learning data

`AttemptEvent` is practice history and `ReviewEvent` is deliberate review history. Error Bank, Progress/skill profile, ReviewCard state, and the due queue are derived projections; materialized forms may be cached, but they must be reconstructible from the historical ledgers. Question attempts and review cards remain separate records.

### Deployment

Use hash routing or another GitHub Pages-safe route strategy, an installable manifest, a generated Workbox service worker, and a CI build/deploy workflow. The current PWA uses `vite-plugin-pwa` with `generateSW`, `registerType: 'autoUpdate'`, and a precache containing the shell plus the bundled Parts 1–8 corpus. Offline behavior must be tested against a production build, not inferred from development mode.

## Rejected alternatives

- **New app from `npm create vite`:** rejected for now because `examiner` already provides a tested shell and interaction patterns.
- **Copying `curso-c1-advanced`:** rejected because no reusable license was found and its content/provenance must not enter the project.
- **Using `web_rephrasings` as Part 4 base:** rejected because the backend is out of scope, the code is GPL v3, and exact-string grading is insufficient.
- **Runtime LLM generation in the v0.1 browser:** rejected because it exposes security, cost, latency, privacy and QA risks. Phase 8.5 separately authorizes a server-side, validation-gated generation service under [`PHASE_8_5_SPEC.md`](PHASE_8_5_SPEC.md); direct browser-to-OpenAI calls remain rejected.
- **Official-score prediction:** rejected until a separately verified scoring specification exists.

## Consequences

This choice minimizes infrastructure work while retaining typed, content-driven CAE flows. Phase 2 provides the canonical domain/schema contract, Phase 3 the installable shell, Phase 4 the Part 1 renderer/grader boundary, Phase 5 the historical attempt boundary, Phase 6 rebuildable FSRS scheduling, Phase 6.5 local versioned backup/restore, and Phase 8 dedicated Reading renderers. Phase 8.5 adds a secure generated-content supply layer without changing the event ledgers or deterministic grading authority. Licensing provenance remains an explicit build concern. Writing is paused until the dynamic training model passes its quality gates.
