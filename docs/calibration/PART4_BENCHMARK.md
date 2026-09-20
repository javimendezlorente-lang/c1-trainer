# Part 4 benchmark — Key word transformation

Status: Phase 8.5A baseline

## Official format rule

Cambridge defines six separate transformations. The second sentence must have the same meaning as the first and be completed with three to six words, including the unchanged key word. Each item carries up to two marks. See the [official format page](https://www.cambridgeenglish.org/exams-and-tests/qualifications/advanced/format/) and [handbook](https://www.cambridgeenglish.org/Images/167804-c1-advanced-handbook.pdf).

Unlike the cloze/reading parts, passage length is not a useful calibration metric. Validity depends on equivalence, grammar, constraint satisfaction and the scoring units.

## Current corpus audit

All three files contain six items and the stored canonical answers pass the current 3–6-token validator. That does not establish a valid completed sentence.

`c1-ruoe-p4-000001:q1` currently produces a duplicated clause after insertion: the canonical answer already contains words that also follow the placeholder. This is a **CRITICAL** learner-content failure and shows that validating the answer fragment alone is insufficient.

Several other transformations are grammatical but awkward or debatable in naturalness/equivalence. These require human or independent-critic review before use as calibration exemplars.

## Internal target

- Exactly six items; canonical and accepted answers use three to six words including the unchanged keyword.
- The fully reconstructed second sentence is grammatical and natural.
- Meaning is equivalent to the first sentence, including tense, modality, polarity, agency, degree and register.
- Every accepted variant is independently checked in the completed sentence.
- Up-to-two-mark scoring units are explicit and do not award a point for a fragment that changes the meaning.
- Target structures vary across grammar, vocabulary and collocation rather than repeating one template.

## Critic rubric and hard rejection

The critic receives the original sentence, key word, completed canonical sentence, every accepted completed sentence and proposed scoring units. Reject duplication, ungrammatical completion, altered meaning, changed keyword, wrong word count, dubious partial credit or an unlisted common equivalent that makes grading unfair.

The validator must gain a completed-sentence test before Part 4 generation begins in 8.5F. The schema itself need not change to add this semantic validation.
