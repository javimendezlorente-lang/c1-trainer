import type { BaseExercise } from './exercise'
import type { ClozeText } from './part1'

export type WordFormation = 'prefix' | 'negative_prefix' | 'suffix' | 'compound' | 'internal_change' | 'word_class_change'

export interface Part3Question {
  id: `q${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`
  gap: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  root: string
  canonicalAnswer: string
  acceptedAnswers?: string[]
  transformations: WordFormation[]
  explanation: string
}

export interface Part3Exercise extends BaseExercise {
  part: 3
  type: 'word_formation'
  content: ClozeText
  questions: [Part3Question, Part3Question, Part3Question, Part3Question, Part3Question, Part3Question, Part3Question, Part3Question]
}
