import type { BaseExercise } from './exercise'
import type { ClozeText } from './part1'

export interface Part2Question {
  id: `q${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`
  gap: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  acceptedAnswers: string[]
  canonicalAnswer: string
  explanation: string
}

export interface Part2Exercise extends BaseExercise {
  part: 2
  type: 'open_cloze'
  content: ClozeText
  questions: [Part2Question, Part2Question, Part2Question, Part2Question, Part2Question, Part2Question, Part2Question, Part2Question]
}
