import type { Part1Exercise, Part1Option } from '../domain/part1'
import { C1_RUOE_STRUCTURE } from '../domain/scoring'

export type Part1UserAnswers = Readonly<Record<string, string | null | undefined>>

export interface Part1QuestionResult {
  questionId: string
  selectedOptionId: string | null
  correctOptionId: Part1Option['id']
  correct: boolean
  marks: 0 | 1
}

export interface Part1Grade {
  exerciseId: string
  score: number
  maxScore: number
  complete: boolean
  results: Part1QuestionResult[]
}

export function gradePart1(exercise: Part1Exercise, userAnswers: Part1UserAnswers = {}): Part1Grade {
  const results = exercise.questions.map((question) => {
    const rawAnswer = userAnswers[question.id]
    const selectedOptionId = typeof rawAnswer === 'string' && rawAnswer.trim() !== '' ? rawAnswer : null
    const isValidOption = selectedOptionId !== null && question.options.some((option) => option.id === selectedOptionId)
    const correct = isValidOption && selectedOptionId === question.correctOptionId
    const marks: 0 | 1 = correct ? 1 : 0

    return {
      questionId: question.id,
      selectedOptionId,
      correctOptionId: question.correctOptionId,
      correct,
      marks,
    }
  })

  return {
    exerciseId: exercise.id,
    score: results.reduce((total, result) => total + result.marks, 0),
    maxScore: C1_RUOE_STRUCTURE[1].maxMarks,
    complete: results.every((result) => result.selectedOptionId !== null),
    results,
  }
}
