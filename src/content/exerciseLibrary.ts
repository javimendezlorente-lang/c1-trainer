import type { ImplementedExercise } from '../domain/exercise'
import { listPracticeExercises } from './contentRepository'

export interface ExerciseSelectionContext {
  part: number
  attemptedExerciseIds?: readonly string[]
  recentExerciseIds?: readonly string[]
  now?: string
  seed?: string
}

export interface ExerciseSource {
  list(part?: number): readonly ImplementedExercise[]
}

export class BundledExerciseSource implements ExerciseSource {
  list(part?: number): readonly ImplementedExercise[] { return listPracticeExercises(part) }
}

function hash(value: string): number {
  let result = 2166136261
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619)
  return result >>> 0
}

/** Deterministic now; a future downloaded pack can implement ExerciseSource without changing the learner flow. */
export class ExerciseLibrary {
  constructor(private readonly source: ExerciseSource = new BundledExerciseSource()) {}

  list(part?: number): readonly ImplementedExercise[] { return this.source.list(part) }

  select(context: ExerciseSelectionContext): ImplementedExercise | undefined {
    const candidates = [...this.source.list(context.part)]
    if (!candidates.length) return undefined
    const attempted = new Set(context.attemptedExerciseIds ?? [])
    const recent = new Set(context.recentExerciseIds ?? [])
    const unseen = candidates.filter((exercise) => !attempted.has(exercise.id))
    const pool = unseen.length ? unseen : candidates.filter((exercise) => !recent.has(exercise.id))
    const eligible = pool.length ? pool : candidates
    const selected = [...eligible].sort((left, right) => {
      const leftAttempt = attempted.has(left.id) ? 1 : 0
      const rightAttempt = attempted.has(right.id) ? 1 : 0
      if (leftAttempt !== rightAttempt) return leftAttempt - rightAttempt
      const leftRecent = recent.has(left.id) ? 1 : 0
      const rightRecent = recent.has(right.id) ? 1 : 0
      if (leftRecent !== rightRecent) return leftRecent - rightRecent
      return hash(`${context.seed ?? 'c1-trainer'}:${left.id}`) - hash(`${context.seed ?? 'c1-trainer'}:${right.id}`)
    })[0]
    return selected
  }
}

export const exerciseLibrary = new ExerciseLibrary()
