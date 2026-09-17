import type { Part1Exercise } from '../domain/part1'
import type { AttemptEvent } from '../domain/attempt'
import { gradePart1, type Part1Grade } from '../grading'
import { rebuildLearningProjections, type LearningProjections } from '../learning'
import { attemptRepository, type AttemptRepository } from '../storage'

export interface AttemptEventOptions {
  idempotencyKey: string
  eventId?: string
  occurredAt?: string
}

export interface SubmitPart1AttemptInput {
  exercise: Part1Exercise
  answers: Readonly<Record<string, string | null | undefined>>
  idempotencyKey: string
  repository?: AttemptRepository
  eventId?: string
  occurredAt?: string
}

export interface SubmitPart1AttemptResult {
  event: AttemptEvent
  grade: Part1Grade
  inserted: boolean
  projections: LearningProjections
}

function createIdentifier(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function createAttemptEvent(
  exercise: Part1Exercise,
  answers: Readonly<Record<string, string | null | undefined>>,
  grade: Part1Grade,
  options: AttemptEventOptions,
): AttemptEvent {
  if (grade.exerciseId !== exercise.id) {
    throw new Error('Attempt grade does not match the exercise.')
  }

  const answerSnapshot = Object.fromEntries(
    exercise.questions.map((question) => {
      const answer = answers[question.id]
      return [question.id, typeof answer === 'string' && answer.trim() !== '' ? answer : null]
    }),
  )

  return {
    eventVersion: '1.0.0',
    eventId: options.eventId ?? createIdentifier('attempt'),
    idempotencyKey: options.idempotencyKey,
    kind: 'attempt_submitted',
    occurredAt: options.occurredAt ?? new Date().toISOString(),
    exerciseId: exercise.id,
    exerciseSchemaVersion: exercise.schemaVersion,
    part: exercise.part,
    type: exercise.type,
    answers: answerSnapshot,
    explanationReferences: Object.fromEntries(
      exercise.questions.map((question) => [question.id, `${exercise.id}#${question.id}`]),
    ),
    grade: {
      exerciseId: grade.exerciseId,
      score: grade.score,
      maxScore: grade.maxScore,
      complete: grade.complete,
      results: grade.results.map((result) => ({ ...result })),
    },
    skills: {
      primarySkill: exercise.skills.primarySkill,
      secondarySkills: [...exercise.skills.secondarySkills],
    },
  }
}

export async function submitPart1Attempt(input: SubmitPart1AttemptInput): Promise<SubmitPart1AttemptResult> {
  const repository = input.repository ?? attemptRepository
  const existingEvent = await repository.getByIdempotencyKey(input.idempotencyKey)
  const grade = existingEvent?.grade ?? gradePart1(input.exercise, input.answers)
  const event = existingEvent ?? createAttemptEvent(input.exercise, input.answers, grade, input)
  const appendResult = existingEvent ? { event: existingEvent, inserted: false } : await repository.append(event)
  const events = await repository.list()

  return {
    event: appendResult.event,
    grade: appendResult.event.grade,
    inserted: appendResult.inserted,
    projections: rebuildLearningProjections(events),
  }
}

export async function rebuildProjections(repository: AttemptRepository = attemptRepository): Promise<LearningProjections> {
  return rebuildLearningProjections(await repository.list())
}
