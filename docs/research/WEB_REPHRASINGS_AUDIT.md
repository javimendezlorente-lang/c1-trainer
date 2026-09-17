# `Serms1999/web_rephrasings` audit

Audit snapshot: 2026-09-17  
Audited commit: `9e447be8ebdaeba33db36ab723f669673ca1ad3a` (`fix client docker not loading env variables and minor improvements`)  
Repository: <https://github.com/Serms1999/web_rephrasings>

## Executive finding

This repository is a useful Part 4 UX and data-shape reference, but not a suitable base for C1 Trainer. It is a client/server CRUD application with MySQL and Docker. Its answer comparison is exact-string based and does not implement the Cambridge constraints required by this project.

## License

The root `LICENSE.md` is the GNU GPL v3 license. Directly copying covered code into a distributed client would require a separate GPL compliance decision and source/license notices. Personal use does not make the license disappear. The recommended path is to study the design and write a small project-owned grader.

## Observed implementation

- Client: React 18, Create React App, React Router, Bootstrap, Recharts, Axios, TypeScript.
- Server: Express, MySQL, CORS, dotenv, and a TypeScript build.
- Operations: add/edit/delete/import sentences, fetch random exam sentences, show recap, and chart results.
- Core sentence interface: `sentence`, `keyword`, `sentence_start`, `sentence_end`, and one `answer` string.
- `ExamSentences.tsx` provides a back/next flow, answer input, and show-answer interaction.
- `ExamEnd.tsx` computes results from the server-provided answer and supports retrying incorrect sentences.
- `sentences.tool.ts` checks a narrow allowed-character pattern; it does not validate word count, keyword immutability, meaning, or alternate answers.
- `ExamEnd.tsx` compares the submitted answer to `sentence.answer` using exact string equality.

## What is and is not reusable

| Area | Decision | Reason |
| --- | --- | --- |
| Back/next Part 4 flow | STUDY/ADAPT | Useful interaction pattern, but rebuild with controlled React state and accessibility checks. |
| Recap and retry-incorrect flow | STUDY/ADAPT | Good learning affordance; connect to the Error Bank rather than a server list. |
| Sentence interface | REPLACE | Too narrow for accepted alternatives, partial credit, tags, provenance, and review metadata. |
| Exact answer comparison | DO NOT REUSE | Rejects legitimate variants and does not implement the 3–6 word rule. |
| API/server/MySQL/Docker | REMOVE | Conflicts with the static, offline, no-backend v0.1 boundary. |
| GPL-covered source | AVOID COPYING | Avoids copyleft integration and unnecessary legal/packaging complexity. |

## Part 4 implications for C1 Trainer

The project needs a pure grader with explicit answer records. At minimum it must normalize whitespace safely, preserve the keyword constraint, count 3–6 words according to the project’s documented convention, support multiple accepted answers, and return 0/1/2 marks with an auditable reason. Semantic equivalence beyond the declared accepted set is a later, separately specified feature; it must not be approximated by unsafe fuzzy matching.

## Recommendation

**STUDY the UX; BUILD the grader.** Do not import its backend, database, exact comparison, or GPL-covered implementation into the initial PWA.

