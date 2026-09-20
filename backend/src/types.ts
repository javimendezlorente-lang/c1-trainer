export const PART1_SKILLS = [
  'collocation',
  'fixed_expression',
  'phrasal_verb',
  'idiom',
  'semantic_precision',
  'complementation',
] as const

export type Part1Skill = typeof PART1_SKILLS[number]
export type RequestedDifficulty = 'standard' | 'demanding'

export interface Part1GenerationRequest {
  difficulty: RequestedDifficulty
  blueprint: {
    topicDomain: string
    genre: string
    targetSkills: readonly Part1Skill[]
  }
}

export interface Part1Candidate {
  title: string
  difficulty: 2 | 3 | 4 | 5
  topic: string
  skills: {
    primarySkill: Part1Skill
    secondarySkills: Part1Skill[]
  }
  content: {
    text: string
    gaps: Array<{ id: `g${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`; number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 }>
  }
  questions: Array<{
    id: `q${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`
    gap: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
    options: Array<{ id: 'A' | 'B' | 'C' | 'D'; text: string }>
    correctOptionId: 'A' | 'B' | 'C' | 'D'
    explanation: string
    distractorExplanations?: Record<string, string>
  }>
}

export interface GenerationMetadata {
  model: string
  promptVersion: string
  requestId: string
  usage: {
    input_tokens?: number
    cached_input_tokens?: number
    output_tokens?: number
    reasoning_tokens?: number
    total_tokens?: number
  }
  latencyMs: number
}

export interface CanonicalPart1Exercise extends Part1Candidate {
  schemaVersion: '1.0.0'
  id: `gen-c1-p1-${string}`
  exam: 'C1_ADVANCED'
  paper: 'READING_USE_OF_ENGLISH'
  part: 1
  type: 'multiple_choice_cloze'
  source: {
    kind: 'original_ai'
    generator: string
    reviewStatus: 'review' | 'approved'
  }
}
