import { describe, expect, it } from 'vitest'
import { listApprovedPart1Exercises } from '../content'
import { gradePart1 } from './part1Grader'

const exercise = listApprovedPart1Exercises()[0]

function answersFrom(selection) {
  return Object.fromEntries(exercise.questions.map((question) => [question.id, selection(question)]))
}

describe('gradePart1', () => {
  it('awards one mark for each of the eight correct answers', () => {
    const grade = gradePart1(exercise, answersFrom((question) => question.correctOptionId))

    expect(grade).toMatchObject({ exerciseId: exercise.id, score: 8, maxScore: 8, complete: true })
    expect(grade.results).toHaveLength(8)
    expect(grade.results.every((result) => result.correct && result.marks === 1)).toBe(true)
  })

  it('awards zero for all wrong answers', () => {
    const grade = gradePart1(exercise, answersFrom((question) => question.options.find((option) => option.id !== question.correctOptionId).id))

    expect(grade.score).toBe(0)
    expect(grade.results.every((result) => !result.correct && result.marks === 0)).toBe(true)
  })

  it('handles mixed and unanswered responses', () => {
    const grade = gradePart1(exercise, {
      q1: exercise.questions[0].correctOptionId,
      q2: 'Z',
      q3: null,
    })

    expect(grade.score).toBe(1)
    expect(grade.complete).toBe(false)
    expect(grade.results).toHaveLength(8)
    expect(grade.results[1].selectedOptionId).toBe('Z')
    expect(grade.results[2].selectedOptionId).toBeNull()
  })

  it('does not mutate the exercise or answers', () => {
    const answers = answersFrom((question) => question.correctOptionId)
    const exerciseBefore = JSON.stringify(exercise)
    const answersBefore = JSON.stringify(answers)

    gradePart1(exercise, answers)

    expect(JSON.stringify(exercise)).toBe(exerciseBefore)
    expect(JSON.stringify(answers)).toBe(answersBefore)
  })
})
