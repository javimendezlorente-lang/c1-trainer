import type { SchemaVersion } from './exercise'
import type { SkillSet } from './skills'

export const ATTEMPT_EVENT_VERSION = '1.0.0' as const

export interface AttemptQuestionResult {
  questionId: string
  answerKind: 'choice' | 'text' | 'transformation' | 'matching'
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
  selectedTargetId?: string | null
  correctTargetId?: string
  targetLabel?: string
  correctTargetLabel?: string
  prompt?: string
  contextSnapshot?: string
}

export interface AttemptEvent {
  eventVersion: typeof ATTEMPT_EVENT_VERSION
  eventId: string
  idempotencyKey: string
  kind: 'attempt_submitted'
  occurredAt: string
  exerciseId: string
  exerciseSchemaVersion: SchemaVersion
  part: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  type: 'multiple_choice_cloze' | 'open_cloze' | 'word_formation' | 'key_word_transformation' | 'multiple_choice_reading' | 'cross_text_multiple_matching' | 'gapped_text' | 'multiple_matching'
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
