import type { Part1Exercise } from './part1'
import type { Part2Exercise } from './part2'
import type { Part3Exercise } from './part3'
import type { Part4Exercise } from './part4'
import type { Part5Exercise } from './part5'
import type { Part6Exercise } from './part6'
import type { Part7Exercise } from './part7'
import type { Part8Exercise } from './part8'
import type { SkillSet } from './skills'

export const SUPPORTED_SCHEMA_VERSION = '1.0.0' as const

export type SchemaVersion = typeof SUPPORTED_SCHEMA_VERSION
export type Difficulty = 1 | 2 | 3 | 4 | 5
export type ProvenanceKind = 'original_manual' | 'original_ai' | 'imported_permitted'
export type ReviewStatus = 'draft' | 'review' | 'approved' | 'rejected'

export interface ExerciseSource {
  kind: ProvenanceKind
  generator?: string
  reviewStatus: ReviewStatus
}

export interface BaseExercise {
  schemaVersion: SchemaVersion
  id: `c1-ruoe-p${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}-${string}`
  exam: 'C1_ADVANCED'
  paper: 'READING_USE_OF_ENGLISH'
  part: number
  type: string
  title: string
  difficulty: Difficulty
  topic: string
  source: ExerciseSource
  skills: SkillSet
}

export type ImplementedExercise =
  | Part1Exercise
  | Part2Exercise
  | Part3Exercise
  | Part4Exercise
  | Part5Exercise
  | Part6Exercise
  | Part7Exercise
  | Part8Exercise

export type FutureExerciseType =
  | 'multiple_choice_reading'
  | 'cross_text_multiple_matching'
  | 'gapped_text'
  | 'multiple_matching'

export type Exercise = ImplementedExercise
