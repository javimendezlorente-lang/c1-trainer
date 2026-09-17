import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterEach, describe, expect, it } from 'vitest'
import { gradePart1 } from '../grading'
import { listApprovedPart1Exercises } from '../content'
import { createAttemptEvent } from '../application/part1Submission'
import {
  C1TrainerDatabase,
  DexieAttemptRepository,
  deleteAttemptDatabase,
} from './attemptRepository'

const exercise = listApprovedPart1Exercises()[0]
const databaseNames = new Set()

function makeEvent(idempotencyKey, eventId = `${idempotencyKey}-event`) {
  const answers = Object.fromEntries(exercise.questions.map((question) => [question.id, question.correctOptionId]))
  return createAttemptEvent(exercise, answers, gradePart1(exercise, answers), {
    idempotencyKey,
    eventId,
    occurredAt: '2026-01-01T00:00:00.000Z',
  })
}

function uniqueDatabaseName() {
  const name = `c1-trainer-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
  databaseNames.add(name)
  return name
}

afterEach(async () => {
  await Promise.all([...databaseNames].map((name) => deleteAttemptDatabase(name)))
  databaseNames.clear()
})

describe('DexieAttemptRepository', () => {
  it('appends once and makes duplicate idempotency keys return the original event', async () => {
    const repository = new DexieAttemptRepository(uniqueDatabaseName())
    const first = makeEvent('submit-1', 'event-1')
    const duplicate = makeEvent('submit-1', 'event-2')

    await expect(repository.append(first)).resolves.toMatchObject({ inserted: true, event: first })
    await expect(repository.append(duplicate)).resolves.toMatchObject({ inserted: false, event: first })
    await expect(repository.list()).resolves.toEqual([first])
    await repository.close()
  })

  it('upgrades a version-one database and backfills event metadata and idempotency keys', async () => {
    const databaseName = uniqueDatabaseName()
    const legacyDatabase = new Dexie(databaseName)
    const legacyEvent = makeEvent('legacy-submit', 'legacy-event')
    delete legacyEvent.eventVersion
    delete legacyEvent.kind
    delete legacyEvent.exerciseSchemaVersion
    delete legacyEvent.type

    legacyDatabase.version(1).stores({
      attempts: 'eventId, idempotencyKey, occurredAt, exerciseId, part',
      meta: 'key',
    })
    await legacyDatabase.open()
    await legacyDatabase.table('attempts').add(legacyEvent)
    legacyDatabase.close()

    const repository = new DexieAttemptRepository(databaseName)
    const migrated = await repository.getByIdempotencyKey('legacy-submit')

    expect(migrated).toMatchObject({
      eventId: 'legacy-event',
      eventVersion: '1.0.0',
      kind: 'attempt_submitted',
      exerciseSchemaVersion: '1.0.0',
      type: 'multiple_choice_cloze',
    })
    await repository.close()
  })

  it('exposes the expected database migration version', () => {
    const database = new C1TrainerDatabase(uniqueDatabaseName())
    expect(database.verno).toBe(2)
    database.close()
  })
})
