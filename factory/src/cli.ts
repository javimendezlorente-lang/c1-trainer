import fs from 'node:fs/promises'
import path from 'node:path'
import { buildGenerationBatch, buildRegenerationBatch, toJsonl } from './batch/build'
import { downloadBatchResults, downloadRegenerationResults, getBatchStatus, getRegenerationStatus, submitBatch, submitRegenerationBatch } from './batch/client'
import { buildCriticInput, processCriticResults } from './quality/process'
import { planPart1 } from './planner'
import { ensureDir, emptyManifest, loadManifest, readJsonl, saveManifest, writeJson, writeJsonl } from './io'
import { APPROVED_ROOT, CATALOG_PATH, runPath, STAGING_ROOT } from './paths'
import { loadCatalog, exerciseEntry, writeCatalog } from './novelty/fingerprints'
import { processGenerationResults } from './batch/process'
import { writeRunReport } from './report'
import { validateCanonicalPart1 } from '../../backend/src/validation'
import type { GenerationBlueprint, CandidateRecord } from './types'

function option(name: string): string | undefined {
  const argument = process.argv.find((value) => value.startsWith(`--${name}=`))
  return argument?.slice(name.length + 3)
}

function requiredOption(name: string): string {
  const value = option(name)
  if (!value) throw new Error(`Missing --${name}=...`)
  return value
}

async function plan(): Promise<void> {
  const runId = requiredOption('run')
  const count = Number(option('count') ?? '100')
  const seed = option('seed') ?? runId
  const blueprints = planPart1(runId, count, seed)
  await ensureDir(runPath(runId))
  await writeJson(runPath(runId, 'manifest.json'), emptyManifest(runId, count))
  await writeJsonl(runPath(runId, 'blueprints.jsonl'), blueprints)
  console.log(JSON.stringify({ runId, count, firstCustomId: blueprints[0].customId, lastCustomId: blueprints.at(-1)?.customId }, null, 2))
}

async function buildBatch(): Promise<void> {
  const runId = requiredOption('run')
  const blueprints = await readJsonl<GenerationBlueprint>(runPath(runId, 'blueprints.jsonl'))
  await fs.writeFile(runPath(runId, 'batch-input.jsonl'), toJsonl(buildGenerationBatch(blueprints)), 'utf8')
  const manifest = await loadManifest(runId)
  manifest.status = 'batch_input_built'
  await saveManifest(manifest)
  console.log(`Built ${blueprints.length} independent Responses requests for ${runId}`)
}

async function buildRegeneration(): Promise<void> {
  const runId = requiredOption('run')
  const attempt = Number(option('attempt') ?? '1')
  if (!Number.isInteger(attempt) || attempt < 1 || attempt > 2) throw new Error('Use --attempt=1 or --attempt=2')
  const files = await fs.readdir(runPath(runId, 'rejected'))
  const blueprints: GenerationBlueprint[] = []
  for (const file of files.filter((file) => file.endsWith('.json'))) {
    const record = JSON.parse(await fs.readFile(runPath(runId, 'rejected', file), 'utf8')) as { blueprint?: GenerationBlueprint; reasons?: string[]; novelty?: { flags?: string[] } }
    if (!record.blueprint) continue
    const reasons = [...(record.reasons ?? []), ...(record.novelty?.flags ?? [])].slice(0, 5)
    blueprints.push({ ...record.blueprint, customId: `${record.blueprint.customId}-retry-${attempt}`, attempt, previousRejectionReasons: reasons })
  }
  if (!blueprints.length) throw new Error('No rejected blueprints available for regeneration')
  await writeJsonl(runPath(runId, `regeneration-${attempt}-blueprints.jsonl`), blueprints)
  await fs.writeFile(runPath(runId, `regeneration-${attempt}-input.jsonl`), toJsonl(buildRegenerationBatch(blueprints, attempt)), 'utf8')
  const manifest = await loadManifest(runId)
  manifest.regenerated += blueprints.length
  await saveManifest(manifest)
  console.log(`Built ${blueprints.length} regeneration requests for attempt ${attempt}`)
}

async function promote(): Promise<void> {
  const runId = requiredOption('run')
  if (option('yes') !== 'true') throw new Error('Promotion is deliberate: repeat with --yes=true after manual audit')
  const records = await readJsonl<CandidateRecord>(runPath(runId, 'accepted.jsonl'))
  if (!records.length) throw new Error(`No accepted records for ${runId}`)
  await ensureDir(APPROVED_ROOT)
  const existing = new Set((await fs.readdir(APPROVED_ROOT)).filter((file) => file.endsWith('.json')))
  const catalog = loadCatalog()
  let promoted = 0
  for (const record of records) {
    const filename = `${record.exercise.id}.json`
    if (existing.has(filename)) throw new Error(`Duplicate approved filename: ${filename}`)
    const exercise = { ...record.exercise, source: { ...record.exercise.source, reviewStatus: 'approved' as const } }
    validateCanonicalPart1(exercise)
    await fs.writeFile(path.join(APPROVED_ROOT, filename), `${JSON.stringify(exercise, null, 2)}\n`, 'utf8')
    catalog.push(exerciseEntry(exercise, 'approved', runId, record.blueprint.subtopic, record.blueprint.genre))
    promoted += 1
  }
  writeCatalog(catalog)
  const manifest = await loadManifest(runId)
  manifest.status = 'promoted'
  await saveManifest(manifest)
  console.log(JSON.stringify({ runId, promoted, catalogPath: CATALOG_PATH }, null, 2))
}

async function main(): Promise<void> {
  const command = process.argv[2]
  switch (command) {
    case 'plan': await plan(); return
    case 'batch:build': await buildBatch(); return
    case 'batch:submit': console.log(await submitBatch(requiredOption('run'), 'generator')); return
    case 'batch:status': console.log(JSON.stringify(await getBatchStatus(requiredOption('run'), 'generator'), null, 2)); return
    case 'batch:download': console.log(JSON.stringify(await downloadBatchResults(requiredOption('run'), 'generator'), null, 2)); return
    case 'regenerate:build': await buildRegeneration(); return
    case 'regenerate:submit': console.log(await submitRegenerationBatch(requiredOption('run'), Number(option('attempt') ?? '1'))); return
    case 'regenerate:status': console.log(JSON.stringify(await getRegenerationStatus(requiredOption('run'), Number(option('attempt') ?? '1')), null, 2)); return
    case 'regenerate:download': console.log(JSON.stringify(await downloadRegenerationResults(requiredOption('run'), Number(option('attempt') ?? '1')), null, 2)); return
    case 'process': await processGenerationResults(requiredOption('run')); return
    case 'critic:build': console.log(`Built ${await buildCriticInput(requiredOption('run'))} critic requests`); return
    case 'critic:submit': console.log(await submitBatch(requiredOption('run'), 'critic')); return
    case 'critic:status': console.log(JSON.stringify(await getBatchStatus(requiredOption('run'), 'critic'), null, 2)); return
    case 'critic:download': console.log(JSON.stringify(await downloadBatchResults(requiredOption('run'), 'critic'), null, 2)); return
    case 'critic:process': await processCriticResults(requiredOption('run')); return
    case 'report': console.log(await writeRunReport(requiredOption('run'))); return
    case 'promote': await promote(); return
    default: throw new Error('Usage: plan | batch:build | batch:submit | batch:status | batch:download | regenerate:build | regenerate:submit | regenerate:status | regenerate:download | process | critic:build | critic:submit | critic:status | critic:download | critic:process | report | promote')
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Factory command failed')
  process.exitCode = 1
})
