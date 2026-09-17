import fs from 'node:fs/promises'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import { countTransformationWords } from './word-count.mjs'

const SCHEMA_DIR = path.resolve('schemas/c1/v1')
const ROOT_SCHEMA_ID = 'https://c1-trainer.local/schemas/c1/v1/exercise.schema.json'
const ANSWER_MARKER = '{{answer}}'

const schemaFiles = ['shared.schema.json', 'part1.schema.json', 'part2.schema.json', 'part3.schema.json', 'part4.schema.json', 'exercise.schema.json']

export async function createContentValidator() {
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  for (const fileName of schemaFiles) {
    const schema = JSON.parse(await fs.readFile(path.join(SCHEMA_DIR, fileName), 'utf8'))
    ajv.addSchema(schema)
  }
  return ajv.getSchema(ROOT_SCHEMA_ID)
}

function normalize(value) {
  return value.trim().toLocaleLowerCase('en-US')
}

function countLexicalTokens(answer) {
  return answer.trim() === '' ? 0 : answer.trim().split(/\s+/u).length
}

function uniqueValues(values, label, errors) {
  const seen = new Set()
  for (const value of values) {
    if (seen.has(value)) errors.push(`${label}: duplicate value "${value}"`)
    seen.add(value)
  }
}

function validateClozeSemantics(exercise, errors) {
  const gapNumbers = exercise.content.gaps.map((gap) => gap.number)
  uniqueValues(gapNumbers, 'content.gaps', errors)

  const questionIds = exercise.questions.map((question) => question.id)
  uniqueValues(questionIds, 'questions.id', errors)
  const questionGaps = exercise.questions.map((question) => question.gap)
  uniqueValues(questionGaps, 'questions.gap', errors)
}

function validatePart1(exercise, errors) {
  validateClozeSemantics(exercise, errors)
  for (const question of exercise.questions) {
    const optionIds = question.options.map((option) => option.id)
    uniqueValues(optionIds, `${question.id}.options.id`, errors)
    const optionTexts = question.options.map((option) => normalize(option.text))
    uniqueValues(optionTexts, `${question.id}.options.text`, errors)
    if (!optionIds.includes(question.correctOptionId)) {
      errors.push(`${question.id}.correctOptionId: "${question.correctOptionId}" does not identify an option`)
    }
  }
}

function validatePart2(exercise, errors) {
  validateClozeSemantics(exercise, errors)
  for (const question of exercise.questions) {
    for (const answer of question.acceptedAnswers) {
      if (countLexicalTokens(answer) !== 1) {
        errors.push(`${question.id}.acceptedAnswers: "${answer}" must contain exactly one lexical token`)
      }
    }
    if (!question.acceptedAnswers.some((answer) => normalize(answer) === normalize(question.canonicalAnswer))) {
      errors.push(`${question.id}.canonicalAnswer: must be present in acceptedAnswers`)
    }
  }
}

function validatePart3(exercise, errors) {
  validateClozeSemantics(exercise, errors)
  for (const question of exercise.questions) {
    if (normalize(question.root) === normalize(question.canonicalAnswer)) {
      errors.push(`${question.id}: root must differ from canonicalAnswer`)
    }
    if (question.acceptedAnswers?.some((answer) => normalize(question.root) === normalize(answer))) {
      errors.push(`${question.id}: root must differ from every accepted answer`)
    }
    if (question.acceptedAnswers && !question.acceptedAnswers.some((answer) => normalize(answer) === normalize(question.canonicalAnswer))) {
      errors.push(`${question.id}.canonicalAnswer: must be present in acceptedAnswers`)
    }
  }
}

function validatePart4(exercise, errors) {
  uniqueValues(exercise.questions.map((question) => question.id), 'questions.id', errors)
  for (const question of exercise.questions) {
    const markerCount = question.secondSentence.split(ANSWER_MARKER).length - 1
    if (markerCount !== 1) {
      errors.push(`${question.id}.secondSentence: must contain exactly one ${ANSWER_MARKER} marker`)
    }
    if (!question.acceptedAnswers.some((answer) => normalize(answer) === normalize(question.canonicalAnswer))) {
      errors.push(`${question.id}.canonicalAnswer: must be present in acceptedAnswers`)
    }
    for (const answer of question.acceptedAnswers) {
      if (!normalize(answer).includes(normalize(question.keyword))) {
        errors.push(`${question.id}.acceptedAnswers: keyword "${question.keyword}" must occur unmodified in "${answer}"`)
      }
      const wordCount = countTransformationWords(answer)
      if (wordCount < 3 || wordCount > 6) {
        errors.push(`${question.id}.acceptedAnswers: "${answer}" contains ${wordCount} words; expected 3–6`)
      }
    }
  }
}

export function validateSemantic(exercise) {
  const errors = []
  if (exercise.schemaVersion !== '1.0.0') {
    errors.push(`schemaVersion: unsupported schema version "${exercise.schemaVersion}"`)
  }
  if (exercise.part === 1) validatePart1(exercise, errors)
  if (exercise.part === 2) validatePart2(exercise, errors)
  if (exercise.part === 3) validatePart3(exercise, errors)
  if (exercise.part === 4) validatePart4(exercise, errors)
  return errors
}

export async function validateContentFile(filePath, validateSchema = null) {
  let exercise
  try {
    exercise = JSON.parse(await fs.readFile(filePath, 'utf8'))
  } catch (error) {
    return [`STRUCTURAL ${filePath}: invalid JSON (${error.message})`]
  }

  const schemaValidator = validateSchema ?? await createContentValidator()
  const errors = []
  if (typeof exercise?.schemaVersion === 'string' && exercise.schemaVersion !== '1.0.0') {
    errors.push(`SEMANTIC ${filePath}: schemaVersion: unsupported schema version "${exercise.schemaVersion}"`)
  }
  if (!schemaValidator(exercise)) {
    for (const error of schemaValidator.errors ?? []) {
      errors.push(`STRUCTURAL ${filePath} ${error.instancePath || '/'}: ${error.message}`)
    }
  }
  if (errors.length === 0) {
    for (const error of validateSemantic(exercise)) {
      errors.push(`SEMANTIC ${filePath}: ${error}`)
    }
  }
  return errors
}

export async function findJsonFiles(rootPath) {
  const entries = await fs.readdir(rootPath, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const entryPath = path.join(rootPath, entry.name)
    if (entry.isDirectory()) files.push(...await findJsonFiles(entryPath))
    if (entry.isFile() && entry.name.endsWith('.json')) files.push(entryPath)
  }
  return files
}
