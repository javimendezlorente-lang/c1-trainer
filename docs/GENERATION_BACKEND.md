# Generation backend

Phase 8.5B uses a separate Cloudflare Worker. GitHub Pages continues to serve the unchanged learner-facing React/PWA frontend; the Worker is only a protected generation service.

## Boundary

- Endpoint: `POST /api/generate/part1`.
- Authentication: `Authorization: Bearer <C1_TRAINER_ACCESS_TOKEN>`.
- Origins: explicit production GitHub Pages origin plus local Vite origins from `ALLOWED_ORIGINS`; wildcard CORS is not used.
- Secrets: `OPENAI_API_KEY` and `C1_TRAINER_ACCESS_TOKEN` exist only as Worker secrets or local `backend/.dev.vars`. They are not frontend variables, content, logs, fixtures or CI secrets.
- The browser submits a small structured blueprint. It cannot submit a prompt, model name, system message or arbitrary schema.

The Worker owns the `part1-v1` prompt, model configuration, candidate schema, calibration profile, server-generated ID, provenance and validation. The current generator is `gpt-5.6-luna`, with low reasoning effort and `store: false`. Structured Outputs is requested through the Responses API using the candidate JSON Schema; see the [Responses API reference](https://developers.openai.com/api/reference/typescript/resources/beta/subresources/responses/methods/create) and [Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs).

## Local development

```powershell
pnpm --dir backend install
Copy-Item backend/.dev.vars.example backend/.dev.vars
# Edit backend/.dev.vars locally; never commit it.
pnpm --dir backend dev
npm run generate:part1
```

The harness calls `http://127.0.0.1:8787/api/generate/part1` by default and writes the response to ignored `.tmp/generated/`. Override `C1_TRAINER_ENDPOINT`, `C1_TRAINER_ORIGIN` or `C1_TRAINER_DIFFICULTY` when needed. It prints model, prompt version, request ID, usage, latency and deterministic metrics without printing secrets.

## Deployment

Authenticate Wrangler with the intended Cloudflare account, then set secrets interactively:

```powershell
pnpm --dir backend exec wrangler login
pnpm --dir backend exec wrangler secret put OPENAI_API_KEY
pnpm --dir backend exec wrangler secret put C1_TRAINER_ACCESS_TOKEN
pnpm --dir backend deploy
```

Non-secret configuration is in `backend/wrangler.jsonc`. Before deployment, update `ALLOWED_ORIGINS` with the exact production frontend origin and set `C1_TRAINER_ENDPOINT` to the Worker URL for the harness. No OpenAI key is required by normal CI; CI uses mocked upstream responses.

## Safety and operations

The request body is size-limited and allowlisted. Responses are bounded by `max_output_tokens`; there are no recursive or unbounded retries. A best-effort per-client cooldown limits local/isolated Worker abuse; a durable account-wide quota is intentionally deferred until an authenticated deployment policy exists. Errors expose stable codes and request IDs, not provider payloads or secrets.

This is a generation proof of concept, not a learner-facing ready pool. It performs candidate schema, structural, semantic and calibration checks, then marks the result `review`; it does not yet run a critic, novelty engine, approval workflow or IndexedDB replenishment.
