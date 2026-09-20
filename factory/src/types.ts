import type { CanonicalPart1Exercise, Part1Candidate } from '../../backend/src/types'

export const FACTORY_SKILLS = ['collocation', 'fixed_expression', 'phrasal_verb', 'semantic_precision', 'complementation', 'idiom'] as const
export type FactorySkill = typeof FACTORY_SKILLS[number]
export type FactoryDifficulty = 2 | 3 | 4

export interface GenerationBlueprint {
  runId: string
  ordinal: number
  customId: string
  part: 1
  difficulty: FactoryDifficulty
  genre: string
  domain: string
  subtopic: string
  targetProfile: Record<FactorySkill, number>
  avoidTargets: string[]
  seed: string
  calibrationProfileVersion: string
  attempt?: number
  previousRejectionReasons?: string[]
}

export interface BatchLine {
  custom_id: string
  method: 'POST'
  url: '/v1/responses'
  body: Record<string, unknown>
}

export type RunStatus = 'planned' | 'batch_input_built' | 'submitted' | 'in_progress' | 'completed' | 'validated' | 'critic_input_built' | 'critic_submitted' | 'critic_completed' | 'ready_for_manual_review' | 'promoted' | 'failed'

export interface StageTelemetry {
  inputTokens: number
  cachedInputTokens: number
  outputTokens: number
  reasoningTokens: number
  totalTokens: number
  requests: number
}

export interface RunManifest {
  runId: string
  createdAt: string
  completedAt?: string
  model: string
  modelSnapshot?: string | null
  criticModel: string
  promptVersion: string
  calibrationProfileVersion: string
  candidateCount: number
  reasoningEffort: string
  batchId?: string | null
  criticBatchId?: string | null
  regenerationBatchIds: string[]
  status: RunStatus
  generator: StageTelemetry
  critic: StageTelemetry
  adjudicator: StageTelemetry
  accepted: number
  rejected: number
  borderline: number
  regenerated: number
  failedBlueprints: number
  rejectionReasons: Record<string, number>
  estimatedCostUsd: number | null
}

export interface ValidatedCandidate {
  customId: string
  blueprint: GenerationBlueprint
  exercise: CanonicalPart1Exercise
}

export interface CatalogEntry {
  id: string
  status: 'bundled' | 'candidate' | 'approved' | 'rejected' | 'borderline'
  passageFingerprint: string
  passageShingles: string[]
  questionFingerprints: string[]
  optionSetFingerprints: string[]
  correctAnswerExpressions: string[]
  topic: string
  subtopic: string
  genre: string
  skills: string[]
  targetExpressions: string[]
  runId?: string
}

export interface NoveltyDecision {
  accepted: boolean
  flags: string[]
  comparedWith: string[]
}

export interface CriticScores {
  cambridgeResemblance: number
  c1Calibration: number
  naturalness: number
  coherence: number
  distractorPlausibility: number
  answerUniqueness: number
  lexicalSophistication: number
  gapQuality: number
  explanationCorrectness: number
  pedagogicalUsefulness: number
}

export interface CriticResult {
  scores: CriticScores
  hardFailures: string[]
  verdict: 'ACCEPT' | 'REJECT' | 'BORDERLINE'
  rationale: string
}

export interface CandidateRecord extends ValidatedCandidate {
  status: 'candidate' | 'accepted' | 'rejected' | 'borderline' | 'approved'
  critic?: CriticResult
  rejectionReasons?: string[]
}

export type CandidateInput = Part1Candidate
