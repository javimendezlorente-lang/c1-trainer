import { describe, expect, it } from 'vitest'
import { listApprovedPart1Exercises } from '../content'
import { gradePart1 } from '../grading'
import { createAttemptEvent } from '../application/part1Submission'
import { rebuildLearningProjections } from './projections'

const exercise = listApprovedPart1Exercises()[0]

function answersFrom(selector) {
  return Object.fromEntries(exercise.questions.map((question) => [question.id, selector(question)]))
}

function event(idempotencyKey, answers, occurredAt) {
  return createAttemptEvent(exercise, answers, gradePart1(exercise, answers), {
    idempotencyKey,
    eventId: `${idempotencyKey}-event`,
    occurredAt,
  })
}

describe('rebuildLearningProjections', () => {
  it('derives Error Bank and progress from AttemptEvent history', () => {
    const wrongAnswers = answersFrom((question) => question.options.find((option) => option.id !== question.correctOptionId).id)
    const correctAnswers = answersFrom((question) => question.correctOptionId)
    const projections = rebuildLearningProjections([
      event('wrong-submit', wrongAnswers, '2026-01-01T00:00:00.000Z'),
      event('correct-submit', correctAnswers, '2026-01-02T00:00:00.000Z'),
    ])

    expect(projections.errorBank).toHaveLength(8)
    expect(projections.errorBank.every((record) => record.totalAttempts === 2 && record.incorrectAttempts === 1 && record.status === 'cleared')).toBe(true)
    expect(projections.progress).toMatchObject({
      attempts: 2,
      questions: 16,
      correct: 8,
      score: 8,
      maxScore: 16,
      accuracy: 50,
    })
    expect(projections.progress.bySkill[0]).toMatchObject({ attempts: 16, correct: 8, accuracy: 50 })
  })

  it('rebuilds the same projection deterministically from the same history', () => {
    const history = [event('one', answersFrom((question) => question.correctOptionId), '2026-01-01T00:00:00.000Z')]

    expect(rebuildLearningProjections(history)).toEqual(rebuildLearningProjections(history))
  })
})
