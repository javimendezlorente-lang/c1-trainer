import fs from 'node:fs/promises'
import path from 'node:path'
import { createContentValidator, validateContentFile, validateSemantic } from './content-validator.mjs'
import { countTransformationWords } from './word-count.mjs'

const fixture = (name) => path.resolve('tests/fixtures/content/valid', name)
const readFixture = async (name) => JSON.parse(await fs.readFile(fixture(name), 'utf8'))

function allValidationErrors(exercise, validateSchema) {
  const errors = []
  if (!validateSchema(exercise)) errors.push(...(validateSchema.errors ?? []).map((error) => `STRUCTURAL ${error.message}`))
  errors.push(...validateSemantic(exercise).map((error) => `SEMANTIC ${error}`))
  return errors
}

describe('content validator', () => {
  let validateSchema

  beforeAll(async () => {
    validateSchema = await createContentValidator()
  })

  it('accepts each original Part 1–4 fixture', async () => {
    for (const name of ['part1.json', 'part2.json', 'part3.json', 'part4.json']) {
      expect(await validateContentFile(fixture(name), validateSchema)).toEqual([])
    }
  })

  it('uses part and type as the exercise discriminated union', async () => {
    const exercise = await readFixture('part1.json')
    expect(validateSchema(exercise)).toBe(true)
    exercise.type = 'open_cloze'
    expect(validateSchema(exercise)).toBe(false)
  })

  it('rejects an invalid fixture with a file-specific structural error', async () => {
    const invalidPath = path.resolve('tests/fixtures/content/invalid/part1-duplicate-options.json')
    const errors = await validateContentFile(invalidPath, validateSchema)
    expect(errors.some((error) => error.startsWith('STRUCTURAL') || error.startsWith('SEMANTIC'))).toBe(true)
    expect(errors.join('\n')).toContain(invalidPath)
  })

  it('enforces unsupported schema versions explicitly', async () => {
    const exercise = await readFixture('part1.json')
    exercise.schemaVersion = '2.0.0'
    expect(validateSemantic(exercise)).toContain('schemaVersion: unsupported schema version "2.0.0"')
    expect(validateSchema(exercise)).toBe(false)
    expect(await validateContentFile(fixture('part1.json'), validateSchema)).toEqual([])
  })

  it('rejects missing versions and unknown skill tags', async () => {
    const missingVersion = await readFixture('part1.json')
    delete missingVersion.schemaVersion
    expect(validateSchema(missingVersion)).toBe(false)

    const unknownSkill = await readFixture('part1.json')
    unknownSkill.skills.primarySkill = 'invented_skill'
    expect(validateSchema(unknownSkill)).toBe(false)
  })

  it('enforces the Part 1 eight-question, four-option, and answer-ID contract', async () => {
    const tooFewQuestions = await readFixture('part1.json')
    tooFewQuestions.questions.pop()
    expect(validateSchema(tooFewQuestions)).toBe(false)

    const wrongOptionCount = await readFixture('part1.json')
    wrongOptionCount.questions[0].options.pop()
    expect(validateSchema(wrongOptionCount)).toBe(false)

    const invalidCorrectId = await readFixture('part1.json')
    invalidCorrectId.questions[0].correctOptionId = 'E'
    expect(validateSchema(invalidCorrectId)).toBe(false)
  })

  it('enforces Part 1 unique question/gap IDs and Part 2 eight questions', async () => {
    const duplicateQuestion = await readFixture('part1.json')
    duplicateQuestion.questions[1].id = duplicateQuestion.questions[0].id
    expect(allValidationErrors(duplicateQuestion, validateSchema).join('\n')).toContain('questions.id: duplicate value')

    const duplicateGap = await readFixture('part1.json')
    duplicateGap.questions[1].gap = duplicateGap.questions[0].gap
    expect(allValidationErrors(duplicateGap, validateSchema).join('\n')).toContain('questions.gap: duplicate value')

    const part2 = await readFixture('part2.json')
    part2.questions.pop()
    expect(validateSchema(part2)).toBe(false)
  })

  it('rejects multiword Part 2 answers', async () => {
    const exercise = await readFixture('part2.json')
    exercise.questions[0].acceptedAnswers = ['even though']
    expect(validateSemantic(exercise).join('\n')).toContain('must contain exactly one lexical token')
  })

  it('rejects unchanged Part 3 roots', async () => {
    const exercise = await readFixture('part3.json')
    exercise.questions[0].canonicalAnswer = exercise.questions[0].root
    expect(validateSemantic(exercise).join('\n')).toContain('root must differ from canonicalAnswer')
  })

  it('enforces Part 4 six questions, unchanged keywords, and 3–6 words', async () => {
    const wrongCount = await readFixture('part4.json')
    wrongCount.questions.pop()
    expect(validateSchema(wrongCount)).toBe(false)

    const changedKeyword = await readFixture('part4.json')
    changedKeyword.questions[0].acceptedAnswers = ['need not have attended']
    changedKeyword.questions[0].keyword = 'HAD'
    expect(validateSemantic(changedKeyword).join('\n')).toContain('must occur unmodified')

    const tooShort = await readFixture('part4.json')
    tooShort.questions[0].acceptedAnswers = ['have attended']
    expect(validateSemantic(tooShort).join('\n')).toContain('contains 2 words; expected 3–6')

    const tooLong = await readFixture('part4.json')
    tooLong.questions[0].acceptedAnswers = ['need not have attended the briefing today']
    expect(validateSemantic(tooLong).join('\n')).toContain('contains 7 words; expected 3–6')
  })

  it('uses one isolated Part 4 word-count utility', () => {
    expect(countTransformationWords('  had   never   seen  ')).toBe(3)
    expect(countTransformationWords("couldn't have been")).toBe(3)
    expect(countTransformationWords('well-known results')).toBe(2)
    expect(countTransformationWords('')).toBe(0)
  })
})
