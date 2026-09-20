import Ajv2020 from 'ajv/dist/2020.js'
import sharedSchema from '../../schemas/c1/v1/shared.schema.json'
import part1Schema from '../../schemas/c1/v1/part1.schema.json'
import part2Schema from '../../schemas/c1/v1/part2.schema.json'
import part3Schema from '../../schemas/c1/v1/part3.schema.json'
import part4Schema from '../../schemas/c1/v1/part4.schema.json'
import part5Schema from '../../schemas/c1/v1/part5.schema.json'
import part6Schema from '../../schemas/c1/v1/part6.schema.json'
import part7Schema from '../../schemas/c1/v1/part7.schema.json'
import part8Schema from '../../schemas/c1/v1/part8.schema.json'
import exerciseSchema from '../../schemas/c1/v1/exercise.schema.json'
import candidateSchema from './generation/part1Candidate.schema.json'
import { GENERATION_CONFIG } from './config'
import { PART1_CALIBRATION } from './generation/calibration'
import { GenerationError } from './errors'
import type { CanonicalPart1Exercise, Part1Candidate } from './types'

const ROOT_SCHEMA_ID = 'https://c1-trainer.local/schemas/c1/v1/exercise.schema.json'
const GAP_MARKER = /\{\{gap:[1-8]\}\}/g
const GAP_NUMBER_MARKER = /\{\{gap:([1-8])\}\}/g
const ajv = new Ajv2020({ allErrors: true, strict: true })

for (const schema of [sharedSchema, part1Schema, part2Schema, part3Schema, part4Schema, part5Schema, part6Schema, part7Schema, part8Schema, exerciseSchema, candidateSchema]) {
  ajv.addSchema(schema)
}

const validateCandidateSchema = ajv.getSchema(candidateSchema.$id as string)
const validateCanonicalSchema = ajv.getSchema(ROOT_SCHEMA_ID)

function lexicalTokens(value: string): string[] {
  return value.match(/[A-Za-z]+(?:[’'][A-Za-z]+)?/g) ?? []
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('en-US').replace(/\s+/gu, ' ')
}

function optionIssues(candidate: Part1Candidate): string[] {
  const issues: string[] = []
  const expectedQuestionIds = Array.from({ length: 8 }, (_, index) => `q${index + 1}`)
  const questionIds = candidate.questions.map((question) => question.id)
  if (JSON.stringify(questionIds) !== JSON.stringify(expectedQuestionIds)) issues.push('questions must be ordered q1–q8')
  const gapNumbers = candidate.content.gaps.map((gap) => gap.number)
  if (JSON.stringify(gapNumbers) !== JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8])) issues.push('content.gaps must contain numbers 1–8 in order')
  const markers = [...candidate.content.text.matchAll(GAP_NUMBER_MARKER)].map((match) => Number(match[1]))
  if (JSON.stringify(markers) !== JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8])) issues.push('text must contain each gap marker exactly once in order')

  for (const question of candidate.questions) {
    const optionIds = question.options.map((option) => option.id)
    if (JSON.stringify(optionIds) !== JSON.stringify(['A', 'B', 'C', 'D'])) issues.push(`${question.id} options must be A–D in order`)
    const optionTexts = question.options.map((option) => normalize(option.text))
    if (new Set(optionTexts).size !== optionTexts.length) issues.push(`${question.id} contains duplicate option text`)
    if (!optionIds.includes(question.correctOptionId)) issues.push(`${question.id} correctOptionId is not present`) 
    if (!question.explanation.trim()) issues.push(`${question.id} explanation is empty`)
  }
  return issues
}

function calibrationIssues(candidate: Part1Candidate): string[] {
  const issues: string[] = []
  const textWithoutMarkers = candidate.content.text.replace(GAP_MARKER, ' ')
  const wordCount = lexicalTokens(textWithoutMarkers).length
  const targetWords = PART1_CALIBRATION.targets.runningWords
  if (wordCount < targetWords.min || wordCount > targetWords.max) issues.push(`running word count ${wordCount} is outside empirical target ${targetWords.min}–${targetWords.max}`)

  const segments = candidate.content.text.split(GAP_MARKER)
  const spacing = segments.slice(1, -1).map((segment) => lexicalTokens(segment).length)
  const spacingTarget = GENERATION_CONFIG.targetGapSpacing
  if (spacing.some((value) => value < spacingTarget.hardMinimum)) issues.push(`gap spacing ${JSON.stringify(spacing)} contains a value below ${spacingTarget.hardMinimum}`)
  const sorted = [...spacing].sort((left, right) => left - right)
  const median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)]
  if (median < spacingTarget.medianMin || median > spacingTarget.medianMax) issues.push(`gap spacing median ${median} is outside empirical target ${spacingTarget.medianMin}–${spacingTarget.medianMax}`)

  const paragraphs = candidate.content.text.split(/\n\s*\n/u).filter((paragraph) => paragraph.trim())
  const paragraphTarget = PART1_CALIBRATION.targets.paragraphs
  if (paragraphs.length < paragraphTarget.min || paragraphs.length > paragraphTarget.max) issues.push(`paragraph count ${paragraphs.length} is outside empirical target ${paragraphTarget.min}–${paragraphTarget.max}`)
  return issues
}

export function canonicalizePart1Candidate(candidate: Part1Candidate, model: string): CanonicalPart1Exercise {
  const exercise: CanonicalPart1Exercise = {
    schemaVersion: '1.0.0',
      id: `gen-c1-p1-${crypto.randomUUID()}`,
      exam: 'C1_ADVANCED',
      paper: 'READING_USE_OF_ENGLISH',
      part: 1,
      type: 'multiple_choice_cloze',
      title: candidate.title,
    difficulty: candidate.difficulty,
    topic: candidate.topic,
    source: { kind: 'original_ai', generator: model, reviewStatus: 'review' },
    skills: candidate.skills,
    content: candidate.content,
    questions: candidate.questions,
  }
  return exercise
}

export function validateAndCanonicalizePart1(candidate: unknown, model: string): CanonicalPart1Exercise {
  if (!validateCandidateSchema || !validateCandidateSchema(candidate)) {
    const details = (validateCandidateSchema?.errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message}`)
    throw new GenerationError('SCHEMA_VALIDATION_FAILED', 'Generated candidate failed candidate-schema validation', 502, details)
  }
  const typedCandidate = candidate as Part1Candidate
  const structuralIssues = optionIssues(typedCandidate)
  if (structuralIssues.length) throw new GenerationError('SEMANTIC_VALIDATION_FAILED', `Generated candidate failed deterministic Part 1 checks: ${structuralIssues.join('; ')}`, 502, structuralIssues)
  const calibration = calibrationIssues(typedCandidate)
  if (calibration.length) throw new GenerationError('SEMANTIC_VALIDATION_FAILED', `Generated candidate failed Part 1 calibration checks: ${calibration.join('; ')}`, 502, calibration)

  const exercise = canonicalizePart1Candidate(typedCandidate, model)
  if (!validateCanonicalSchema || !validateCanonicalSchema(exercise)) {
    const details = (validateCanonicalSchema?.errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message}`)
    throw new GenerationError('SCHEMA_VALIDATION_FAILED', `Canonical generated exercise failed schema validation: ${details.join('; ')}`, 502, details)
  }
  return exercise
}

export function validateCanonicalPart1(exercise: unknown): void {
  if (!validateCanonicalSchema || !validateCanonicalSchema(exercise)) {
    const details = (validateCanonicalSchema?.errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message}`)
    throw new GenerationError('SCHEMA_VALIDATION_FAILED', `Canonical exercise failed schema validation: ${details.join('; ')}`, 400, details)
  }
}

export function part1Metrics(exercise: CanonicalPart1Exercise): { wordCount: number; gapSpacing: number[]; paragraphCount: number } {
  const textWithoutMarkers = exercise.content.text.replace(GAP_MARKER, ' ')
  const segments = exercise.content.text.split(GAP_MARKER)
  return {
    wordCount: lexicalTokens(textWithoutMarkers).length,
    gapSpacing: segments.slice(1, -1).map((segment) => lexicalTokens(segment).length),
    paragraphCount: exercise.content.text.split(/\n\s*\n/u).filter((paragraph) => paragraph.trim()).length,
  }
}
