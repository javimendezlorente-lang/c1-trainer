import { parseBackupJson, BackupError, sameHistoricalEvent } from '../../backup'
import type { BackupEnvelopeV1 } from '../../domain/backup'
import { rebuildLearningProjections, rebuildReviewCards, type LearningProjections } from '../../learning'
import { attemptRepository, type AttemptRepository, type HistoricalImportResult } from '../../storage'

export interface BackupImportPreview {
  envelope: BackupEnvelopeV1
  attemptEventsToAdd: number
  attemptEventsToSkip: number
  reviewEventsToAdd: number
  reviewEventsToSkip: number
}

export interface BackupImportResult extends HistoricalImportResult {
  projections: LearningProjections
}

function conflict(kind: 'AttemptEvent' | 'ReviewEvent', eventId: string): never {
  throw new BackupError('historical_conflict', `${kind} conflict: event ID ${eventId} has a different immutable payload.`)
}

function countChanges(incoming: readonly { eventId: string; idempotencyKey: string }[], existing: readonly { eventId: string; idempotencyKey: string }[], kind: 'AttemptEvent' | 'ReviewEvent') {
  const byId = new Map(existing.map((event) => [event.eventId, event]))
  const byKey = new Map(existing.map((event) => [event.idempotencyKey, event]))
  const seenIds = new Map<string, unknown>()
  const seenKeys = new Map<string, unknown>()
  let added = 0
  let skipped = 0
  for (const event of incoming) {
    const priorInput = seenIds.get(event.eventId)
    if (priorInput && !sameHistoricalEvent(priorInput, event)) conflict(kind, event.eventId)
    const priorKeyInput = seenKeys.get(event.idempotencyKey)
    if (priorKeyInput && !sameHistoricalEvent(priorKeyInput, event)) conflict(kind, event.eventId)
    seenIds.set(event.eventId, event)
    seenKeys.set(event.idempotencyKey, event)
    const byIdEvent = byId.get(event.eventId)
    const byKeyEvent = byKey.get(event.idempotencyKey)
    if ((byIdEvent && !sameHistoricalEvent(byIdEvent, event)) || (byKeyEvent && !sameHistoricalEvent(byKeyEvent, event))) conflict(kind, event.eventId)
    if (byIdEvent || byKeyEvent) skipped += 1
    else { added += 1; byId.set(event.eventId, event); byKey.set(event.idempotencyKey, event) }
  }
  return { added, skipped }
}

export async function previewBackup(input: string | BackupEnvelopeV1, repository: AttemptRepository = attemptRepository): Promise<BackupImportPreview> {
  const envelope = typeof input === 'string' ? parseBackupJson(input) : parseBackupJson(JSON.stringify(input))
  const [existingAttempts, existingReviews] = await Promise.all([repository.list(), repository.listReviewEvents()])
  const attempts = countChanges(envelope.attemptEvents, existingAttempts, 'AttemptEvent')
  const reviews = countChanges(envelope.reviewEvents, existingReviews, 'ReviewEvent')
  return { envelope, attemptEventsToAdd: attempts.added, attemptEventsToSkip: attempts.skipped, reviewEventsToAdd: reviews.added, reviewEventsToSkip: reviews.skipped }
}

export async function importBackup(input: string | BackupEnvelopeV1, repository: AttemptRepository = attemptRepository): Promise<BackupImportResult> {
  const preview = await previewBackup(input, repository)
  let merge: HistoricalImportResult
  try {
    merge = await repository.mergeHistoricalEvents(preview.envelope.attemptEvents, preview.envelope.reviewEvents)
  } catch (error) {
    if (error instanceof BackupError) throw error
    const message = error instanceof Error ? error.message : 'Storage transaction failed.'
    if (message.includes('conflict')) throw new BackupError('historical_conflict', message)
    throw new BackupError('storage_failure', 'Learning history could not be imported; no partial transaction was kept.')
  }

  try {
    const [attemptEvents, reviewEvents] = await Promise.all([repository.list(), repository.listReviewEvents()])
    const cards = rebuildReviewCards(attemptEvents, reviewEvents)
    await repository.replaceReviewCards(cards)
    return { ...merge, projections: rebuildLearningProjections(attemptEvents, reviewEvents) }
  } catch {
    throw new BackupError('rebuild_failure', 'Learning history was stored, but projections could not be rebuilt.')
  }
}
