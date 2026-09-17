import { describe, expect, it } from 'vitest'
import {
  getApprovedPart1Exercise,
  listApprovedExercises,
  listApprovedPart1Exercises,
} from './contentRepository'

describe('approved content repository', () => {
  it('exposes the bundled Part 1 corpus by part and type', () => {
    const exercises = listApprovedPart1Exercises()

    expect(exercises).toHaveLength(3)
    expect(exercises.every((exercise) => exercise.part === 1 && exercise.type === 'multiple_choice_cloze')).toBe(true)
    expect(exercises.every((exercise) => exercise.questions.length === 8)).toBe(true)
    expect(listApprovedExercises(1, 'multiple_choice_cloze')).toHaveLength(3)
  })

  it('retrieves an exercise by stable ID', () => {
    expect(getApprovedPart1Exercise('c1-ruoe-p1-000001')?.title).toBe('Signals in the canopy')
    expect(getApprovedPart1Exercise('missing')).toBeUndefined()
  })
})
