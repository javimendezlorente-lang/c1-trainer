import { PART1_PROMPT_V2 } from '../../backend/src/generation/prompts/part1-v2'

export const FACTORY_CONFIG = {
  generatorModel: process.env.C1_FACTORY_GENERATOR_MODEL?.trim() || 'gpt-5.6-luna',
  criticModel: process.env.C1_FACTORY_CRITIC_MODEL?.trim() || 'gpt-5.6-terra',
  adjudicatorModel: process.env.C1_FACTORY_ADJUDICATOR_MODEL?.trim() || 'gpt-5.6-sol',
  promptVersion: PART1_PROMPT_V2,
  calibrationProfileVersion: 'part1-calibration-v1',
  reasoningEffort: 'low' as const,
  maxOutputTokens: 3200,
  maxCriticOutputTokens: 1600,
  maxRegenerations: 2,
  novelty: {
    nearDuplicateReject: 0.82,
    nearDuplicateFlag: 0.72,
    maxTargetExpressionCount: 2,
  },
  thresholds: {
    critical: ['answerUniqueness', 'c1Calibration', 'naturalness', 'explanationCorrectness'] as const,
    minimumDimension: 3,
    criticalMinimum: 4,
    meanMinimum: 4,
  },
}

export function configuredCostRates(): Record<string, number> | null {
  const names = [
    'C1_FACTORY_LUNA_INPUT_USD_PER_MILLION',
    'C1_FACTORY_LUNA_OUTPUT_USD_PER_MILLION',
    'C1_FACTORY_TERRA_INPUT_USD_PER_MILLION',
    'C1_FACTORY_TERRA_OUTPUT_USD_PER_MILLION',
    'C1_FACTORY_SOL_INPUT_USD_PER_MILLION',
    'C1_FACTORY_SOL_OUTPUT_USD_PER_MILLION',
  ]
  const values = Object.fromEntries(names.map((name) => [name, Number(process.env[name])]))
  return Object.values(values).every((value) => Number.isFinite(value) && value >= 0) ? values : null
}
