import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { createAttemptEvent, submitPart1Attempt } from './part1Submission'
import { submitReview } from './reviewSubmission'
import { listApprovedPart1Exercises } from '../content'
import { gradePart1 } from '../grading'
import { rebuildReviewCards } from '../learning'
import { DexieAttemptRepository, deleteAttemptDatabase } from '../storage'

const exercise = listApprovedPart1Exercises()[0]
let databaseName

afterEach(async () => { if (databaseName) await deleteAttemptDatabase(databaseName); databaseName = undefined })

describe('review submission boundary', () => {
  it('appends one ReviewEvent for a repeated rating key', async () => {
    databaseName = `c1-trainer-review-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const repository = new DexieAttemptRepository(databaseName)
    const answers = Object.fromEntries(exercise.questions.map((question) => [question.id, question.options.find((option) => option.id !== question.correctOptionId).id]))
    await submitPart1Attempt({ exercise, answers, idempotencyKey: 'attempt', occurredAt: '2026-01-01T00:00:00.000Z', repository })
    const card = (await repository.listReviewCards())[0]
    const first = await submitReview({ card, rating: 'Good', idempotencyKey: 'review-key', reviewedAt: '2026-01-02T00:00:00.000Z', repository })
    const second = await submitReview({ card, rating: 'Good', idempotencyKey: 'review-key', reviewedAt: '2026-01-03T00:00:00.000Z', repository })
    expect(first.inserted).toBe(true)
    expect(second.inserted).toBe(false)
    expect(await repository.listReviewEvents()).toHaveLength(1)
    await repository.close()
  })

  it('clears attempts, review events, and cards while leaving preferences outside the repository', async () => {
    databaseName = `c1-trainer-reset-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const repository = new DexieAttemptRepository(databaseName)
    const event = createAttemptEvent(exercise, {}, gradePart1(exercise, {}), { idempotencyKey: 'reset-attempt', occurredAt: '2026-01-01T00:00:00.000Z' })
    await repository.append(event)
    await repository.replaceReviewCards(rebuildReviewCards([event]))
    await repository.clearLearningData()
    expect(await repository.list()).toEqual([])
    expect(await repository.listReviewEvents()).toEqual([])
    expect(await repository.listReviewCards()).toEqual([])
    await repository.close()
  })
})
