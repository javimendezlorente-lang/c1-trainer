import type { BaseExercise } from './exercise'

export interface PartialCreditUnit {
  id: string
  marks: 0 | 1 | 2
  acceptedAnswers?: string[]
  description?: string
}

export interface Part4Scoring {
  maxMarks: 2
  units: PartialCreditUnit[]
}

export interface Part4Question {
  id: `q${1 | 2 | 3 | 4 | 5 | 6}`
  originalSentence: string
  keyword: string
  secondSentence: string
  canonicalAnswer: string
  acceptedAnswers: string[]
  maxMarks: 2
  scoring?: Part4Scoring
}

export interface Part4Exercise extends BaseExercise {
  part: 4
  type: 'key_word_transformation'
  questions: [Part4Question, Part4Question, Part4Question, Part4Question, Part4Question, Part4Question]
}
