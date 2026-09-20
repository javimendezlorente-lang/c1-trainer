import { FACTORY_CONFIG } from '../config'
import type { CriticResult, CriticScores } from '../types'

const SCORE_KEYS: (keyof CriticScores)[] = [
  'cambridgeResemblance', 'c1Calibration', 'naturalness', 'coherence', 'distractorPlausibility',
  'answerUniqueness', 'lexicalSophistication', 'gapQuality', 'explanationCorrectness', 'pedagogicalUsefulness',
]

export function parseCriticResult(value: unknown): CriticResult {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Critic output must be an object')
  const record = value as Record<string, unknown>
  if (!record.scores || typeof record.scores !== 'object' || Array.isArray(record.scores)) throw new Error('Critic scores are missing')
  const scores = record.scores as Record<string, unknown>
  for (const key of SCORE_KEYS) if (!Number.isInteger(scores[key]) || Number(scores[key]) < 1 || Number(scores[key]) > 5) throw new Error(`Critic score ${key} must be an integer from 1 to 5`)
  if (!Array.isArray(record.hardFailures) || record.hardFailures.some((failure) => typeof failure !== 'string')) throw new Error('Critic hardFailures must be strings')
  if (!['ACCEPT', 'REJECT', 'BORDERLINE'].includes(String(record.verdict))) throw new Error('Critic verdict is invalid')
  if (typeof record.rationale !== 'string' || !record.rationale.trim()) throw new Error('Critic rationale is missing')
  return { scores: scores as unknown as CriticScores, hardFailures: record.hardFailures as string[], verdict: record.verdict as CriticResult['verdict'], rationale: record.rationale }
}

export function policyDecision(result: CriticResult): 'accepted' | 'rejected' | 'borderline' {
  if (result.hardFailures.length > 0 || result.verdict === 'REJECT') return 'rejected'
  if (result.verdict === 'BORDERLINE') return 'borderline'
  const values = SCORE_KEYS.map((key) => result.scores[key])
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const criticalPass = FACTORY_CONFIG.thresholds.critical.every((key) => result.scores[key] >= FACTORY_CONFIG.thresholds.criticalMinimum)
  const allPass = values.every((value) => value >= FACTORY_CONFIG.thresholds.minimumDimension)
  return criticalPass && allPass && mean >= FACTORY_CONFIG.thresholds.meanMinimum ? 'accepted' : 'rejected'
}
