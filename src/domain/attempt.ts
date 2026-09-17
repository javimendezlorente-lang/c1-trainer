import type { SchemaVersion } from './exercise'
import type { SkillSet } from './skills'

export const ATTEMPT_EVENT_VERSION = '1.0.0' as const

export interface AttemptQuestionResult {
  questionId: string
  selectedOptionId: string | null
  correctOptionId: 'A' | 'B' | 'C' | 'D'
  correct: boolean
  marks: 0 | 1
}

export interface AttemptEvent {
  eventVersion: typeof ATTEMPT_EVENT_VERSION
  eventId: string
  idempotencyKey: string
  kind: 'attempt_submitted'
  occurredAt: string
  exerciseId: string
  exerciseSchemaVersion: SchemaVersion
  part: 1
  type: 'multiple_choice_cloze'
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
