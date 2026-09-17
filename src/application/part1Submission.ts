import type { Part1Exercise } from '../domain/part1'
import type { Part1Grade } from '../grading'
import { submitExerciseAttempt, createAttemptEvent, rebuildProjections, type AttemptEventOptions } from './attemptSubmission'
export { createAttemptEvent, rebuildProjections }
export type { AttemptEventOptions }
export interface SubmitPart1AttemptInput { exercise: Part1Exercise; answers: Readonly<Record<string, string | null | undefined>>; idempotencyKey: string; repository?: import('../storage').AttemptRepository; eventId?: string; occurredAt?: string }
export async function submitPart1Attempt(input: SubmitPart1AttemptInput) { return submitExerciseAttempt(input) as Promise<{ event: import('../domain/attempt').AttemptEvent; grade: Part1Grade; inserted: boolean; projections: import('../learning').LearningProjections }> }
