import Dexie, { type Table } from 'dexie'
import type { AttemptEvent } from '../domain/attempt'
import type { ReviewEvent } from '../domain/review'
import type { ReviewCardProjection } from '../learning/fsrs'
import { sameHistoricalEvent } from '../backup/compare'

export const ATTEMPT_DATABASE_NAME = 'c1-trainer'
export const ATTEMPT_DATABASE_VERSION = 3

interface AttemptKeyRecord {
  idempotencyKey: string
  eventId: string
}

interface DatabaseMetaRecord {
  key: string
  value: string
}

interface ReviewKeyRecord {
  idempotencyKey: string
  eventId: string
}

type LegacyAttemptEvent = Partial<AttemptEvent> & Pick<AttemptEvent, 'eventId'>

export interface AppendAttemptResult {
  event: AttemptEvent
  inserted: boolean
}

export interface AppendReviewResult {
  event: ReviewEvent
  inserted: boolean
}

export interface HistoricalImportResult {
  attemptEventsAdded: number
  attemptEventsSkipped: number
  reviewEventsAdded: number
  reviewEventsSkipped: number
}

export interface AttemptRepository {
  append(event: AttemptEvent): Promise<AppendAttemptResult>
  getByIdempotencyKey(idempotencyKey: string): Promise<AttemptEvent | undefined>
  list(): Promise<AttemptEvent[]>
  appendReviewEvent(event: ReviewEvent): Promise<AppendReviewResult>
  getReviewByIdempotencyKey(idempotencyKey: string): Promise<ReviewEvent | undefined>
  listReviewEvents(): Promise<ReviewEvent[]>
  listReviewCards(): Promise<ReviewCardProjection[]>
  replaceReviewCards(cards: readonly ReviewCardProjection[]): Promise<void>
  clearLearningData(): Promise<void>
  mergeHistoricalEvents(attemptEvents: readonly AttemptEvent[], reviewEvents: readonly ReviewEvent[]): Promise<HistoricalImportResult>
}

export class C1TrainerDatabase extends Dexie {
  attempts!: Table<AttemptEvent, string>
  attemptKeys!: Table<AttemptKeyRecord, string>
  meta!: Table<DatabaseMetaRecord, string>
  reviewEvents!: Table<ReviewEvent, string>
  reviewKeys!: Table<ReviewKeyRecord, string>
  reviewCards!: Table<ReviewCardProjection, string>

  constructor(name = ATTEMPT_DATABASE_NAME) {
    super(name)

    this.version(1).stores({
      attempts: 'eventId, idempotencyKey, occurredAt, exerciseId, part',
      meta: 'key',
    })

    this.version(2)
      .stores({
        attempts: 'eventId, idempotencyKey, occurredAt, exerciseId, part',
        attemptKeys: 'idempotencyKey',
        meta: 'key',
      })
      .upgrade(async (transaction) => {
        const attempts = transaction.table('attempts')
        const attemptKeys = transaction.table('attemptKeys')
        const legacyEvents = (await attempts.toArray()) as LegacyAttemptEvent[]

        for (const legacyEvent of legacyEvents) {
          const upgradedEvent: Partial<AttemptEvent> = {
            eventVersion: legacyEvent.eventVersion ?? '1.0.0',
            kind: legacyEvent.kind ?? 'attempt_submitted',
            exerciseSchemaVersion: legacyEvent.exerciseSchemaVersion ?? '1.0.0',
            type: legacyEvent.type ?? 'multiple_choice_cloze',
            explanationReferences: legacyEvent.explanationReferences ?? {},
            idempotencyKey: legacyEvent.idempotencyKey ?? legacyEvent.eventId,
          }
          await attempts.update(legacyEvent.eventId, upgradedEvent)

          if (upgradedEvent.idempotencyKey) {
            const existing = await attemptKeys.get(upgradedEvent.idempotencyKey)
            if (!existing) {
              await attemptKeys.add({
                idempotencyKey: upgradedEvent.idempotencyKey,
                eventId: legacyEvent.eventId,
              })
            }
          }
        }

        await transaction.table('meta').put({ key: 'schemaVersion', value: '2' })
      })

    this.version(3)
      .stores({
        attempts: 'eventId, idempotencyKey, occurredAt, exerciseId, part',
        attemptKeys: 'idempotencyKey',
        meta: 'key',
        reviewEvents: 'eventId, reviewCardId, reviewedAt, idempotencyKey, exerciseId',
        reviewKeys: 'idempotencyKey',
        reviewCards: 'id, due, state, exerciseId, questionId',
      })
      .upgrade(async (transaction) => {
        const events = transaction.table('reviewEvents')
        const keys = transaction.table('reviewKeys')
        for (const event of (await events.toArray()) as ReviewEvent[]) {
          if (!(await keys.get(event.idempotencyKey))) {
            await keys.add({ idempotencyKey: event.idempotencyKey, eventId: event.eventId })
          }
        }
        await transaction.table('meta').put({ key: 'schemaVersion', value: '3' })
      })
  }
}

export class DexieAttemptRepository implements AttemptRepository {
  readonly db: C1TrainerDatabase

  constructor(databaseName = ATTEMPT_DATABASE_NAME) {
    this.db = new C1TrainerDatabase(databaseName)
  }

  async append(event: AttemptEvent): Promise<AppendAttemptResult> {
    return this.db.transaction('rw', this.db.attempts, this.db.attemptKeys, async () => {
      const existingKey = await this.db.attemptKeys.get(event.idempotencyKey)
      if (existingKey) {
        const existingEvent = await this.db.attempts.get(existingKey.eventId)
        if (existingEvent) return { event: existingEvent, inserted: false }
      }

      await this.db.attempts.add(event)
      await this.db.attemptKeys.put({ idempotencyKey: event.idempotencyKey, eventId: event.eventId })
      return { event, inserted: true }
    })
  }

  async getByIdempotencyKey(idempotencyKey: string): Promise<AttemptEvent | undefined> {
    const key = await this.db.attemptKeys.get(idempotencyKey)
    return key ? this.db.attempts.get(key.eventId) : undefined
  }

  async list(): Promise<AttemptEvent[]> {
    const events = await this.db.attempts.toArray()
    return events.sort((left, right) => {
      const byTime = left.occurredAt.localeCompare(right.occurredAt)
      return byTime === 0 ? left.eventId.localeCompare(right.eventId) : byTime
    })
  }

  async appendReviewEvent(event: ReviewEvent): Promise<AppendReviewResult> {
    return this.db.transaction('rw', this.db.reviewEvents, this.db.reviewKeys, async () => {
      const existingKey = await this.db.reviewKeys.get(event.idempotencyKey)
      if (existingKey) {
        const existingEvent = await this.db.reviewEvents.get(existingKey.eventId)
        if (existingEvent) return { event: existingEvent, inserted: false }
      }
      await this.db.reviewEvents.add(event)
      await this.db.reviewKeys.put({ idempotencyKey: event.idempotencyKey, eventId: event.eventId })
      return { event, inserted: true }
    })
  }

  async getReviewByIdempotencyKey(idempotencyKey: string): Promise<ReviewEvent | undefined> {
    const key = await this.db.reviewKeys.get(idempotencyKey)
    return key ? this.db.reviewEvents.get(key.eventId) : undefined
  }

  async listReviewEvents(): Promise<ReviewEvent[]> {
    const events = await this.db.reviewEvents.toArray()
    return events.sort((left, right) => {
      const byTime = left.reviewedAt.localeCompare(right.reviewedAt)
      return byTime === 0 ? left.eventId.localeCompare(right.eventId) : byTime
    })
  }

  async listReviewCards(): Promise<ReviewCardProjection[]> {
    return this.db.reviewCards.toArray()
  }

  async replaceReviewCards(cards: readonly ReviewCardProjection[]): Promise<void> {
    await this.db.transaction('rw', this.db.reviewCards, async () => {
      await this.db.reviewCards.clear()
      await this.db.reviewCards.bulkPut(cards as ReviewCardProjection[])
    })
  }

  async clearLearningData(): Promise<void> {
    await this.db.transaction('rw', this.db.attempts, this.db.attemptKeys, this.db.reviewEvents, this.db.reviewKeys, this.db.reviewCards, async () => {
      await Promise.all([
        this.db.attempts.clear(),
        this.db.attemptKeys.clear(),
        this.db.reviewEvents.clear(),
        this.db.reviewKeys.clear(),
        this.db.reviewCards.clear(),
      ])
    })
  }

  async mergeHistoricalEvents(attemptEvents: readonly AttemptEvent[], reviewEvents: readonly ReviewEvent[]): Promise<HistoricalImportResult> {
    return this.db.transaction('rw', this.db.attempts, this.db.attemptKeys, this.db.reviewEvents, this.db.reviewKeys, async () => {
      const existingAttempts = await this.db.attempts.toArray()
      const existingReviews = await this.db.reviewEvents.toArray()
      const attemptsById = new Map(existingAttempts.map((event) => [event.eventId, event]))
      const reviewsById = new Map(existingReviews.map((event) => [event.eventId, event]))
      const attemptKeys = new Map(existingAttempts.map((event) => [event.idempotencyKey, event]))
      const reviewKeys = new Map(existingReviews.map((event) => [event.idempotencyKey, event]))
      const newAttempts: AttemptEvent[] = []
      const newReviews: ReviewEvent[] = []

      for (const event of attemptEvents) {
        const byId = attemptsById.get(event.eventId)
        const byKey = attemptKeys.get(event.idempotencyKey)
        if ((byId && !sameHistoricalEvent(byId, event)) || (byKey && !sameHistoricalEvent(byKey, event))) throw new Error(`AttemptEvent conflict: ${event.eventId} has a different historical payload.`)
        if (!byId && !byKey) { newAttempts.push(event); attemptsById.set(event.eventId, event); attemptKeys.set(event.idempotencyKey, event) }
      }
      for (const event of reviewEvents) {
        const byId = reviewsById.get(event.eventId)
        const byKey = reviewKeys.get(event.idempotencyKey)
        if ((byId && !sameHistoricalEvent(byId, event)) || (byKey && !sameHistoricalEvent(byKey, event))) throw new Error(`ReviewEvent conflict: ${event.eventId} has a different historical payload.`)
        if (!byId && !byKey) { newReviews.push(event); reviewsById.set(event.eventId, event); reviewKeys.set(event.idempotencyKey, event) }
      }

      if (newAttempts.length) {
        await this.db.attempts.bulkAdd(newAttempts)
        await this.db.attemptKeys.bulkAdd(newAttempts.map((event) => ({ idempotencyKey: event.idempotencyKey, eventId: event.eventId })))
      }
      if (newReviews.length) {
        await this.db.reviewEvents.bulkAdd(newReviews)
        await this.db.reviewKeys.bulkAdd(newReviews.map((event) => ({ idempotencyKey: event.idempotencyKey, eventId: event.eventId })))
      }
      return {
        attemptEventsAdded: newAttempts.length,
        attemptEventsSkipped: attemptEvents.length - newAttempts.length,
        reviewEventsAdded: newReviews.length,
        reviewEventsSkipped: reviewEvents.length - newReviews.length,
      }
    })
  }

  async close(): Promise<void> {
    this.db.close()
  }
}

export const attemptRepository = new DexieAttemptRepository()

export async function deleteAttemptDatabase(databaseName = ATTEMPT_DATABASE_NAME): Promise<void> {
  await Dexie.delete(databaseName)
}
