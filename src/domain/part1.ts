import type { BaseExercise } from './exercise'

export interface ClozeGap {
  id: `g${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
}

export interface ClozeText {
  text: string
  gaps: ClozeGap[]
}

export interface Part1Option {
  id: 'A' | 'B' | 'C' | 'D'
  text: string
}

export interface Part1Question {
  id: `q${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`
  gap: ClozeGap['number']
  options: [Part1Option, Part1Option, Part1Option, Part1Option]
  correctOptionId: Part1Option['id']
  explanation: string
  distractorExplanations?: Record<string, string>
}

export interface Part1Exercise extends BaseExercise {
  part: 1
  type: 'multiple_choice_cloze'
  content: ClozeText
  questions: [Part1Question, Part1Question, Part1Question, Part1Question, Part1Question, Part1Question, Part1Question, Part1Question]
}
