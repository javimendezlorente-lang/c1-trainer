import { addUsage, ensureDir, incrementReason, loadManifest, readJsonl, saveManifest, writeJson, writeJsonl } from '../io'
import { runPath, STAGING_ROOT } from '../paths'
import { criticJsonl } from '../batch/critic'
import { parseCriticResult, policyDecision } from './review'
import type { BatchLine, CandidateRecord, RunManifest } from '../types'

interface CriticBatchResultLine {
  custom_id: string
  response?: { status_code?: number; body?: Record<string, unknown> }
  error?: { code?: string; message?: string } | null
}

function criticOutputText(body: Record<string, unknown>): string | undefined {
  if (typeof body.output_text === 'string') return body.output_text
  const output = body.output
  if (!Array.isArray(output)) return undefined
  const text = output.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const content = (item as Record<string, unknown>).content
    if (!Array.isArray(content)) return []
    return content.flatMap((entry) => entry && typeof entry === 'object' && typeof (entry as Record<string, unknown>).text === 'string' ? [(entry as Record<string, unknown>).text as string] : [])
  }).join('')
  return text || undefined
}

export async function buildCriticInput(runId: string): Promise<number> {
  const candidates = await readJsonl<CandidateRecord>(runPath(runId, 'quality-queue.jsonl'))
  const criticLines = criticJsonl(candidates).trim().split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line) as BatchLine)
  await writeJsonl(runPath(runId, 'critic-input.jsonl'), criticLines)
  const manifest = await loadManifest(runId)
  manifest.status = 'critic_input_built'
  await saveManifest(manifest)
  return criticLines.length
}

export async function processCriticResults(runId: string): Promise<RunManifest> {
  const manifest = await loadManifest(runId)
  const candidates = await readJsonl<CandidateRecord>(runPath(runId, 'quality-queue.jsonl'))
  const candidateMap = new Map(candidates.map((candidate) => [`${candidate.customId}-critic`, candidate]))
  const lines = await readJsonl<CriticBatchResultLine>(runPath(runId, 'critic-results.jsonl'))
  await ensureDir(runPath(runId, 'accepted'))
  await ensureDir(runPath(runId, 'borderline'))
  await ensureDir(runPath(runId, 'rejected'))
  await ensureDir(STAGING_ROOT)
  const accepted: CandidateRecord[] = []

  for (const line of lines) {
    const candidate = candidateMap.get(line.custom_id)
    if (!candidate) {
      incrementReason(manifest, 'critic_unknown_custom_id')
      continue
    }
    addUsage(manifest.critic, line.response?.body?.usage as Record<string, unknown> | undefined)
    if (!line.response || Number(line.response.status_code) !== 200 || line.error) {
      incrementReason(manifest, 'critic_upstream_error')
      continue
    }
    try {
      const text = criticOutputText(line.response.body ?? {})
      if (!text) throw new Error('critic_structured_output_failed')
      const critic = parseCriticResult(JSON.parse(text) as unknown)
      const status = policyDecision(critic)
      const record: CandidateRecord = { ...candidate, status, critic }
      if (status === 'accepted') {
        manifest.accepted += 1
        accepted.push(record)
        await writeJson(runPath(runId, 'accepted', `${candidate.exercise.id}.json`), record)
        await writeJson(`${STAGING_ROOT}/${candidate.exercise.id}.json`, candidate.exercise)
      } else if (status === 'borderline') {
        manifest.borderline += 1
        await writeJson(runPath(runId, 'borderline', `${candidate.exercise.id}.json`), record)
      } else {
        incrementReason(manifest, 'critic_rejected')
        await writeJson(runPath(runId, 'rejected', `${candidate.exercise.id}.json`), record)
      }
    } catch {
      incrementReason(manifest, 'critic_malformed_output')
      await writeJson(runPath(runId, 'rejected', `${candidate.exercise.id}.json`), { ...candidate, rejectionReasons: ['critic_malformed_output'] })
    }
  }

  await writeJsonl(runPath(runId, 'accepted.jsonl'), accepted)
  manifest.status = 'ready_for_manual_review'
  manifest.completedAt = new Date().toISOString()
  await saveManifest(manifest)
  return manifest
}
