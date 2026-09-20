# Part 1 generation v2

Prompt version: `part1-generation-v2`.

The generator receives a server-created `GenerationBlueprint`, not arbitrary user text. The blueprint fixes Part 1, difficulty, domain, subtopic, genre, target-skill distribution, avoidance targets, seed and calibration profile version.

The prompt requires the model to write the complete coherent passage before selecting eight lexical decision points. Only then are the gaps inserted and the four options/explanations designed. This prevents eight isolated test sentences being joined into a paragraph.

The prompt emphasizes demanding but natural C1 educated English, coherent original prose, no Cambridge copying or close imitation, plausible same-domain distractors, exact answer uniqueness, no grammatical giveaways, adequate gap distance, explicit explanation contrasts and empirical benchmark targets. The targets are calibration observations, not official Cambridge word-count rules.

The output uses the existing strict candidate schema, extended compatibly to difficulty levels 2–5. The factory canonicalizes and validates it with the existing backend validator; IDs and provenance remain server/factory-owned.
