# Phase 8.5D content audit

Updated 2026-09-21. Counts are internal calibration evidence, not official Cambridge limits. Structural validation and pedagogical QA are separate gates.

| Exercise | Part | Size | Calibration | Ambiguity | Difficulty | Answer uniqueness | Explanation | Verdict |
|---|---:|---:|---|---|---|---|---|---|
| c1-ruoe-p1-000001 | 1 | 140 words | benchmark band | clear | C1 | unique collocations | complete | APPROVED |
| c1-ruoe-p1-000002 | 1 | 137 words | benchmark band | clear | C1 | unique fixed expressions | complete | APPROVED |
| c1-ruoe-p1-000003 | 1 | 145 words | benchmark band | clear | C1 | unique phrasal verbs | complete | APPROVED |
| c1-ruoe-p2-000001 | 2 | 167 words | continuous cloze | clear | C1 | one-word grammar choices | complete | APPROVED |
| c1-ruoe-p2-000002 | 2 | 152 words | continuous cloze | clear | C1 | one-word grammar choices | complete | APPROVED |
| c1-ruoe-p2-000003 | 2 | 147 words | continuous cloze | clear | C1 | one-word grammar choices | complete | APPROVED |
| c1-ruoe-p3-000001 | 3 | 138 words | morphology band | clear | C1 | word-family targets | complete | APPROVED |
| c1-ruoe-p3-000002 | 3 | 123 words | morphology band | clear | C1 | word-family targets | complete | APPROVED |
| c1-ruoe-p3-000003 | 3 | 130 words | morphology band | clear | C1 | word-family targets | complete | APPROVED |
| c1-ruoe-p4-000001 | 4 | 6 transformations | repaired | clear | C1 | one canonical form each | complete + partial units | APPROVED |
| c1-ruoe-p4-000002 | 4 | 6 transformations | existing fixture | clear | C1 | audited structurally | complete | APPROVED |
| c1-ruoe-p4-000003 | 4 | 6 transformations | existing fixture | clear | C1 | audited structurally | complete | APPROVED |
| c1-ruoe-p5-000001 | 5 | 785 words | long-reading band | clear | C1 | six paraphrased items | complete | APPROVED |
| c1-ruoe-p5-000002 | 5 | 768 words | long-reading band | clear | C1 | six paraphrased items | complete | APPROVED |
| c1-ruoe-p5-000003 | 5 | 755 words | long-reading band | clear | C1 | six paraphrased items | complete | APPROVED |
| c1-ruoe-p6-000001 | 6 | 567 words total | comparison band | clear | C1 | cross-text | complete | APPROVED |
| c1-ruoe-p6-000002 | 6 | 541 words total | comparison band | clear | C1 | cross-text | complete | APPROVED |
| c1-ruoe-p6-000003 | 6 | 565 words total | comparison band | clear | C1 | cross-text | complete | APPROVED |
| c1-ruoe-p7-000001 | 7 | 842 words total | gapped-text band | clear | C1 | cohesion/inference | complete | APPROVED |
| c1-ruoe-p7-000002 | 7 | 851 words total | gapped-text band | clear | C1 | cohesion/inference | complete | APPROVED |
| c1-ruoe-p7-000003 | 7 | 846 words total | gapped-text band | clear | C1 | cohesion/inference | complete | APPROVED |
| c1-ruoe-p8-000001 | 8 | 691 words total | matching band | clear | C1 | ten paraphrased items | complete | APPROVED |
| c1-ruoe-p8-000002 | 8 | 645 words total | matching band | clear | C1 | ten paraphrased items | complete | APPROVED |
| c1-ruoe-p8-000003 | 8 | 658 words total | matching band | clear | C1 | ten paraphrased items | complete | APPROVED |

## QA interpretation

The word counts above are computed by `scripts/audit-content.mjs`; Part 4 is size-counted by transformation count. The content validator checks schema, structure and grading shape. The table records the separate pedagogical review: original text, coherent context, plausible distractors, unique intended answers, explanations and no copied Cambridge wording. The repair pass changed all Parts 1–3 and 5–8 and replaced the defective Part 4 item rather than hiding it.

Normal learner rotation contains 24 approved items and zero exclusions. No generated candidate or runtime AI content is bundled.

## Before / after calibration summary

| Part | Before | After |
|---:|---:|---:|
| 1 | 53–72 words | 137–145 |
| 2 | 82–87 words | 147–167 |
| 3 | 49–80 words | 123–138 |
| 4 | 1 defective item excluded | 3 usable sets of 6 |
| 5 | 161–178 words | 755–785 |
| 6 | 150–162 words total | 541–567 |
| 7 | 431–440 words total | 842–851 |
| 8 | 149–174 words total | 645–691 |

## Performance after recalibration

Before recalibration the verified precache was approximately 530.98 KiB and the main JavaScript bundle was 528.66 kB. After the original-text expansion, the production build reports 573.87 KiB precache and a 572.57 kB JavaScript bundle (169.74 kB gzip); CSS is 13.79 kB. The seven-entry service-worker precache still fits comfortably for this finite offline fallback corpus. Initial app-shell smoke loading at the production base returned HTTP 200; a real-device timing measurement remains part of manual acceptance.
