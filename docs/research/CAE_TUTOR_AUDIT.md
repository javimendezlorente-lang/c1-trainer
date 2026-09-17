# `violasgarbi/cae-tutor` audit

Audit snapshot: 2026-09-17  
Audited commit: `1d104eaa9669d25ade98ae77691aa3304de4ab04` (`initial release`)  
Repository: <https://github.com/violasgarbi/cae-tutor>

## Executive finding

This is a pedagogical/documentation source, not an application foundation. It is useful for exercise-generation constraints, feedback structure, and topic coverage. Its rules are not authoritative: Cambridge’s current official format must win whenever the two differ.

## License evidence

The repository README states CC BY-NC 4.0, and the audited tree contains `cae-tutor/LICENSE` and `cae-tutor/COPYRIGHT.md` identifying CC BY-NC 4.0. The material permits sharing and adaptation for non-commercial use with attribution and an indication of changes. The attribution and non-commercial conditions must be retained if licensed material is incorporated. Do not assume that an item in the repository has the same provenance merely because it is stored beside the license.

## Useful material

- `SKILL.md`: workflow for single exercises and full-paper simulations; strong originality and copyright guardrails; detailed generation constraints for Parts 1–8 and Writing.
- `references/exam-parts.md`: compact task-type and difficulty notes for Reading and Use of English, Writing, Listening, and Speaking.
- `references/writing-criteria.md`: a proposed four-criterion writing feedback framework and review checklist.
- `references/speaking-criteria.md`: useful later-stage speaking feedback concepts.
- `COPYRIGHT.md`: valuable policy language separating factual exam structure from protected expression and disclaiming Cambridge affiliation.

## Rule extraction and verification status

| Rule area | Extracted guidance | Status for C1 Trainer |
| --- | --- | --- |
| Part 1 | 8 gaps, four plausible options, collocations/fixed phrases, distractor explanations | USE after Cambridge format verification; add as content QA policy |
| Part 2 | 8 one-word grammar-focused gaps; avoid content-word ambiguity | USE as editorial QA policy; verify individual items manually |
| Part 3 | 8 transformed forms from capitalised roots; require real morphology | USE as editorial QA policy; schema/grader must enforce |
| Part 4 | Multiple accepted answers, keyword unchanged, word-count and meaning checks | USE after correcting the repository’s conflicting word limits; partial-credit rules need a project spec |
| Parts 5–8 | Inference, cohesion, cross-text uniqueness, indirect paraphrase, plausible distractors | DEFER to later part-specific specs and Cambridge verification |
| Writing | Four feedback dimensions, genre/register checks, 220–260 words | USE as coaching structure after independent wording and verification |
| Listening/Speaking | Advice/strategy rather than synthetic exercises | DEFER; do not infer a product requirement from the skill |
| Originality/copyright | Generate independently; do not reproduce Cambridge materials | KEEP as a hard project rule |
| Difficulty calibration | Require plausible distractors and C1-level lexical/grammatical decisions | ADAPT as review checklist, not as an automatic proof of CEFR level |

## Reuse decision by category

| Category | Decision | Treatment |
| --- | --- | --- |
| Exercise-generation constraints | ADAPT | Rewrite into project-owned specifications with attribution where licensed material is used. |
| Originality/copyright safeguards | KEEP/ADAPT | Incorporate the policy intent into `AGENTS.md` and content review. |
| Exam-format facts | VERIFY THEN ADAPT | Compare every fact with official Cambridge sources first. |
| Writing feedback categories | ADAPT | Use as internal coaching structure; do not copy any official Cambridge wording. |
| Prompts or large prose blocks | DO NOT COPY BY DEFAULT | Prefer independent wording and project-owned prompts. |
| Runtime “skill” file | DO NOT SHIP | The product needs deterministic content validation, not a runtime prompt. |

## Conflicts found

- `references/exam-parts.md` describes a lower word-count range for Part 4. Cambridge’s current official format says **3–6 words**, so the project specification uses 3–6.
- `SKILL.md` contains a later conflicting lower-bound note for Part 4. It is not used as an exam-format authority; the project specification uses 3–6 words.
- The writing reference includes an approximate “passing threshold” for the writing paper. It is not used for score prediction; C1 Trainer will show only internally defined practice metrics unless a separately verified scoring specification is added.
- The repository describes Listening and Speaking as advice-only in some places while also documenting full-paper session modes. This is a product-design choice, not evidence that the app should generate those papers.

## Recommendation

Use `cae-tutor` as a **reviewed pedagogical reference**. Extract concepts into original project documents, record attribution if any licensed expression is retained, and mark each exam rule as verified or unverified. Cambridge official materials remain the normative source. No `cae-tutor` runtime or exercise corpus should be copied into v0.1.
