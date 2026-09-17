import type { AttemptEvent, AttemptQuestionResult } from '../domain/attempt'
import type { ImplementedExercise } from '../domain/exercise'
import { gradeExercise, type ExerciseGrade } from '../grading'
import { rebuildLearningProjections, rebuildReviewCards, type LearningProjections } from '../learning'
import { attemptRepository, type AttemptRepository } from '../storage'
import { nowIso } from '../time/clock'
export interface AttemptEventOptions { idempotencyKey: string; eventId?: string; occurredAt?: string }
export interface SubmitExerciseAttemptInput { exercise: ImplementedExercise; answers: Readonly<Record<string, string | null | undefined>>; idempotencyKey: string; repository?: AttemptRepository; eventId?: string; occurredAt?: string }
export interface SubmitExerciseAttemptResult { event: AttemptEvent; grade: ExerciseGrade; inserted: boolean; projections: LearningProjections }
function createIdentifier(prefix: string) { return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? `${prefix}_${crypto.randomUUID()}` : `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}` }
function snapshot(value: string | null | undefined) { return typeof value === 'string' && value.trim() !== '' ? value.trim() : null }
export function createAttemptEvent(exercise: ImplementedExercise, answers: Readonly<Record<string, string | null | undefined>>, grade: ExerciseGrade, options: AttemptEventOptions): AttemptEvent {
  if (grade.exerciseId !== exercise.id) throw new Error('Attempt grade does not match the exercise.')
  const results: AttemptQuestionResult[] = grade.results.map((result) => {
    const question = exercise.questions.find((item) => item.id === result.questionId)
    const base = { questionId: result.questionId, answerKind: exercise.part === 1 ? 'choice' as const : exercise.part === 4 ? 'transformation' as const : 'text' as const, answer: 'answer' in result ? snapshot(result.answer) : snapshot(answers[result.questionId]), correct: result.correct, marks: result.marks, maxMarks: 'maxMarks' in result ? result.maxMarks : 1, canonicalAnswer: 'canonicalAnswer' in result ? result.canonicalAnswer : '', acceptedAnswers: 'acceptedAnswers' in result ? [...result.acceptedAnswers] : [], primarySkill: exercise.skills.primarySkill, secondarySkills: [...exercise.skills.secondarySkills] }
    if (exercise.part === 1) { const part1Result = result as { selectedOptionId: string | null; correctOptionId: 'A'|'B'|'C'|'D' }; const part1Question = question as { options: { id: string; text: string }[] }; return { ...base, answer: part1Result.selectedOptionId, canonicalAnswer: part1Question.options.find((option) => option.id === part1Result.correctOptionId)?.text ?? part1Result.correctOptionId, acceptedAnswers: [part1Result.correctOptionId], selectedOptionId: part1Result.selectedOptionId, correctOptionId: part1Result.correctOptionId } }
    if (exercise.part === 3) { const part3Result = result as { root: string; transformations: string[] }; return { ...base, root: part3Result.root, transformations: [...part3Result.transformations] } }
    if (exercise.part === 4) { const part4Result = result as { originalSentence: string; keyword: string; secondSentence: string }; return { ...base, originalSentence: part4Result.originalSentence, keyword: part4Result.keyword, secondSentence: part4Result.secondSentence } }
    return base
  })
  return { eventVersion: '1.0.0', eventId: options.eventId ?? createIdentifier('attempt'), idempotencyKey: options.idempotencyKey, kind: 'attempt_submitted', occurredAt: options.occurredAt ?? nowIso(), exerciseId: exercise.id, exerciseSchemaVersion: exercise.schemaVersion, part: exercise.part, type: exercise.type, answers: Object.fromEntries(exercise.questions.map((question) => [question.id, snapshot(answers[question.id])])), explanationReferences: Object.fromEntries(exercise.questions.map((question) => [question.id, `${exercise.id}#${question.id}`])), grade: { exerciseId: grade.exerciseId, score: grade.score, maxScore: grade.maxScore, complete: grade.complete, results }, skills: { primarySkill: exercise.skills.primarySkill, secondarySkills: [...exercise.skills.secondarySkills] } }
}
export async function submitExerciseAttempt(input: SubmitExerciseAttemptInput): Promise<SubmitExerciseAttemptResult> {
  const repository = input.repository ?? attemptRepository
  const existingEvent = await repository.getByIdempotencyKey(input.idempotencyKey)
  const grade = (existingEvent?.grade ?? gradeExercise(input.exercise, input.answers)) as ExerciseGrade
  const event = existingEvent ?? createAttemptEvent(input.exercise, input.answers, grade, input)
  const appendResult = existingEvent ? { event: existingEvent, inserted: false } : await repository.append(event)
  const [events, reviewEvents] = await Promise.all([repository.list(), repository.listReviewEvents()])
  const projections = rebuildLearningProjections(events, reviewEvents)
  await repository.replaceReviewCards(rebuildReviewCards(events, reviewEvents))
  return { event: appendResult.event, grade: appendResult.event.grade as ExerciseGrade, inserted: appendResult.inserted, projections }
}
export async function rebuildProjections(repository: AttemptRepository = attemptRepository) { const [events, reviewEvents] = await Promise.all([repository.list(), repository.listReviewEvents()]); return rebuildLearningProjections(events, reviewEvents) }
