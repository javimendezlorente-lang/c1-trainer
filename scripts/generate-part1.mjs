import { mkdir, readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'

const endpoint = process.env.C1_TRAINER_ENDPOINT ?? 'http://127.0.0.1:8787/api/generate/part1'
const origin = process.env.C1_TRAINER_ORIGIN ?? 'http://localhost:5173'

function readDevToken(contents) {
  const line = contents.split(/\r?\n/u).find((entry) => entry.startsWith('C1_TRAINER_ACCESS_TOKEN='))
  return line?.slice('C1_TRAINER_ACCESS_TOKEN='.length).trim() || undefined
}

async function resolveToken() {
  if (process.env.C1_TRAINER_ACCESS_TOKEN) return process.env.C1_TRAINER_ACCESS_TOKEN
  try {
    return readDevToken(await readFile('backend/.dev.vars', 'utf8'))
  } catch {
    return undefined
  }
}

function requestBody() {
  return {
    difficulty: process.env.C1_TRAINER_DIFFICULTY === 'demanding' ? 'demanding' : 'standard',
    blueprint: {
      topicDomain: 'urban ecology',
      genre: 'popular science article',
      targetSkills: ['collocation', 'semantic_precision', 'complementation'],
    },
  }
}

function safeJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text.slice(0, 1000) }
  }
}

const token = await resolveToken()
if (!token) {
  console.error('Missing C1_TRAINER_ACCESS_TOKEN. Set it in the environment or backend/.dev.vars.')
  process.exit(1)
}

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Origin: origin,
  },
  body: JSON.stringify(requestBody()),
})
const raw = await response.text()
const payload = safeJson(raw)

if (!response.ok) {
  console.error(`Generation failed (${response.status}):`, JSON.stringify(payload))
  process.exit(1)
}

const outputPath = `.tmp/generated/part1-${new Date().toISOString().replaceAll(':', '-')}.json`
await mkdir('.tmp/generated', { recursive: true })
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

const generation = payload.generation ?? {}
const exercise = payload.exercise ?? {}
const text = exercise.content?.text ?? ''
const words = text.replace(/\{\{gap:[1-8]\}\}/gu, ' ').match(/[A-Za-z]+(?:[’'][A-Za-z]+)?/gu) ?? []
const segments = text.split(/\{\{gap:[1-8]\}\}/gu)
const spacing = segments.slice(1, -1).map((segment) => (segment.match(/[A-Za-z]+(?:[’'][A-Za-z]+)?/gu) ?? []).length)
const paragraphs = text.split(/\n\s*\n/u).filter((paragraph) => paragraph.trim()).length

console.log(`Saved ${outputPath}`)
console.log(JSON.stringify({
  validator: 'server-validated canonical exercise',
  model: generation.model,
  promptVersion: generation.promptVersion,
  requestId: generation.requestId,
  usage: generation.usage,
  latencyMs: generation.latencyMs,
  wordCount: words.length,
  gapSpacing: spacing,
  paragraphCount: paragraphs,
}, null, 2))
