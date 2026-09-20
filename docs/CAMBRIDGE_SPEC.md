# Cambridge C1 Advanced specification

Status: normative for product-format claims; Parts 1–8 implemented

Last verified: 2026-09-17

## Authority and use

Cambridge English official materials are the source of truth. This document records only the rules needed by the product and must be rechecked when Cambridge changes its published format. It is not an official Cambridge document.

Primary references:

- [C1 Advanced exam format](https://www.cambridgeenglish.org/exams-and-tests/qualifications/advanced/format/)
- [C1 Advanced preparation and sample-test information](https://www.cambridgeenglish.org/exams-and-tests/qualifications/advanced/preparation/)
- [C1 Advanced Handbook for teachers](https://www.cambridgeenglish.org/Images/167804-c1-advanced-handbook.pdf)

## Exam overview

The official format page states that the exam has four components and that paper-based and digital formats have the same content. C1 Trainer currently implements practice formats for Reading and Use of English Parts 1–8. Writing is paused while Phase 8.5 recalibrates and extends the dynamic training model.

| Component | Official duration | Parts / questions | Product status |
| --- | --- | --- | --- |
| Reading and Use of English | 1 h 30 min | 8 / 56 | Parts 1–8 implemented; recalibration active |
| Writing | 1 h 30 min | 2 | Paused until Phase 8.5 completes |
| Listening | about 40 min | 4 / 30 | Later |
| Speaking | 15 min per pair; 23 min per group of three | 4 | Later |

## Reading and Use of English

The full paper has eight parts, 56 questions, and 3,000–3,500 words to read in total. The implemented part contracts are:

| Part | Task | Items | Marking contract |
| --- | --- | ---: | --- |
| 1 | Multiple-choice cloze | 8 | 1 mark per correct answer; four options per gap |
| 2 | Open cloze | 8 | 1 mark per correct answer; one word per gap |
| 3 | Word formation | 8 | 1 mark per correct answer; prompt word must be transformed |
| 4 | Key word transformations | 6 | Up to 2 marks per answer; 3–6 words; keyword is used unchanged |
| 5 | Multiple-choice reading | 6 | 2 marks per correct answer; four options per question |
| 6 | Cross-text multiple matching | 4 | 2 marks per correct answer; four short texts |
| 7 | Gapped text | 6 | 2 marks per correct answer; seven paragraph options, one extra |
| 8 | Multiple matching | 10 | 1 mark per correct answer; a section may be selected more than once |

The official format describes Part 1 as testing vocabulary such as idioms, collocations, shades of meaning, phrasal verbs, and fixed phrases. Part 2 tests grammar and vocabulary; Part 3 vocabulary; and Part 4 grammar, vocabulary, and collocation. Parts 5–8 test combinations of detailed and global reading, opinion/attitude, comparison across texts, cohesion/coherence and specific-information matching as recorded in [`CAMBRIDGE_RULES.md`](CAMBRIDGE_RULES.md).

## Calibration boundary

Cambridge publishes the task structures above but does not publish a mandatory word range for each individual part. Phase 8.5 therefore records measured characteristics from two official public sample papers as **empirically derived internal targets**. They are not official rules and must never be described as such. See [`docs/calibration/`](calibration/README.md).

## Writing constraints recorded for later work

Both Writing tasks require 220–260 words. Part 1 is compulsory and is an essay; Part 2 is one choice from three situational tasks. Possible text types include essay, letter/email, proposal, report, and review. Writing is paused during Phase 8.5, but these limits must not be altered when it is implemented.

## Scoring boundary

The app may show raw practice marks using the item contracts above. It must not convert raw practice marks into a Cambridge English Scale score or pass grade unless a separately verified scoring specification is added.

## Copyright boundary

The app uses original content and short illustrative examples authored for the project. Official task descriptions may be paraphrased and linked; Cambridge examination passages, questions, answer keys, and substantial wording must not be copied into the repository.
