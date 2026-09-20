# Part 1 generation contract v1

Status: Phase 8.5B proof-of-concept contract.

## Request

The only accepted route is `POST /api/generate/part1`. The request contains exactly `difficulty` (`standard` or `demanding`) and a server-checked `blueprint` with an allowlisted topic domain, genre and two to four target skills. Prompt text, model names, system instructions and unknown fields are rejected.

## Generation

Prompt version: `part1-v1`.

The server uses the Part 1 profile in [`CALIBRATION_PROFILES.json`](../calibration/CALIBRATION_PROFILES.json): original C1-level magazine/popular-science prose, eight gaps, four options per gap, one defensible answer, and the measured running-word, spacing and paragraph targets. The prompt forbids copied Cambridge text and requires explanations. The initial model is `gpt-5.6-luna`; the Responses API request uses Structured Outputs, `store: false`, low reasoning effort and a bounded output budget.

## Transformation and gates

The model returns a candidate without identity or provenance. The Worker then:

1. validates the strict candidate JSON Schema;
2. checks q1–q8/gap1–gap8 order, A–D options, uniqueness, correct-option membership and explanations;
3. checks word count, gap spacing and paragraph count against the calibration profile;
4. adds `gen-c1-p1-<uuid-v4>`, canonical `part/type`, exam/paper metadata and `original_ai` provenance;
5. validates the transformed exercise against the authoritative canonical schema.

The result is still `review`, never automatically approved. Critic, novelty, finite regeneration policy, ready-pool storage and learner UI integration belong to later subphases.
