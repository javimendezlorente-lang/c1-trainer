import { describe, expect, it } from 'vitest'
import { ExerciseLibrary } from './exerciseLibrary'

const items = Array.from({ length: 1000 }, (_, index) => ({ id: `exercise-${index}`, part: 1 }))
const largeItems = Array.from({ length: 5000 }, (_, index) => ({ id: `large-exercise-${index}`, part: 1 }))
const source = { list: () => items }

describe('ExerciseLibrary', () => {
  it('selects unseen items before previously attempted items without random state', () => {
    const library = new ExerciseLibrary(source)
    expect(library.select({ part: 1, attemptedExerciseIds: ['exercise-0'], seed: 'test' }).id).not.toBe('exercise-0')
    expect(library.select({ part: 1, attemptedExerciseIds: items.map((item) => item.id), recentExerciseIds: ['exercise-0'], seed: 'test' }).id).not.toBe('exercise-0')
  })

  it('is deterministic for the same selection context', () => {
    const library = new ExerciseLibrary(source)
    const context = { part: 1, attemptedExerciseIds: ['exercise-1'], recentExerciseIds: ['exercise-2'], seed: 'stable' }
    expect(library.select(context).id).toBe(library.select(context).id)
  })

  it('handles 1,000 and 5,000 descriptor catalogues without assuming bundled text volume', () => {
    for (const descriptors of [items, largeItems]) {
      const selected = new ExerciseLibrary({ list: () => descriptors }).select({
        part: 1,
        attemptedExerciseIds: descriptors.slice(0, 100).map((item) => item.id),
        recentExerciseIds: [descriptors[99].id],
        seed: 'load-test',
      })
      expect(descriptors).toContain(selected)
      expect(selected.id).not.toBe(descriptors[99].id)
    }
  })
})
