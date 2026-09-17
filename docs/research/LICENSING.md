# Licensing and provenance audit

Audit date: 2026-09-17

This is an engineering provenance record, not legal advice. When the project moves from personal use to distribution or commercial use, obtain a jurisdiction-specific review.

## Evidence matrix

| Source | Audited commit | License evidence in audited tree | Permitted project use |
| --- | --- | --- | --- |
| `dhanak/examiner` | `df862f7` | Root `LICENSE`: MIT | Reuse/adapt code with notices retained. |
| `violasgarbi/cae-tutor` | `1d104ea` | `cae-tutor/LICENSE`; README states CC BY-NC 4.0 | Adapt licensed documentation for non-commercial use with attribution and change notices; verify every included asset’s provenance. |
| `curromunoz1/curso-c1-advanced` | `a677a0d` | No root license file or declared open-source license found | Reference only unless the author grants permission. |
| `Serms1999/web_rephrasings` | `9e447be` | Root `LICENSE.md`: GPL v3 | Avoid direct code reuse in the initial app; if later used, perform a full GPL compliance review. |
| `open-spaced-repetition/ts-fsrs` | `c8ca282` | Package metadata and repository MIT license | Add as a pinned dependency with MIT notice. |

## Rules for this project

- A public GitHub repository is not automatically open-source software. Absence of a license means default copyright restrictions apply. See [GitHub’s licensing guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository).
- “Personal” and “non-commercial” describe intended use; they do not waive MIT, GPL, CC, or copyright conditions.
- Cambridge official pages are the authority for factual exam-format references. Do not copy Cambridge passages, questions, answer keys, official sample material, or verbatim rubric wording. See [Cambridge C1 Advanced format](https://www.cambridgeenglish.org/exams-and-tests/qualifications/advanced/format/).
- All C1 Trainer exercises must be independently authored and stored as project-owned content with provenance and review metadata.
- Every copied source file must retain its original notice. Every adapted file must be marked as adapted and linked to its source commit.
- Before distribution, generate a dependency/license report and confirm that built artifacts include all required notices.

## Clean-room boundary

The unlicensed benchmark may inform feature requirements and UX observations. It must not be used as a source for copied implementation or content. The implementation team should record decisions from behavior and public documentation, not paste source snippets into the product.

## Planned repository record

When code reuse begins, add:

- `LICENSES/THIRD-PARTY.md` with source URLs, commits, license names, and modification notes;
- the complete required license texts for copied code or dependencies where appropriate;
- an attribution screen or help entry if the applicable license requires a user-visible notice.

