# `curromunoz1/curso-c1-advanced` audit

Audit snapshot: 2026-09-17  
Audited commit: `a677a0de1b44639f47cca180e9297302e2c9d225` (`Publicar en GitHub Pages y documentar el acceso`)  
Repository: <https://github.com/curromunoz1/curso-c1-advanced>

## Executive finding

This is the closest functional benchmark: a static, no-dependency C1 study app with rich content, an Error Bank, drills, local progress, export/import, and multiple papers. The audited repository has no root `LICENSE`/`LICENSE.md`/`COPYING` file and no declared reusable open-source license in the tree. Treat it as **reference-only** unless the author gives explicit permission.

Public visibility and a README statement that content is original are not a license grant. Do not copy its source code, data, explanations, prompts, or distinctive text.

## Observed architecture

- Plain HTML, CSS, and browser JavaScript; no package manifest or application dependency graph.
- `build.js` concatenates/inlines the app into `dist/C1-Advanced.html`, producing a portable single-file artifact.
- `js/core.js` owns global state, routing, persistence, account separation, export/import, and timers.
- `js/exam.js` renders and grades Reading and Use of English Parts 1–8.
- `js/grader.js` centralises short-answer, word-formation, and transformation grading, including status messages and partial-credit logic.
- `js/stats.js`, `js/drills.js`, `js/writing.js`, `js/listening.js`, and `js/speaking.js` provide feature-specific flows.
- `data/` contains full exam and exercise content; `tests/` contains content, style, and app checks.

## Useful patterns to reimplement independently

- A single learner-facing dashboard with study-plan and “errors due” emphasis.
- Error records that retain prompt, given answer, correct answer, part, and explanation.
- Export/import of local learning data as a recovery path for device-local storage.
- Part-specific rendering and grading dispatch.
- Content validation that checks counts, numbering, word limits, and answer-key solvability.
- A static deployment path with a small artifact footprint.

## Risks and observed defects

1. The README exposes a sample username/password and correctly says the login is not security. C1 Trainer will not add accounts in v0.1.
2. The app stores progress per browser/device. That is compatible with local-first use but must be explicit in the product UX.
3. Cambridge-scale estimation is present. It must not be copied; C1 Trainer will not present an official-looking conversion without a verified scoring contract.
4. `tests/validar-contenido.js` and `tests/probar-app.js` contain a hard-coded author-local path. In the audit environment, `node tests/validar-contenido.js` failed because that path did not exist.
5. `node build.js` did succeed and reported `dist/C1-Advanced.html` at approximately 587 KB, confirming the portable-build idea but not the correctness of its content or grading.
6. The data files are unlicensed project content and must remain outside the C1 Trainer corpus.

## Recommendation

**BENCHMARK, DO NOT REUSE.** Reimplement the useful UX and data-flow ideas in the project’s own architecture. Ask the author for permission only if direct reuse is later desired; until then, keep a clean-room boundary between observation and implementation.

