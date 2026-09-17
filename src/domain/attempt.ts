import type { SchemaVersion } from './exercise'
import type { SkillSet } from './skills'

export const ATTEMPT_EVENT_VERSION = '1.0.0' as const

export interface AttemptQuestionResult {
  questionId: string
  answerKind: 'choice' | 'text' | 'transformation'
  answer: string | null
  correct: boolean
  marks: number
  maxMarks: number
  selectedOptionId?: string | null
  correctOptionId?: 'A' | 'B' | 'C' | 'D'
  canonicalAnswer: string
  acceptedAnswers: string[]
  primarySkill: SkillSet['primarySkill']
  secondarySkills: SkillSet['secondarySkills']
  root?: string
  transformations?: string[]
  originalSentence?: string
  keyword?: string
  secondSentence?: string
}

export interface AttemptEvent {
  eventVersion: typeof ATTEMPT_EVENT_VERSION
  eventId: string
  idempotencyKey: string
  kind: 'attempt_submitted'
  occurredAt: string
  exerciseId: string
  exerciseSchemaVersion: SchemaVersion
  part: 1 | 2 | 3 | 4
  type: 'multiple_choice_cloze' | 'open_cloze' | 'word_formation' | 'key_word_transformation'
  answers: Record<string, string | null>
  explanationReferences: Record<string, string>
  grade: {
    exerciseId: string
    score: number
    maxScore: number
    complete: boolean
    results: AttemptQuestionResult[]
  }
  skills: SkillSet
}
