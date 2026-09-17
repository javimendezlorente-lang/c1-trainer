import { describe, expect, it } from 'vitest'
import { listApprovedPart5Exercises, listApprovedPart6Exercises, listApprovedPart7Exercises, listApprovedPart8Exercises } from '../content'
import { gradePart5, gradePart6, gradePart7, gradePart8 } from './index'

describe('Reading Parts 5–8 graders', () => {
  it('grades the official mark weights and leaves exercises unchanged', () => {
    for (const [exercise, grader, expected] of [[listApprovedPart5Exercises()[0], gradePart5, 12], [listApprovedPart6Exercises()[0], gradePart6, 8], [listApprovedPart7Exercises()[0], gradePart7, 12], [listApprovedPart8Exercises()[0], gradePart8, 10]]) {
      const before = JSON.stringify(exercise)
      const answers = Object.fromEntries(exercise.questions.map((q) => [q.id, q.correctOptionId ?? q.correctTextId ?? q.correctParagraphId]))
      const result = grader(exercise, answers)
      expect(result.score).toBe(expected)
      expect(result.complete).toBe(true)
      expect(JSON.stringify(exercise)).toBe(before)
    }
  })

  it('marks unanswered and invalid targets wrong, and rejects duplicate Part 7 paragraphs', () => {
    const p5 = listApprovedPart5Exercises()[0]
    expect(gradePart5(p5, { q1: 'X' }).results[0]).toMatchObject({ correct: false, marks: 0 })
    const p7 = listApprovedPart7Exercises()[0]
    expect(gradePart7(p7, { q1: 'para-a', q2: 'para-a' }).results.slice(0, 2).every((r) => !r.correct)).toBe(true)
    expect(gradePart8(listApprovedPart8Exercises()[0], { q1: 'missing' }).results[0].correct).toBe(false)
  })
})
