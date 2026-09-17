# Cambridge C1 Advanced rules used by the domain contract

This document separates facts published by Cambridge English from C1 Trainer's internal training policies. Cambridge documentation is authoritative for exam format and marks. C1 Trainer is an independent, personal, non-commercial study tool and is not affiliated with Cambridge English.

## Official rules

The authoritative reference is the [Cambridge C1 Advanced exam format page](https://www.cambridgeenglish.org/exams-and-tests/qualifications/advanced/format/). The [Cambridge preparation page](https://www.cambridgeenglish.org/exams-and-tests/qualifications/advanced/preparation/) provides the same question and mark summary for sample-test instructions.

Reading and Use of English has eight parts and 56 questions:

| Part | Cambridge task | Questions | Marks |
| --- | --- | ---: | ---: |
| 1 | Multiple-choice cloze | 8 | 1 each |
| 2 | Open cloze | 8 | 1 each |
| 3 | Word formation | 8 | 1 each |
| 4 | Key word transformations | 6 | up to 2 each |
| 5 | Multiple choice reading | 6 | 2 each |
| 6 | Cross-text multiple matching | 4 | 2 each |
| 7 | Gapped text | 6 | 2 each |
| 8 | Multiple matching | 10 | 1 each |
| **Total** |  | **56** | **78** |

For Part 4, Cambridge specifies that the answer uses **three to six words**, including the given key word. The key word must not be changed, and the completed sentence must have the same meaning as the original. Each question carries up to two marks.

## Internal training policies

- `difficulty` is an ordinal calibration from 1 to 5, not an official Cambridge classification.
- The schema uses `{{answer}}` as the internal marker for the single answer gap in a Part 4 second sentence. This is a content-format convention, not an exam claim.
- Part 4 word counting trims surrounding whitespace and treats runs of whitespace as separators. Punctuation stays attached to a token; apostrophes and hyphens inside a token do not split it. Cambridge's public format page does not define every punctuation and hyphenation edge case, so this is explicitly an internal validation policy.
- Answer acceptance is represented as data (`canonicalAnswer` plus `acceptedAnswers`). Grading and partial-credit rules are later milestones and are not inferred by this schema.
- C1 Trainer reports raw practice marks only. It does not predict official Cambridge English Scale scores.

## Scope boundary

This milestone encodes Parts 1–4 because those are the first exercise-domain contracts. The type names for Parts 5–8 are reserved in the schema architecture, but their content schemas and graders are deferred.
