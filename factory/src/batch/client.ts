import fs from 'node:fs'
import OpenAI from 'openai'
import { loadManifest, readJsonl, saveManifest, writeJsonl } from '../io'
import { runPath } from '../paths'
import type { BatchLine, RunManifest } from '../types'

function client(): OpenAI {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required for factory API commands and must be supplied locally')
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export async function submitBatch(runId: string, stage: 'generator' | 'critic'): Promise<string> {
  const openai = client()
  const inputPath = runPath(runId, stage === 'generator' ? 'batch-input.jsonl' : 'critic-input.jsonl')
  const file = await openai.files.create({ file: fs.createReadStream(inputPath), purpose: 'batch' })
  const batch = await openai.batches.create({ input_file_id: file.id, endpoint: '/v1/responses', completion_window: '24h', metadata: { runId, stage } })
  const manifest = await loadManifest(runId)
  if (stage === 'generator') manifest.batchId = batch.id
  else manifest.criticBatchId = batch.id
  manifest.status = stage === 'generator' ? 'submitted' : 'critic_submitted'
  await saveManifest(manifest)
  return batch.id
}

export async function submitRegenerationBatch(runId: string, attempt: number): Promise<string> {
  const openai = client()
  const inputPath = runPath(runId, `regeneration-${attempt}-input.jsonl`)
  const file = await openai.files.create({ file: fs.createReadStream(inputPath), purpose: 'batch' })
  const batch = await openai.batches.create({ input_file_id: file.id, endpoint: '/v1/responses', completion_window: '24h', metadata: { runId, stage: 'regeneration', attempt: String(attempt) } })
  const manifest = await loadManifest(runId)
  manifest.regenerationBatchIds ??= []
  manifest.regenerationBatchIds[attempt - 1] = batch.id
  manifest.status = 'submitted'
  await saveManifest(manifest)
  return batch.id
}

export async function getRegenerationStatus(runId: string, attempt: number): Promise<Record<string, unknown>> {
  const manifest = await loadManifest(runId)
  const id = manifest.regenerationBatchIds?.[attempt - 1]
  if (!id) throw new Error(`No regeneration batch id for attempt ${attempt}`)
  return (await client().batches.retrieve(id)) as unknown as Record<string, unknown>
}

export async function downloadRegenerationResults(runId: string, attempt: number): Promise<{ output: boolean; errors: boolean }> {
  const manifest = await loadManifest(runId)
  const id = manifest.regenerationBatchIds?.[attempt - 1]
  if (!id) throw new Error(`No regeneration batch id for attempt ${attempt}`)
  const batch = await client().batches.retrieve(id)
  let output = false
  let errors = false
  if (batch.output_file_id) {
    const text = await downloadFile(batch.output_file_id)
    await writeJsonl(runPath(runId, `regeneration-${attempt}-results.jsonl`), text.split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line)))
    output = true
  }
  if (batch.error_file_id) {
    const text = await downloadFile(batch.error_file_id)
    await writeJsonl(runPath(runId, `regeneration-${attempt}-errors.jsonl`), text.split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line)))
    errors = true
  }
  return { output, errors }
}

export async function getBatchStatus(runId: string, stage: 'generator' | 'critic'): Promise<Record<string, unknown>> {
  const manifest = await loadManifest(runId)
  const id = stage === 'generator' ? manifest.batchId : manifest.criticBatchId
  if (!id) throw new Error(`No ${stage} batch id in manifest`)
  const batch = await client().batches.retrieve(id)
  manifest.status = stage === 'generator' ? (batch.status === 'completed' ? 'completed' : 'in_progress') : (batch.status === 'completed' ? 'critic_completed' : 'in_progress')
  await saveManifest(manifest)
  return batch as unknown as Record<string, unknown>
}

async function downloadFile(fileId: string): Promise<string> {
  const response = await client().files.content(fileId)
  return response.text()
}

export async function downloadBatchResults(runId: string, stage: 'generator' | 'critic'): Promise<{ output: boolean; errors: boolean }> {
  const manifest = await loadManifest(runId)
  const id = stage === 'generator' ? manifest.batchId : manifest.criticBatchId
  if (!id) throw new Error(`No ${stage} batch id in manifest`)
  const batch = await client().batches.retrieve(id)
  let output = false
  let errors = false
  if (batch.output_file_id) {
    const text = await downloadFile(batch.output_file_id)
    await writeJsonl(runPath(runId, stage === 'generator' ? 'raw-results.jsonl' : 'critic-results.jsonl'), text.split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line)))
    output = true
  }
  if (batch.error_file_id) {
    const text = await downloadFile(batch.error_file_id)
    await writeJsonl(runPath(runId, `${stage}-errors.jsonl`), text.split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line)))
    errors = true
  }
  return { output, errors }
}

export async function batchInputLines(runId: string, stage: 'generator' | 'critic'): Promise<BatchLine[]> {
  return readJsonl<BatchLine>(runPath(runId, stage === 'generator' ? 'batch-input.jsonl' : 'critic-input.jsonl'))
}
