# Part 1 benchmark — Multiple-choice cloze

Status: Phase 8.5A baseline

## Official format rule

Cambridge defines one modified cloze with eight gaps and four options per gap, one mark each. The focus includes vocabulary, idioms, collocations, fixed phrases, complementation, phrasal verbs and semantic precision. See the [official format page](https://www.cambridgeenglish.org/exams-and-tests/qualifications/advanced/format/) and [handbook](https://www.cambridgeenglish.org/Images/167804-c1-advanced-handbook.pdf).

Cambridge does not publish a mandatory Part 1 word range or gap-spacing formula. The values below are measurements, not official rules.

## Observed official exemplars

Two official sample tasks were measured without retaining their text:

| Metric | Sample 1 | Sample 2 |
| --- | ---: | ---: |
| Running words, excluding gap markers | 154 | 135 |
| Paragraphs | 3 | 3 |
| Median words between consecutive gaps | 15 | 12 |
| Minimum words between consecutive gaps | 9 | 7 |
| Mean sentence length | 17.1 | 24.8 |
| Median sentence length | 19.5 | 25.5 |

The gap intervals are varied rather than mechanically even. The prose remains readable as a coherent short article rather than eight answer-bearing clauses packed together.

Qualitative inspection found plausible alternatives drawn from the same lexical domain. The distinction typically depends on collocation, complementation, register, semantic nuance or fixed expression—not on one obviously ungrammatical distractor.

## Current corpus audit

| Seed item | Words | Median inter-gap words | Minimum | Paragraphs | Finding |
| --- | ---: | ---: | ---: | ---: | --- |
| `...000001` | 42 | 4 | 3 | 1 | **CRITICAL:** compressed; several admitted alternative answers |
| `...000002` | 80 | 7 | 4 | 1 | **HIGH:** short, dense, long sentences |
| `...000003` | 80 | 8 | 3 | 1 | **HIGH:** short; repeated phrasal-verb pattern narrows task range |

The first seed’s own distractor explanations admit that several alternatives are possible. “Intended phrasing” is not enough to establish a unique answer. It must not remain learner-approved in its current form.

## Empirically derived internal target

- 130–170 running words, two to four paragraphs.
- Exactly eight gaps and four options per gap.
- At least six running words between consecutive gaps; median 11–20.
- Natural sentence-length variation; reject mechanically uniform or overloaded prose.
- A planned mix of collocation, lexical precision, fixed/phrasal expression and complementation where natural.
- Every distractor must be plausible in the semantic neighborhood but wrong in the exact context.

These are provisional Phase 8.5 generation guardrails. Small deviations require critic justification rather than automatic acceptance.

## Critic rubric and hard rejection

The critic must independently assess CEFR demand, lexical sophistication, collocational precision, distractor plausibility, semantic nuance, answer uniqueness, prose authenticity, spacing and explanation correctness. Every critical dimension must pass.

Hard reject multiple defensible options, B1/B2 giveaway items, malformed or nonsensical distractors, unnatural prose, misleading explanations, recent-target repetition and material length/spacing failure.

## Generation blueprint requirements

A request must specify genre, domain/subtopic, target category counts, difficulty, recent topics/expressions/answer lemmas to avoid and a prompt version. A generic “generate Part 1” prompt is non-compliant.

Before expanding generation beyond Part 1, 20 real pipeline candidates must be audited under this profile and the acceptance report required by [PHASE_8_5_SPEC.md](../PHASE_8_5_SPEC.md) must pass.
