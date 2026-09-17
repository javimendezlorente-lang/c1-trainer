# Reuse matrix

Decisions are based on the audited snapshots recorded in the linked research documents. “Reuse” means copy or depend on compatible material with notices preserved; “adapt” means use a source as a bounded starting point and rewrite its domain behavior.

| Feature | Source | Reuse strategy | License | Modifications required | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| React/Vite shell | `dhanak/examiner` | Fork/adapt shell | MIT | Rename, remove language-learning domain, update base path | Medium: JS/JSX and existing assumptions | REUSE |
| Routing | `dhanak/examiner` | Adapt hash-router pattern | MIT | C1 routes, 404/refresh tests | Low | REUSE |
| Multiple-choice control | `dhanak/examiner` | Adapt visual interaction only | MIT | Content-driven passage/gap model, check state, feedback | High: current behavior grades generic vocabulary immediately | ADAPT |
| Fill-in control | `dhanak/examiner` | Adapt interaction ideas | MIT | Separate Part 2/3 renderers and graders | High | ADAPT |
| Theme/CSS primitives | `dhanak/examiner` | Adapt | MIT | Accessibility and mobile review | Low | REUSE |
| Test harness | `dhanak/examiner` | Keep and extend | MIT | Add domain/content/PWA tests | Low | REUSE |
| Generic vocabulary corpus | `dhanak/examiner` | Do not import | MIT code; data provenance separate | Build new original C1 corpus | High | REMOVE |
| IndexedDB persistence | None existing | Use Dexie or a small repository layer | Dependency licenses to verify | Add schema versioning/migrations | Medium | BUILD/DEPENDENCY |
| CAE format rules | Cambridge official + `cae-tutor` | Fact-check then rewrite | Cambridge references; CC BY-NC source material | Cambridge wins; preserve attribution where applicable | High | ADAPT |
| Exercise QA rules | `cae-tutor` | Adapt concepts | CC BY-NC 4.0 | Project-owned validators and review gates | Medium | ADAPT |
| Part 4 UX | `web_rephrasings` | Study back/next/recap flow | GPL v3 source | Rebuild controlled, accessible client flow | Medium | STUDY/ADAPT |
| Part 4 grader | `web_rephrasings` | Do not copy exact comparator | GPL v3 | Build accepted-answer/word-count/partial-credit grader | High | BUILD |
| Error Bank UX | `curso-c1-advanced` | Reimplement independently | No license found | New data model, provenance, export/import | High | REIMPLEMENT |
| Static single-file build idea | `curso-c1-advanced` | Study only | No license found | Use Vite/PWA build, no content/code copy | Medium | BENCHMARK |
| Spaced repetition scheduler | `ts-fsrs` | Add pinned npm dependency | MIT | Adapter, IndexedDB persistence, mapping tests | Medium | REUSE |
| FSRS optimizer/binding | `ts-fsrs` | Do not add initially | MIT | None | High: unnecessary browser/native complexity | DEFER |
| Original exercise content | None | Generate/review project-owned content | Project-owned | Provenance, schema, ambiguity and copyright checks | High | BUILD |
| PWA/installability | None in audited base | Add explicit PWA layer | To be inventoried | Manifest, service worker, icons, offline tests | Medium | BUILD |
| GitHub Pages CI | `dhanak/examiner` pattern + GitHub Actions | Recreate and verify | MIT source pattern; GitHub service terms | New workflow and deploy smoke test | Medium | ADAPT |

