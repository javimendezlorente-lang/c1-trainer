import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { FACTORY_CONFIG } from './config'
import { runPath } from './paths'
import type { GenerationBlueprint, RunManifest, StageTelemetry } from './types'

export async function ensureDir(directory: string): Promise<void> {
  await fsp.mkdir(directory, { recursive: true })
}

export async function writeJson(filePath: string, value: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath))
  await fsp.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fsp.readFile(filePath, 'utf8')) as T
}

export async function writeJsonl(filePath: string, values: unknown[]): Promise<void> {
  await ensureDir(path.dirname(filePath))
  await fsp.writeFile(filePath, `${values.map((value) => JSON.stringify(value)).join('\n')}\n`, 'utf8')
}

export async function readJsonl<T>(filePath: string): Promise<T[]> {
  const contents = await fsp.readFile(filePath, 'utf8')
  return contents.split(/\r?\n/u).filter((line) => line.trim()).map((line) => JSON.parse(line) as T)
}

export function emptyTelemetry(): StageTelemetry {
  return { inputTokens: 0, cachedInputTokens: 0, outputTokens: 0, reasoningTokens: 0, totalTokens: 0, requests: 0 }
}

export function emptyManifest(runId: string, candidateCount: number): RunManifest {
  return {
    runId,
    createdAt: new Date().toISOString(),
    model: FACTORY_CONFIG.generatorModel,
    modelSnapshot: null,
    criticModel: FACTORY_CONFIG.criticModel,
    promptVersion: FACTORY_CONFIG.promptVersion,
    calibrationProfileVersion: FACTORY_CONFIG.calibrationProfileVersion,
    candidateCount,
    reasoningEffort: FACTORY_CONFIG.reasoningEffort,
    batchId: null,
    criticBatchId: null,
    regenerationBatchIds: [],
    status: 'planned',
    generator: emptyTelemetry(),
    critic: emptyTelemetry(),
    adjudicator: emptyTelemetry(),
    accepted: 0,
    rejected: 0,
    borderline: 0,
    regenerated: 0,
    failedBlueprints: 0,
    rejectionReasons: {},
    estimatedCostUsd: null,
  }
}

export async function loadManifest(runId: string): Promise<RunManifest> {
  return readJson<RunManifest>(runPath(runId, 'manifest.json'))
}

export async function saveManifest(manifest: RunManifest): Promise<void> {
  await writeJson(runPath(manifest.runId, 'manifest.json'), manifest)
}

export function incrementReason(manifest: RunManifest, reason: string): void {
  manifest.rejectionReasons[reason] = (manifest.rejectionReasons[reason] ?? 0) + 1
  manifest.rejected += 1
}

export function addUsage(target: StageTelemetry, usage: Record<string, unknown> | undefined): void {
  target.requests += 1
  target.inputTokens += Number(usage?.input_tokens ?? 0)
  target.cachedInputTokens += Number(usage?.input_tokens_details && typeof usage.input_tokens_details === 'object' ? (usage.input_tokens_details as Record<string, unknown>).cached_tokens ?? 0 : 0)
  target.outputTokens += Number(usage?.output_tokens ?? 0)
  target.reasoningTokens += Number(usage?.output_tokens_details && typeof usage.output_tokens_details === 'object' ? (usage.output_tokens_details as Record<string, unknown>).reasoning_tokens ?? 0 : 0)
  target.totalTokens += Number(usage?.total_tokens ?? 0)
}

export function modelCost(manifest: RunManifest): number | null {
  const rates = {
    lunaInput: Number(process.env.C1_FACTORY_LUNA_INPUT_USD_PER_MILLION),
    lunaOutput: Number(process.env.C1_FACTORY_LUNA_OUTPUT_USD_PER_MILLION),
    terraInput: Number(process.env.C1_FACTORY_TERRA_INPUT_USD_PER_MILLION),
    terraOutput: Number(process.env.C1_FACTORY_TERRA_OUTPUT_USD_PER_MILLION),
    solInput: Number(process.env.C1_FACTORY_SOL_INPUT_USD_PER_MILLION),
    solOutput: Number(process.env.C1_FACTORY_SOL_OUTPUT_USD_PER_MILLION),
  }
  const baseRates = [rates.lunaInput, rates.lunaOutput, rates.terraInput, rates.terraOutput]
  if (!baseRates.every((value) => Number.isFinite(value) && value >= 0)) return null
  if (manifest.adjudicator.totalTokens > 0 && ![rates.solInput, rates.solOutput].every((value) => Number.isFinite(value) && value >= 0)) return null
  const adjudicatorCost = manifest.adjudicator.totalTokens > 0 ? manifest.adjudicator.inputTokens * rates.solInput + manifest.adjudicator.outputTokens * rates.solOutput : 0
  return (manifest.generator.inputTokens * rates.lunaInput + manifest.generator.outputTokens * rates.lunaOutput + manifest.critic.inputTokens * rates.terraInput + manifest.critic.outputTokens * rates.terraOutput + adjudicatorCost) / 1_000_000
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath)
}
