import fs from 'node:fs/promises'
import { validateAndCanonicalizePart1 } from '../../../backend/src/validation'
import { GenerationError } from '../../../backend/src/errors'
import { addUsage, ensureDir, incrementReason, loadManifest, readJsonl, saveManifest, writeJson, writeJsonl } from '../io'
import { runPath } from '../paths'
import { compareNovelty, exerciseEntry, loadCatalog } from '../novelty/fingerprints'
import type { BatchLine, CandidateRecord, GenerationBlueprint, RunManifest } from '../types'

interface BatchResultLine {
  custom_id: string
  response?: { status_code?: number; body?: Record<string, unknown>; request_id?: string }
  error?: { code?: string; message?: string } | null
}

function outputText(body: Record<string, unknown>): string | undefined {
  if (typeof body.output_text === 'string') return body.output_text
  const output = body.output
  if (!Array.isArray(output)) return undefined
  const parts = output.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const content = (item as Record<string, unknown>).content
    if (!Array.isArray(content)) return []
    return content.flatMap((entry) => entry && typeof entry === 'object' && typeof (entry as Record<string, unknown>).text === 'string' ? [(entry as Record<string, unknown>).text as string] : [])
  })
  return parts.join('') || undefined
}

function candidateId(customId: string): string {
  if (!/^[A-Za-z0-9_-]+$/u.test(customId)) throw new Error(`Unsafe batch custom_id: ${customId}`)
  return customId
}

function lexicalDuplicationIssues(candidate: ReturnType<typeof validateAndCanonicalizePart1>): string[] {
  const correct = candidate.questions.map((question) => question.options.find((option) => option.id === question.correctOptionId)?.text.trim().toLocaleLowerCase('en-US') ?? '')
  const duplicates = correct.filter((value, index) => correct.indexOf(value) !== index)
  return duplicates.length ? ['duplicate correct answer targets within candidate'] : []
}

function errorReason(error: unknown): string {
  if (error instanceof GenerationError) return error.code.toLocaleLowerCase('en-US')
  return 'malformed_batch_result'
}

export async function processGenerationResults(runId: string): Promise<RunManifest> {
  const manifest = await loadManifest(runId)
  const blueprints = await readJsonl<GenerationBlueprint>(runPath(runId, 'blueprints.jsonl'))
  const regenerationBlueprintFiles = await fs.readdir(runPath(runId)).catch(() => [])
  for (const file of regenerationBlueprintFiles.filter((name) => /^regeneration-[1-2]-blueprints\.jsonl$/u.test(name))) blueprints.push(...await readJsonl<GenerationBlueprint>(runPath(runId, file)))
  const blueprintMap = new Map(blueprints.map((blueprint) => [blueprint.customId, blueprint]))
  const resultFiles = ['raw-results.jsonl', ...regenerationBlueprintFiles.filter((name) => /^regeneration-[1-2]-results\.jsonl$/u.test(name))]
  const lines = (await Promise.all(resultFiles.map(async (file) => readJsonl<BatchResultLine>(runPath(runId, file)).catch(() => [])))).flat()
  const catalog = loadCatalog()
  const runCatalog = [...catalog]
  const queue: CandidateRecord[] = []
  await ensureDir(runPath(runId, 'candidates'))
  await ensureDir(runPath(runId, 'rejected'))

  for (const line of lines) {
    const blueprint = blueprintMap.get(line.custom_id)
    if (!blueprint) {
      incrementReason(manifest, 'unknown_custom_id')
      continue
    }
    if (!line.response || Number(line.response.status_code) !== 200 || line.error) {
      incrementReason(manifest, line.error?.code ?? 'upstream_error')
      continue
    }
    addUsage(manifest.generator, line.response.body?.usage as Record<string, unknown> | undefined)
    if (typeof line.response.body?.model === 'string') manifest.modelSnapshot = line.response.body.model
    const text = outputText(line.response.body ?? {})
    if (!text) {
      incrementReason(manifest, 'structured_output_failed')
      continue
    }
    try {
      const exercise = validateAndCanonicalizePart1(JSON.parse(text) as unknown, manifest.model)
      const lexicalIssues = lexicalDuplicationIssues(exercise)
      if (lexicalIssues.length) {
        incrementReason(manifest, 'lexical_duplication')
        await writeJson(runPath(runId, 'rejected', `${candidateId(line.custom_id)}.json`), { customId: line.custom_id, blueprint, reasons: lexicalIssues })
        continue
      }
      const novelty = compareNovelty(exercise, runCatalog)
      const entry = exerciseEntry(exercise, novelty.accepted ? 'candidate' : 'rejected', runId, blueprint.subtopic, blueprint.genre)
      runCatalog.push(entry)
      if (!novelty.accepted) {
        incrementReason(manifest, 'novelty')
        await writeJson(runPath(runId, 'rejected', `${candidateId(line.custom_id)}.json`), { customId: line.custom_id, blueprint, exercise, novelty })
        continue
      }
      const record: CandidateRecord = { customId: line.custom_id, blueprint, exercise, status: 'candidate' }
      queue.push(record)
      await writeJson(runPath(runId, 'candidates', `${candidateId(line.custom_id)}.json`), record)
    } catch (error) {
      const reason = errorReason(error)
      incrementReason(manifest, reason)
      await writeJson(runPath(runId, 'rejected', `${candidateId(line.custom_id)}.json`), { customId: line.custom_id, blueprint, reasons: [reason] })
    }
  }

  await writeJsonl(runPath(runId, 'quality-queue.jsonl'), queue)
  await writeJson(runPath(runId, 'catalog.json'), runCatalog)
  manifest.status = 'validated'
  manifest.failedBlueprints = Math.max(0, manifest.candidateCount - lines.length)
  await saveManifest(manifest)
  return manifest
}

export async function readQualityQueue(runId: string): Promise<CandidateRecord[]> {
  return readJsonl<CandidateRecord>(runPath(runId, 'quality-queue.jsonl'))
}
