# Part 1 content factory

Phase 8.5C makes a pre-generated, quality-controlled library the primary content architecture. The learner PWA does not call OpenAI when opening **New exercise**. The Cloudflare Worker from Phase 8.5B remains intact as a separately deployable runtime-generation proof of concept and possible future fallback, but it is not used by this factory.

## Pipeline

```text
GenerationBlueprint planner
→ independent JSONL requests
→ OpenAI Batch API /v1/responses
→ deterministic schema, semantic and calibration gates
→ lexical/corpus novelty catalog
→ gpt-5.6-terra structured critic
→ ACCEPT / REJECT / BORDERLINE policy
→ content/staging/part1/
→ manual audit
→ explicit content:promote
→ content/approved/part1/
```

The factory keeps the states distinct: deterministic survivors are `candidate`; deterministic or critic failures are `rejected`; critic `BORDERLINE` remains manual; critic survivors are `accepted` only for staging review; and only explicit promotion creates `approved` library content.

Batch input uses one request per blueprint, a stable `custom_id`, `store: false`, the configured generator model (`gpt-5.6-luna`) and Structured Outputs. OpenAI documents JSONL input, unique custom IDs, `/v1/responses`, out-of-order result delivery and the 24-hour completion window in the [Batch API guide](https://developers.openai.com/api/docs/guides/batch). The factory never relies on result line order.

## Local setup

```powershell
pnpm --dir backend install
pnpm --dir factory install
$env:OPENAI_API_KEY = 'set-locally-only'
```

Do not put the key in a file tracked by Git, a blueprint, candidate JSON, manifest or report. Normal CI installs and tests the factory without making API calls.

## Calibration run

The first real run is deliberately 100 candidates and is statistical, not a mass approval:

```powershell
npm run factory -- plan --run=P1-CALIBRATION-100 --count=100
npm run factory -- batch:build --run=P1-CALIBRATION-100
npm run factory -- batch:submit --run=P1-CALIBRATION-100
npm run factory -- batch:status --run=P1-CALIBRATION-100
npm run factory -- batch:download --run=P1-CALIBRATION-100
npm run factory -- process --run=P1-CALIBRATION-100
npm run factory -- critic:build --run=P1-CALIBRATION-100
npm run factory -- critic:submit --run=P1-CALIBRATION-100
npm run factory -- critic:status --run=P1-CALIBRATION-100
npm run factory -- critic:download --run=P1-CALIBRATION-100
npm run factory -- critic:process --run=P1-CALIBRATION-100
npm run factory -- report --run=P1-CALIBRATION-100
```

The API stages require the local key. Status and download may be repeated safely; generated artifacts remain under ignored `factory/runs/<run-id>/`. The factory does not retry indefinitely and enforces a maximum of two regeneration attempts per blueprint.

When regeneration is deliberately needed, only attempts 1 and 2 are accepted and rejection categories are passed back in a bounded blueprint field:

```powershell
npm run factory -- regenerate:build --run=P1-CALIBRATION-100 --attempt=1
npm run factory -- regenerate:submit --run=P1-CALIBRATION-100 --attempt=1
npm run factory -- regenerate:status --run=P1-CALIBRATION-100 --attempt=1
npm run factory -- regenerate:download --run=P1-CALIBRATION-100 --attempt=1
npm run factory -- process --run=P1-CALIBRATION-100
```

## Quality boundary

Candidates rejected by schema, semantic, calibration, lexical duplication or novelty checks never reach Terra. Critic scores cover Cambridge resemblance, C1 calibration, naturalness, coherence, distractor plausibility, answer uniqueness, lexical sophistication, gap quality, explanation correctness and pedagogical usefulness. A hard failure rejects regardless of mean score. Otherwise, critical dimensions must be at least 4/5, every dimension at least 3/5 and the mean at least 4/5. `BORDERLINE` is never automatically accepted.

Accepted candidates are written to ignored `content/staging/part1/`, not the learner library. After inspecting at least 10 accepted, 10 rejected and every borderline item, promotion requires an explicit confirmation:

```powershell
npm run content:promote -- --run=P1-CALIBRATION-100 --yes=true
```

Promotion re-validates the canonical schema, refuses duplicate IDs and updates the local catalog. It is the only factory command that writes to `content/approved/part1/`.

## Catalog and cost

The local catalog fingerprints bundled, candidate and promoted exercises. It records normalized passage hashes, word shingles, question hashes, option-set hashes, answer expressions, topic/subtopic, genre and skills. Exact duplicates are rejected; configurable Jaccard thresholds flag or reject near duplicates; repeated correct-answer expressions are limited by configuration. Embeddings are intentionally not used.

Token totals are stored separately for Luna, Terra and future Sol adjudication. Cost is calculated only when local per-million-token rates are supplied through `C1_FACTORY_*_USD_PER_MILLION` variables; otherwise reports explicitly say cost is not calculated rather than embedding stale prices.

Current status: implementation and mocked tests are complete; the real 100-candidate run, manual audit and promotion are pending a local API key and explicit operator execution.
