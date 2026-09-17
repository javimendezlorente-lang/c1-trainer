import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { listApprovedPart1Exercises, listApprovedPart2Exercises, listApprovedPart3Exercises, listApprovedPart4Exercises } from '../content'
import { gradeExercise } from '../grading'
import { createAttemptEvent } from './attemptSubmission'
import { rebuildLearningProjections, rebuildReviewCards, applyReviewRating } from '../learning'
import { createReviewEvent } from './reviewSubmission'
import { DexieAttemptRepository, deleteAttemptDatabase } from '../storage'
import { exportBackup } from './backup/exportBackup'
import { importBackup } from './backup/importBackup'
let name
afterEach(async () => { if (name) { await deleteAttemptDatabase(name); name = undefined } })
describe('Phase 7 mixed history', () => {
  it('replays Parts 1–4 and restores a review event from ledgers only', async () => {
    name = `phase7-${Date.now()}`; const repo = new DexieAttemptRepository(name)
    const exercises = [listApprovedPart1Exercises()[0], listApprovedPart2Exercises()[0], listApprovedPart3Exercises()[0], listApprovedPart4Exercises()[0]]
    const events = exercises.map((exercise, index) => { const answers = Object.fromEntries(exercise.questions.map((question) => [question.id, null])); return createAttemptEvent(exercise, answers, gradeExercise(exercise, answers), { idempotencyKey: `mixed-${exercise.part}`, eventId: `mixed-event-${exercise.part}`, occurredAt: `2026-03-0${index + 1}T00:00:00.000Z` }) })
    for (const event of events) await repo.append(event)
    const cards = rebuildReviewCards(events); expect(cards.some((item) => item.part === 2)).toBe(true); expect(cards.some((item) => item.part === 3)).toBe(true); expect(cards.some((item) => item.part === 4)).toBe(true)
    let card = cards[0]; const next = applyReviewRating(card, 'Good', '2026-04-01T00:00:00.000Z'); const review = createReviewEvent(card, next, 'Good', { idempotencyKey: 'mixed-review', eventId: 'mixed-review-event', reviewedAt: '2026-04-01T00:00:00.000Z' }); await repo.appendReviewEvent(review)
    const backup = await exportBackup(repo, '2026-05-01T00:00:00.000Z'); await repo.clearLearningData(); await importBackup(backup.json, repo)
    expect((await repo.list()).map((event) => event.part)).toEqual([1, 2, 3, 4]); expect((await repo.listReviewEvents()).map((event) => event.eventId)).toEqual(['mixed-review-event']); expect(rebuildLearningProjections(await repo.list(), await repo.listReviewEvents()).review.reviewsCompleted).toBe(1); await repo.close()
  })
})
