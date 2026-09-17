import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { listApprovedPart1Exercises, listApprovedPart2Exercises, listApprovedPart3Exercises, listApprovedPart4Exercises, listApprovedPart5Exercises, listApprovedPart6Exercises, listApprovedPart7Exercises, listApprovedPart8Exercises } from '../content'
import { gradeExercise } from '../grading'
import { createAttemptEvent } from './attemptSubmission'
import { createReviewEvent } from './reviewSubmission'
import { applyReviewRating, rebuildLearningProjections, rebuildReviewCards } from '../learning'
import { DexieAttemptRepository, deleteAttemptDatabase } from '../storage'
import { exportBackup } from './backup/exportBackup'
import { importBackup } from './backup/importBackup'

let names = []
afterEach(async () => { for (const name of names) await deleteAttemptDatabase(name); names = [] })

describe('Reading Parts 5–8 historical replay', () => {
  it('stores and restores a mixed Parts 1–8 ledger with rebuildable projections and reviews', async () => {
    const sets = [listApprovedPart1Exercises(), listApprovedPart2Exercises(), listApprovedPart3Exercises(), listApprovedPart4Exercises(), listApprovedPart5Exercises(), listApprovedPart6Exercises(), listApprovedPart7Exercises(), listApprovedPart8Exercises()]
    const attempts = sets.map((items, index) => { const exercise = items[0]; const answers = Object.fromEntries(exercise.questions.map((q) => [q.id, exercise.part === 1 || exercise.part === 5 ? 'A' : exercise.part === 7 ? 'para-a' : 'missing'])); return createAttemptEvent(exercise, answers, gradeExercise(exercise, answers), { idempotencyKey: `phase8-${index}`, eventId: `phase8-event-${index}`, occurredAt: `2026-09-${String(index + 1).padStart(2, '0')}T00:00:00.000Z` }) })
    const first = `phase8-source-${Date.now()}`; const second = `phase8-restore-${Date.now()}`; names = [first, second]
    const source = new DexieAttemptRepository(first); for (const event of attempts) await source.append(event)
    const initialCard = rebuildReviewCards(attempts, []).find((card) => card.part === 5); const reviewedCard = applyReviewRating(initialCard, 'Good', '2026-09-10T00:00:00.000Z'); const review = createReviewEvent(initialCard, reviewedCard, 'Good', { idempotencyKey: 'phase8-review', eventId: 'phase8-review-event', reviewedAt: '2026-09-10T00:00:00.000Z' }); await source.appendReviewEvent(review)
    const backup = await exportBackup(source, '2026-09-17T12:00:00.000Z'); const restored = new DexieAttemptRepository(second); const result = await importBackup(backup.json, restored)
    expect(result.attemptEventsAdded).toBe(8); expect(result.reviewEventsAdded).toBe(1); expect(new Set((await restored.list()).map((e) => e.part))).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8])); expect((await restored.listReviewEvents())).toHaveLength(1); expect(result.projections.progress.byPart).toHaveLength(8); expect(result.projections.errorBank.every((r) => r.part >= 1 && r.part <= 8)).toBe(true); expect(result.projections.review.reviewsCompleted).toBe(1); expect(rebuildLearningProjections(await restored.list(), await restored.listReviewEvents()).progress).toEqual(result.projections.progress)
    await source.close(); await restored.close()
  })
})
