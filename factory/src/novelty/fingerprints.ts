import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import type { CanonicalPart1Exercise } from '../../../backend/src/types'
import { APPROVED_ROOT, CATALOG_PATH } from '../paths'
import type { CatalogEntry, NoveltyDecision } from '../types'
import { FACTORY_CONFIG } from '../config'

export function normalizeForFingerprint(value: string): string {
  return value.toLocaleLowerCase('en-US').normalize('NFKC').replace(/\{\{gap:[1-8]\}\}/gu, ' <gap> ').replace(/[^a-z0-9<]+/gu, ' ').trim().replace(/\s+/gu, ' ')
}

function digest(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function shingles(value: string, size = 3): Set<string> {
  const words = normalizeForFingerprint(value).split(' ').filter(Boolean)
  return new Set(words.slice(0, Math.max(0, words.length - size + 1)).map((_, index) => words.slice(index, index + size).join(' ')))
}

export function jaccard(left: Set<string>, right: Set<string>): number {
  const union = new Set([...left, ...right])
  if (!union.size) return 1
  let intersection = 0
  for (const value of left) if (right.has(value)) intersection += 1
  return intersection / union.size
}

export function exerciseEntry(exercise: CanonicalPart1Exercise, status: CatalogEntry['status'], runId?: string, subtopic = exercise.topic, genre = 'part1'): CatalogEntry {
  const passage = normalizeForFingerprint(exercise.content.text)
  const questions = exercise.questions.map((question) => normalizeForFingerprint(`${question.gap}|${question.options.map((option) => `${option.id}:${option.text}`).join('|')}|${question.correctOptionId}`))
  const optionSets = exercise.questions.map((question) => digest(question.options.map((option) => normalizeForFingerprint(option.text)).sort().join('|')))
  const correctAnswers = exercise.questions.map((question) => normalizeForFingerprint(question.options.find((option) => option.id === question.correctOptionId)?.text ?? ''))
  return {
    id: exercise.id,
    status,
    passageFingerprint: digest(passage),
    passageShingles: [...shingles(passage)],
    questionFingerprints: questions.map(digest),
    optionSetFingerprints: optionSets,
    correctAnswerExpressions: correctAnswers,
    topic: exercise.topic,
    subtopic,
    genre,
    skills: [exercise.skills.primarySkill, ...exercise.skills.secondarySkills],
    targetExpressions: correctAnswers,
    runId,
  }
}

export function loadCatalog(): CatalogEntry[] {
  if (fs.existsSync(CATALOG_PATH)) return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8')) as CatalogEntry[]
  if (!fs.existsSync(APPROVED_ROOT)) return []
  return fs.readdirSync(APPROVED_ROOT).filter((file) => file.endsWith('.json')).flatMap((file) => {
    try {
      const exercise = JSON.parse(fs.readFileSync(path.join(APPROVED_ROOT, file), 'utf8')) as CanonicalPart1Exercise
      return [exerciseEntry(exercise, 'bundled')]
    } catch {
      return []
    }
  })
}

export function compareNovelty(exercise: CanonicalPart1Exercise, catalog: CatalogEntry[]): NoveltyDecision {
  const candidate = exerciseEntry(exercise, 'candidate')
  const flags: string[] = []
  const comparedWith: string[] = []
  for (const existing of catalog) {
    if (existing.passageFingerprint === candidate.passageFingerprint) {
      flags.push('exact passage duplicate')
      comparedWith.push(existing.id)
      continue
    }
    if (existing.questionFingerprints.some((fingerprint) => candidate.questionFingerprints.includes(fingerprint))) {
      flags.push('exact question fingerprint duplicate')
      comparedWith.push(existing.id)
    }
    if (existing.optionSetFingerprints.some((fingerprint) => candidate.optionSetFingerprints.includes(fingerprint))) {
      flags.push('exact option-set fingerprint duplicate')
      comparedWith.push(existing.id)
    }
    const similarity = jaccard(new Set(existing.passageShingles ?? []), new Set(candidate.passageShingles ?? []))
    if (similarity >= FACTORY_CONFIG.novelty.nearDuplicateFlag) {
      flags.push(`near-duplicate similarity ${similarity.toFixed(3)}`)
      comparedWith.push(existing.id)
      if (similarity >= FACTORY_CONFIG.novelty.nearDuplicateReject) flags.push('near-duplicate rejection threshold')
    }
  }
  for (const expression of candidate.targetExpressions) {
    const repeated = catalog.filter((entry) => entry.correctAnswerExpressions.includes(expression)).length
    if (repeated >= FACTORY_CONFIG.novelty.maxTargetExpressionCount) flags.push(`target expression repetition: ${expression}`)
  }
  const rejected = flags.some((flag) => flag.includes('duplicate') || flag.includes('rejection threshold') || flag.includes('target expression repetition'))
  return { accepted: !rejected, flags: [...new Set(flags)], comparedWith: [...new Set(comparedWith)] }
}

export function writeCatalog(entries: CatalogEntry[]): void {
  fs.mkdirSync(path.dirname(CATALOG_PATH), { recursive: true })
  fs.writeFileSync(CATALOG_PATH, `${JSON.stringify(entries, null, 2)}\n`, 'utf8')
}
