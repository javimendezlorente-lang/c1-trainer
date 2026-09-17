import { ALL_SKILLS } from '../domain/skills'
import type { AttemptEvent } from '../domain/attempt'
import type { ReviewEvent, ReviewCardStateSnapshot } from '../domain/review'
import { BACKUP_FORMAT, type BackupEnvelopeV1 } from '../domain/backup'

export type BackupErrorCode = 'invalid_json' | 'unsupported_version' | 'invalid_backup' | 'invalid_attempt_event' | 'invalid_review_event' | 'historical_conflict' | 'storage_failure' | 'rebuild_failure'

export class BackupError extends Error {
  readonly code: BackupErrorCode
  constructor(code: BackupErrorCode, message: string) {
    super(message)
    this.name = 'BackupError'
    this.code = code
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function isIso(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime()) && new Date(value).toISOString() === value
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isSkill(value: unknown): boolean {
  return typeof value === 'string' && ALL_SKILLS.includes(value as typeof ALL_SKILLS[number])
}

function validStateSnapshot(value: unknown): value is ReviewCardStateSnapshot {
  if (!isRecord(value) || !['New', 'Learning', 'Review', 'Relearning'].includes(value.state as string)) return false
  return isIso(value.due) && isFiniteNumber(value.stability) && isFiniteNumber(value.difficulty) && isFiniteNumber(value.elapsedDays) && isFiniteNumber(value.scheduledDays) && isFiniteNumber(value.learningSteps) && isFiniteNumber(value.reps) && isFiniteNumber(value.lapses) && (value.lastReview === null || isIso(value.lastReview))
}

export function isValidAttemptEvent(value: unknown): value is AttemptEvent {
  if (!isRecord(value) || value.eventVersion !== '1.0.0' || value.kind !== 'attempt_submitted' || value.part !== 1 || value.type !== 'multiple_choice_cloze') return false
  if (![value.eventId, value.idempotencyKey, value.exerciseId].every((item) => typeof item === 'string' && item.length > 0) || !isIso(value.occurredAt) || value.exerciseSchemaVersion !== '1.0.0') return false
  if (!isRecord(value.answers) || !isRecord(value.explanationReferences) || !isRecord(value.grade) || !isRecord(value.skills)) return false
  if (!isSkill(value.skills.primarySkill) || !Array.isArray(value.skills.secondarySkills) || !value.skills.secondarySkills.every(isSkill)) return false
  if (typeof value.grade.exerciseId !== 'string' || !isFiniteNumber(value.grade.score) || !isFiniteNumber(value.grade.maxScore) || typeof value.grade.complete !== 'boolean' || !Array.isArray(value.grade.results)) return false
  return value.grade.results.every((result) => isRecord(result) && typeof result.questionId === 'string' && (result.selectedOptionId === null || ['A', 'B', 'C', 'D'].includes(result.selectedOptionId as string)) && ['A', 'B', 'C', 'D'].includes(result.correctOptionId as string) && typeof result.correct === 'boolean' && (result.marks === 0 || result.marks === 1))
}

export function isValidReviewEvent(value: unknown): value is ReviewEvent {
  if (!isRecord(value) || value.eventVersion !== '1.0.0' || value.kind !== 'review_submitted') return false
  if (![value.eventId, value.idempotencyKey, value.reviewCardId, value.exerciseId, value.questionId].every((item) => typeof item === 'string' && item.length > 0) || !isIso(value.reviewedAt) || !['Again', 'Hard', 'Good', 'Easy'].includes(value.rating as string)) return false
  if (!validStateSnapshot(value.previousState) || !validStateSnapshot(value.resultingState)) return false
  if (value.sourceAttemptId !== undefined && typeof value.sourceAttemptId !== 'string') return false
  if (value.skillSet !== undefined && (!isRecord(value.skillSet) || !isSkill(value.skillSet.primarySkill) || !Array.isArray(value.skillSet.secondarySkills) || !value.skillSet.secondarySkills.every(isSkill))) return false
  return true
}

export function validateBackupEnvelope(value: unknown): BackupEnvelopeV1 {
  if (!isRecord(value) || value.format !== BACKUP_FORMAT || typeof value.version !== 'string') throw new BackupError('invalid_backup', 'Backup envelope is missing its required format metadata.')
  if (!/^1\.\d+\.\d+$/.test(value.version)) throw new BackupError('unsupported_version', `Backup version ${String(value.version)} is not supported. Only 1.x.x is supported.`)
  if (!isIso(value.exportedAt) || !isRecord(value.app) || value.app.databaseVersion !== 3 || !Array.isArray(value.attemptEvents) || !Array.isArray(value.reviewEvents)) throw new BackupError('invalid_backup', 'Backup envelope metadata or ledgers are invalid.')
  if (!value.attemptEvents.every(isValidAttemptEvent)) throw new BackupError('invalid_attempt_event', 'Backup contains an invalid AttemptEvent.')
  if (!value.reviewEvents.every(isValidReviewEvent)) throw new BackupError('invalid_review_event', 'Backup contains an invalid ReviewEvent.')
  return value as unknown as BackupEnvelopeV1
}

export function parseBackupJson(json: string): BackupEnvelopeV1 {
  let value: unknown
  try { value = JSON.parse(json) } catch { throw new BackupError('invalid_json', 'The selected file is not valid JSON.') }
  return validateBackupEnvelope(value)
}
