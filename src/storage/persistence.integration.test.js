import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { listApprovedPart1Exercises } from '../content'
import { gradePart1 } from '../grading'
import { createAttemptEvent } from '../application/part1Submission'
import { DexieAttemptRepository, deleteAttemptDatabase } from './attemptRepository'

describe('browser persistence smoke test', () => {
  const names = []
  afterEach(async () => { await Promise.all(names.splice(0).map((name) => deleteAttemptDatabase(name))) })

  it('keeps attempts and review dispositions after closing and reopening IndexedDB', async () => {
    const name = `c1-trainer-persistence-${Date.now()}`
    names.push(name)
    const exercise = listApprovedPart1Exercises()[0]
    const answers = Object.fromEntries(exercise.questions.map((question) => [question.id, question.correctOptionId]))
    const event = createAttemptEvent(exercise, answers, gradePart1(exercise, answers), { idempotencyKey: 'persistence-attempt', eventId: 'persistence-event', occurredAt: '2026-09-21T00:00:00.000Z' })
    const first = new DexieAttemptRepository(name)
    await first.append(event)
    await first.setReviewDisposition({ reviewCardId: `review-card:${exercise.id}:q1`, exerciseId: exercise.id, questionId: 'q1', state: 'mastered', changedAt: '2026-09-21T00:01:00.000Z' })
    await first.close()
    const reopened = new DexieAttemptRepository(name)
    expect(await reopened.list()).toEqual([event])
    expect(await reopened.listReviewDispositions()).toMatchObject([{ state: 'mastered', questionId: 'q1' }])
    await reopened.close()
  })
})
