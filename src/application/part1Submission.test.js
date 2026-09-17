import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { listApprovedPart1Exercises } from '../content'
import { gradePart1 } from '../grading'
import { DexieAttemptRepository, deleteAttemptDatabase } from '../storage'
import { createAttemptEvent, submitPart1Attempt } from './part1Submission'

const exercise = listApprovedPart1Exercises()[0]
let databaseName

afterEach(async () => {
  if (databaseName) await deleteAttemptDatabase(databaseName)
  databaseName = undefined
})

describe('Part 1 submission boundary', () => {
  it('creates an immutable historical event without changing the grader contract', () => {
    const answers = { q1: exercise.questions[0].correctOptionId }
    const grade = gradePart1(exercise, answers)
    const event = createAttemptEvent(exercise, answers, grade, {
      idempotencyKey: 'event-test',
      eventId: 'event-test-id',
      occurredAt: '2026-01-01T00:00:00.000Z',
    })

    expect(event).toMatchObject({
      eventVersion: '1.0.0',
      eventId: 'event-test-id',
      idempotencyKey: 'event-test',
      kind: 'attempt_submitted',
      exerciseId: exercise.id,
      part: 1,
      type: 'multiple_choice_cloze',
    })
    expect(event.answers).toMatchObject({ q1: exercise.questions[0].correctOptionId, q2: null })
    expect(event.grade).not.toBe(grade)
    expect(event.grade.results).not.toBe(grade.results)
  })

  it('prevents a repeated submit from creating a second event', async () => {
    databaseName = `c1-trainer-submit-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const repository = new DexieAttemptRepository(databaseName)
    const firstAnswers = Object.fromEntries(exercise.questions.map((question) => [question.id, question.correctOptionId]))
    const secondAnswers = {}

    const first = await submitPart1Attempt({
      exercise,
      answers: firstAnswers,
      idempotencyKey: 'same-submit',
      eventId: 'first-event',
      occurredAt: '2026-01-01T00:00:00.000Z',
      repository,
    })
    const second = await submitPart1Attempt({
      exercise,
      answers: secondAnswers,
      idempotencyKey: 'same-submit',
      eventId: 'second-event',
      occurredAt: '2026-01-02T00:00:00.000Z',
      repository,
    })

    expect(first.inserted).toBe(true)
    expect(second.inserted).toBe(false)
    expect(second.event.eventId).toBe('first-event')
    expect(second.grade.score).toBe(8)
    expect(await repository.list()).toHaveLength(1)
    await repository.close()
  })
})
