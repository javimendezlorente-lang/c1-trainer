# Part 7 benchmark — Gapped text

Status: Phase 8.5A baseline

## Official format rule

Cambridge defines a text with six removed paragraphs and seven paragraph options, one unused. Each correct placement is worth two marks. The focus is cohesion, coherence, text structure and global meaning. See the [official format page](https://www.cambridgeenglish.org/exams-and-tests/qualifications/advanced/format/) and [handbook](https://www.cambridgeenglish.org/Images/167804-c1-advanced-handbook.pdf).

## Observed official exemplars

The two official tasks measured 796 and 822 words across the base text plus all seven options, about 133–137 words per gap. These are empirical measurements and include the unused option.

Solutions depend on links across the gap: reference chains, lexical cohesion, chronology, contrast, topic development and paragraph function.

## Current corpus audit

The three seed tasks total 431, 440 and 435 words including paragraph options—about 54% of the observed mean. More importantly, their per-gap prompts describe what the missing paragraph “explains”, “presents” or “extends”. That extra semantic clue risks turning a cohesion task into prompted matching.

Severity: **HIGH** for length and **HIGH** for construct leakage.

## Empirically derived internal target

- 750–900 words across base text and seven options.
- Exactly six gaps and seven options, with one unused.
- Every correct option must link convincingly to both preceding and following context.
- Distractor options need plausible local links but fail on global structure or a precise reference.
- Learner-facing prompts should not paraphrase the missing paragraph’s answer-bearing function.

## Critic rubric and hard rejection

The critic must explain both forward and backward links for each placement, test each distractor in each gap and verify one coherent reconstructed text. Reject dangling references, two plausible placements, a distractor that fits nowhere trivially, topic-only matching or answer-leading prompt text.
