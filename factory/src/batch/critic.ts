import criticSchema from '../quality/criticSchema.json'
import { FACTORY_CONFIG } from '../config'
import type { CandidateRecord, GenerationBlueprint } from '../types'

export function criticBody(candidate: CandidateRecord): Record<string, unknown> {
  return {
    model: FACTORY_CONFIG.criticModel,
    store: false,
    reasoning: { effort: 'medium' },
    max_output_tokens: FACTORY_CONFIG.maxCriticOutputTokens,
    input: [
      {
        role: 'developer',
        content: [
          'You are an independent quality critic for original C1 Part 1 material.',
          'Evaluate the candidate against the rubric, not against copied Cambridge text.',
          'Use hardFailures for any critical defect. Do not accept a candidate because an average score is high when a critical dimension fails.',
          'Return only the strict structured critic object.',
        ].join('\n'),
      },
      { role: 'user', content: JSON.stringify({ blueprint: candidate.blueprint, exercise: candidate.exercise }) },
    ],
    text: { format: { type: 'json_schema', name: 'c1_part1_critic_v1', strict: true, schema: criticSchema } },
  }
}

export function criticBatchLine(candidate: CandidateRecord): Record<string, unknown> {
  return { custom_id: `${candidate.customId}-critic`, method: 'POST', url: '/v1/responses', body: criticBody(candidate) }
}

export function criticJsonl(candidates: CandidateRecord[]): string {
  return `${candidates.map((candidate) => JSON.stringify(criticBatchLine(candidate))).join('\n')}\n`
}

export function criticCustomIdFor(candidate: CandidateRecord | GenerationBlueprint): string {
  return `${candidate.customId}-critic`
}
