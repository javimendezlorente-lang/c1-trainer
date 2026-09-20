import fs from 'node:fs/promises'
import { part1Metrics } from '../../backend/src/validation'
import { modelCost, readJsonl, loadManifest, saveManifest, writeJson } from './io'
import { runPath } from './paths'
import type { CandidateRecord, GenerationBlueprint, RunManifest } from './types'

function distribution(values: string[]): string {
  const counts = new Map<string, number>()
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))
  return [...counts.entries()].sort((left, right) => left[0].localeCompare(right[0])).map(([key, count]) => `- ${key}: ${count}`).join('\n') || '- pending'
}

function numericSummary(values: number[]): string {
  if (!values.length) return 'pending'
  const sorted = [...values].sort((left, right) => left - right)
  return `min ${sorted[0]}, median ${sorted[Math.floor(sorted.length / 2)]}, max ${sorted.at(-1)}`
}

export async function writeRunReport(runId: string): Promise<string> {
  const manifest = await loadManifest(runId)
  const blueprints = await readJsonl<GenerationBlueprint>(runPath(runId, 'blueprints.jsonl'))
  const candidates = await readJsonl<CandidateRecord>(runPath(runId, 'quality-queue.jsonl')).catch(() => [])
  const accepted = await readJsonl<CandidateRecord>(runPath(runId, 'accepted.jsonl')).catch(() => [])
  const borderline = await fs.readdir(runPath(runId, 'borderline')).catch(() => [])
  const metrics = candidates.map((candidate) => part1Metrics(candidate.exercise))
  manifest.estimatedCostUsd = modelCost(manifest)
  await saveManifest(manifest)
  const report = [
    `# ${runId}`,
    '',
    `Status: ${manifest.status}`,
    '',
    '## Counts',
    '',
    `- Generated initial candidates: ${manifest.candidateCount}`,
    `- Schema/semantic/calibration/novelty/upstream rejected: ${manifest.rejected}`,
    `- Critic rejected: ${manifest.rejectionReasons.critic_rejected ?? 0}`,
    `- Borderline: ${manifest.borderline || borderline.length}`,
    `- Critic accepted for manual review: ${manifest.accepted || accepted.length}`,
    `- Regenerated: ${manifest.regenerated}`,
    `- Failed blueprints: ${manifest.failedBlueprints}`,
    '',
    '## Distribution evidence',
    '',
    `- Word count: ${numericSummary(metrics.map((metric) => metric.wordCount))}`,
    `- Gap spacing: ${numericSummary(metrics.flatMap((metric) => metric.gapSpacing))}`,
    `- Difficulty:\n${distribution(blueprints.map((blueprint) => String(blueprint.difficulty)))}`,
    `- Topic/domain:\n${distribution(blueprints.map((blueprint) => blueprint.domain))}`,
    `- Genre:\n${distribution(blueprints.map((blueprint) => blueprint.genre))}`,
    `- Skills:\n${distribution(blueprints.flatMap((blueprint) => Object.entries(blueprint.targetProfile).filter(([, count]) => count > 0).map(([skill]) => skill)))}`,
    '',
    '## Rejection reasons',
    '',
    distribution(Object.entries(manifest.rejectionReasons).flatMap(([reason, count]) => Array.from({ length: count }, () => reason))),
    '',
    '## API usage and cost',
    '',
    `- Generator tokens: input ${manifest.generator.inputTokens}, cached ${manifest.generator.cachedInputTokens}, output ${manifest.generator.outputTokens}, reasoning ${manifest.generator.reasoningTokens}, total ${manifest.generator.totalTokens}.`,
    `- Critic tokens: input ${manifest.critic.inputTokens}, cached ${manifest.critic.cachedInputTokens}, output ${manifest.critic.outputTokens}, reasoning ${manifest.critic.reasoningTokens}, total ${manifest.critic.totalTokens}.`,
    `- Adjudicator tokens: input ${manifest.adjudicator.inputTokens}, cached ${manifest.adjudicator.cachedInputTokens}, output ${manifest.adjudicator.outputTokens}, reasoning ${manifest.adjudicator.reasoningTokens}, total ${manifest.adjudicator.totalTokens}.`,
    `- Estimated cost: ${manifest.estimatedCostUsd === null ? 'not calculated; configure local per-million-token rates' : `$${manifest.estimatedCostUsd.toFixed(4)}`}.`,
    '',
    '## Manual audit',
    '',
    'Accepted candidates remain in `content/staging/part1/`; they are not approved automatically. Inspect at least 10 accepted, 10 rejected and every borderline candidate before promotion.',
    '',
  ].join('\n')
  await fs.writeFile(runPath(runId, 'report.md'), `${report}\n`, 'utf8')
  if (runId === 'P1-CALIBRATION-100') await fs.writeFile(new URL('../../docs/generation/PART1_CALIBRATION_100.md', import.meta.url), `${report}\n`, 'utf8')
  await writeJson(runPath(runId, 'report.json'), { manifest, metrics: metrics.map((metric) => ({ wordCount: metric.wordCount, gapSpacing: metric.gapSpacing, paragraphCount: metric.paragraphCount })) })
  return report
}
