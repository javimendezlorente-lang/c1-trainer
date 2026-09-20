import fs from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { validCandidate } from '../../backend/test/fixtures'
import { emptyManifest, readJsonl, writeJson, writeJsonl } from '../src/io'
import { processGenerationResults } from '../src/batch/process'
import { planPart1 } from '../src/planner'
import { runPath } from '../src/paths'
import type { GenerationBlueprint } from '../src/types'

describe('batch result reconciliation', () => {
  it('maps results by custom_id and rejects malformed responses safely', async () => {
    const runId = 'TEST-RECONCILE'
    const blueprints = planPart1(runId, 2, 'reconcile')
    await writeJson(runPath(runId, 'manifest.json'), emptyManifest(runId, 2))
    await writeJsonl(runPath(runId, 'blueprints.jsonl'), blueprints)
    await writeJsonl(runPath(runId, 'raw-results.jsonl'), [
      { custom_id: blueprints[1].customId, response: { status_code: 200, body: { output_text: JSON.stringify(validCandidate()), usage: { input_tokens: 4, output_tokens: 5, total_tokens: 9 } } } },
      { custom_id: blueprints[0].customId, response: { status_code: 200, body: { output_text: '{not-json}' } } },
    ])
    const manifest = await processGenerationResults(runId)
    expect(manifest.status).toBe('validated')
    expect(manifest.rejectionReasons.malformed_batch_result).toBe(1)
    expect((await readJsonl(runPath(runId, 'quality-queue.jsonl'))).length).toBe(1)
    await fs.rm(runPath(runId), { recursive: true, force: true })
  })
})
