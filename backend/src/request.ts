import { GenerationError } from './errors'
import { PART1_SKILLS, type Part1GenerationRequest, type Part1Skill, type RequestedDifficulty } from './types'

const ALLOWED_DOMAINS = new Set(['social psychology', 'urban ecology', 'work and technology', 'science and society'])
const ALLOWED_GENRES = new Set(['magazine feature', 'popular science article', 'opinion feature', 'research blog'])
const ALLOWED_DIFFICULTIES = new Set<RequestedDifficulty>(['standard', 'demanding'])
const PART1_SKILL_SET = new Set<string>(PART1_SKILLS)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function assertKeys(value: Record<string, unknown>, allowed: string[], label: string): void {
  const keys = Object.keys(value).sort()
  const expected = [...allowed].sort()
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
    throw new GenerationError('INVALID_REQUEST', `${label} contains unsupported or missing fields`, 400)
  }
}

export async function parseGenerationRequest(request: Request, maxBytes: number): Promise<Part1GenerationRequest> {
  const declaredLength = Number(request.headers.get('Content-Length') ?? 0)
  if (declaredLength > maxBytes) throw new GenerationError('INVALID_REQUEST', 'Request body is too large', 413)
  const body = await request.text()
  if (new TextEncoder().encode(body).byteLength > maxBytes) throw new GenerationError('INVALID_REQUEST', 'Request body is too large', 413)

  let value: unknown
  try {
    value = JSON.parse(body)
  } catch {
    throw new GenerationError('INVALID_REQUEST', 'Request body must be valid JSON', 400)
  }
  if (!isRecord(value)) throw new GenerationError('INVALID_REQUEST', 'Request body must be an object', 400)
  assertKeys(value, ['blueprint', 'difficulty'], 'request')
  if (typeof value.difficulty !== 'string' || !ALLOWED_DIFFICULTIES.has(value.difficulty as RequestedDifficulty)) {
    throw new GenerationError('INVALID_REQUEST', 'Unsupported difficulty', 400)
  }
  if (!isRecord(value.blueprint)) throw new GenerationError('INVALID_REQUEST', 'blueprint must be an object', 400)
  assertKeys(value.blueprint, ['genre', 'targetSkills', 'topicDomain'], 'blueprint')

  const { topicDomain, genre, targetSkills } = value.blueprint
  if (typeof topicDomain !== 'string' || !ALLOWED_DOMAINS.has(topicDomain)) throw new GenerationError('INVALID_REQUEST', 'Unsupported topicDomain', 400)
  if (typeof genre !== 'string' || !ALLOWED_GENRES.has(genre)) throw new GenerationError('INVALID_REQUEST', 'Unsupported genre', 400)
  if (!Array.isArray(targetSkills) || targetSkills.length < 2 || targetSkills.length > 4) throw new GenerationError('INVALID_REQUEST', 'targetSkills must contain 2–4 skills', 400)
  if (new Set(targetSkills).size !== targetSkills.length || targetSkills.some((skill) => typeof skill !== 'string' || !PART1_SKILL_SET.has(skill))) {
    throw new GenerationError('INVALID_REQUEST', 'targetSkills contains an unsupported or duplicate skill', 400)
  }

  return {
    difficulty: value.difficulty as RequestedDifficulty,
    blueprint: {
      topicDomain,
      genre,
      targetSkills: targetSkills as Part1Skill[],
    },
  }
}
