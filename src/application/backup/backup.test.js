import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { createBackupEnvelope, serializeBackup } from '../../backup'
import { createAttemptEvent } from '../part1Submission'
import { createReviewEvent } from '../reviewSubmission'
import { listApprovedPart1Exercises } from '../../content'
import { gradePart1 } from '../../grading'
import { applyReviewRating, rebuildLearningProjections, rebuildReviewCards } from '../../learning'
import { DexieAttemptRepository, deleteAttemptDatabase } from '../../storage'
import { exportBackup } from './exportBackup'
import { importBackup, previewBackup } from './importBackup'

const exercise = listApprovedPart1Exercises()[0]
let databaseName

function makeAttempt(index) {
  const answers = Object.fromEntries(exercise.questions.map((question) => [question.id, question.options.find((option) => option.id !== question.correctOptionId).id]))
  return createAttemptEvent(exercise, answers, gradePart1(exercise, answers), { idempotencyKey: `attempt-${index}`, eventId: `attempt-event-${index}`, occurredAt: `2026-01-${String(index + 1).padStart(2, '0')}T00:00:00.000Z` })
}

afterEach(async () => { if (databaseName) await deleteAttemptDatabase(databaseName); databaseName = undefined })

describe('versioned learning backup', () => {
  it('exports only source ledgers and imports an empty backup', async () => {
    databaseName = `c1-trainer-backup-empty-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const repository = new DexieAttemptRepository(databaseName)
    const exported = await exportBackup(repository, '2026-09-17T12:00:00.000Z')
    expect(exported.filename).toBe('c1-trainer-backup-2026-09-17.json')
    expect(exported.envelope).toMatchObject({ format: 'c1-trainer-backup', version: '1.0.0', app: { databaseVersion: 4 }, attemptEvents: [], reviewEvents: [] })
    expect(exported.json).not.toMatch(/errorBank|progress|skillProfile|reviewCards|dueQueue/)
    await expect(importBackup(exported.json, repository)).resolves.toMatchObject({ attemptEventsAdded: 0, reviewEventsAdded: 0 })
    await expect(previewBackup(serializeBackup({ ...exported.envelope, version: '1.1.0' }), repository)).resolves.toMatchObject({ attemptEventsToAdd: 0, reviewEventsToAdd: 0 })
    await repository.close()
  })

  it('round-trips ten attempts and six reviews with equivalent projections and due dates', async () => {
    databaseName = `c1-trainer-backup-roundtrip-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const repository = new DexieAttemptRepository(databaseName)
    const attempts = Array.from({ length: 10 }, (_, index) => makeAttempt(index))
    let card = rebuildReviewCards(attempts, []).find((item) => item.questionId === 'q1')
    const reviews = []
    for (const [index, rating] of ['Good', 'Good', 'Hard', 'Again', 'Good', 'Easy'].entries()) {
      const reviewedAt = `2026-02-0${index + 1}T00:00:00.000Z`
      const next = applyReviewRating(card, rating, reviewedAt)
      reviews.push(createReviewEvent(card, next, rating, { idempotencyKey: `review-${index}`, eventId: `review-event-${index}`, reviewedAt }))
      card = next
    }
    for (const event of attempts) await repository.append(event)
    for (const event of reviews) await repository.appendReviewEvent(event)
    const expectedCards = rebuildReviewCards(attempts, reviews)
    await repository.replaceReviewCards(expectedCards)
    await repository.setReviewDisposition({ reviewCardId: expectedCards[0].id, exerciseId: expectedCards[0].exerciseId, questionId: expectedCards[0].questionId, state: 'mastered', changedAt: '2026-09-17T12:00:00.000Z' })
    const expected = rebuildLearningProjections(attempts, reviews, '2026-09-17T12:00:00.000Z')
    const backup = await exportBackup(repository, '2026-09-17T12:00:00.000Z')

    await repository.clearLearningData()
    const restored = await importBackup(backup.json, repository)
    expect(await repository.list()).toEqual(attempts)
    expect(await repository.listReviewEvents()).toEqual(reviews)
    expect(await repository.listReviewCards()).toEqual(expectedCards)
    expect(await repository.listReviewDispositions()).toMatchObject([{ reviewCardId: expectedCards[0].id, state: 'mastered' }])
    expect(rebuildLearningProjections(attempts, reviews, '2026-09-17T12:00:00.000Z')).toEqual(expected)
    expect(restored.projections.progress).toEqual(expected.progress)
    expect(restored.projections.review.ratingDistribution).toEqual(expected.review.ratingDistribution)
    await expect(importBackup(backup.json, repository)).resolves.toMatchObject({ attemptEventsAdded: 0, reviewEventsAdded: 0, attemptEventsSkipped: 10, reviewEventsSkipped: 6, reviewDispositionsAdded: 0 })
    await expect(previewBackup(backup.json, repository)).resolves.toMatchObject({ attemptEventsToAdd: 0, attemptEventsToSkip: 10, reviewEventsToAdd: 0, reviewEventsToSkip: 6 })
    await repository.close()
  })

  it('rejects malformed JSON, unsupported major versions, invalid events, and conflicts before writing', async () => {
    databaseName = `c1-trainer-backup-validation-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const repository = new DexieAttemptRepository(databaseName)
    const attempt = makeAttempt(0)
    const backup = createBackupEnvelope([attempt], [], '2026-09-17T12:00:00.000Z')
    await expect(importBackup('{not-json}', repository)).rejects.toMatchObject({ code: 'invalid_json' })
    await expect(importBackup(serializeBackup({ ...backup, version: '2.0.0' }), repository)).rejects.toMatchObject({ code: 'unsupported_version' })
    await expect(importBackup(serializeBackup({ ...backup, attemptEvents: [{}] }), repository)).rejects.toMatchObject({ code: 'invalid_attempt_event' })
    await expect(importBackup(serializeBackup({ ...backup, reviewEvents: [{}] }), repository)).rejects.toMatchObject({ code: 'invalid_review_event' })
    await repository.append(attempt)
    const conflictEvent = { ...attempt, occurredAt: '2026-09-18T00:00:00.000Z' }
    await expect(importBackup(serializeBackup({ ...backup, attemptEvents: [conflictEvent] }), repository)).rejects.toMatchObject({ code: 'historical_conflict' })
    expect(await repository.list()).toEqual([attempt])
    await repository.close()
  })

  it('rolls back the whole historical transaction when a later ledger write fails', async () => {
    databaseName = `c1-trainer-backup-rollback-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const repository = new DexieAttemptRepository(databaseName)
    const originalBulkAdd = repository.db.reviewEvents.bulkAdd.bind(repository.db.reviewEvents)
    repository.db.reviewEvents.bulkAdd = async () => { throw new Error('simulated review-store failure') }
    await expect(repository.mergeHistoricalEvents([makeAttempt(0)], [{ eventId: 'review', idempotencyKey: 'review', kind: 'review_submitted' }])).rejects.toThrow('simulated review-store failure')
    repository.db.reviewEvents.bulkAdd = originalBulkAdd
    expect(await repository.list()).toEqual([])
    expect(await repository.listReviewEvents()).toEqual([])
    await repository.close()
  })
})
