import type { Part1Exercise } from '../domain/part1'

const approvedPart1Modules = import.meta.glob('../../content/approved/part1/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

function assertPart1Exercise(value: unknown): Part1Exercise {
  if (!value || typeof value !== 'object') {
    throw new Error('Approved Part 1 content must be an object.')
  }

  const candidate = value as Partial<Part1Exercise>
  if (
    candidate.schemaVersion !== '1.0.0' ||
    candidate.part !== 1 ||
    candidate.type !== 'multiple_choice_cloze' ||
    !Array.isArray(candidate.questions) ||
    candidate.questions.length !== 8
  ) {
    throw new Error('Approved Part 1 content does not match the canonical exercise contract.')
  }

  return candidate as Part1Exercise
}

const approvedPart1Exercises = Object.values(approvedPart1Modules)
  .map(assertPart1Exercise)
  .sort((left, right) => left.id.localeCompare(right.id))

export function listApprovedPart1Exercises(): readonly Part1Exercise[] {
  return approvedPart1Exercises
}

export function listApprovedExercises(
  part: number = 1,
  type: string = 'multiple_choice_cloze',
): readonly Part1Exercise[] {
  return approvedPart1Exercises.filter((exercise) => exercise.part === part && exercise.type === type)
}

export function getApprovedPart1Exercise(id: string): Part1Exercise | undefined {
  return approvedPart1Exercises.find((exercise) => exercise.id === id)
}
