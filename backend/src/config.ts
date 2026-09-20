export interface Env {
  OPENAI_API_KEY: string
  C1_TRAINER_ACCESS_TOKEN: string
  ALLOWED_ORIGINS?: string
  GENERATOR_MODEL?: string
}

export const GENERATION_CONFIG = {
  defaultModel: 'gpt-5.6-luna',
  promptVersion: 'part1-v1',
  reasoningEffort: 'low' as const,
  maxOutputTokens: 3_200,
  maxRequestBytes: 8_192,
  cooldownMs: 15_000,
  targetWordCount: { min: 130, max: 170 },
  targetGapSpacing: { hardMinimum: 6, medianMin: 11, medianMax: 20 },
}

export function generatorModel(env: Env): string {
  return env.GENERATOR_MODEL?.trim() || GENERATION_CONFIG.defaultModel
}

export function allowedOrigins(env: Env): string[] {
  return (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}
