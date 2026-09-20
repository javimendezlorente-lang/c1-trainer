import { FACTORY_CONFIG } from './config'
import { FACTORY_SKILLS, type FactoryDifficulty, type FactorySkill, type GenerationBlueprint } from './types'

const DOMAINS = ['society', 'science', 'psychology', 'culture', 'history', 'education', 'work', 'environment', 'technology', 'arts', 'everyday phenomena', 'travel', 'communication', 'human behaviour']
const GENRES = ['magazine feature', 'newspaper-style feature', 'informational article', 'review-style prose', 'narrative/expository hybrid']
const SUBTOPICS = [
  'how communities adapt to gradual change', 'the hidden design of public spaces', 'why habits spread through groups', 'the psychology of delayed decisions',
  'the changing meaning of craft', 'unintended effects of local innovation', 'how museums shape attention', 'the social life of repair',
  'what makes a workplace learn', 'how language changes cooperation', 'the practical value of amateur expertise', 'small discoveries in ordinary routines',
  'the relationship between memory and place', 'how travel alters familiar assumptions', 'the role of patience in skilled work', 'unexpected patterns in shared behaviour',
]
const TARGET_EXPRESSIONS = ['draw a distinction', 'raise an objection', 'take something for granted', 'lend support to', 'account for', 'bear in mind', 'come to terms with', 'set a precedent', 'shed light on', 'strike a balance', 'hold something in reserve', 'run counter to']

function seededNumber(seed: string): number {
  let value = 2166136261
  for (const character of seed) value = Math.imul(value ^ character.charCodeAt(0), 16777619)
  return (value >>> 0) / 4294967296
}

function choose<T>(items: readonly T[], seed: string): T {
  return items[Math.floor(seededNumber(seed) * items.length)]
}

function targetProfile(seed: string): Record<FactorySkill, number> {
  const result = Object.fromEntries(FACTORY_SKILLS.map((skill) => [skill, 0])) as Record<FactorySkill, number>
  const ordered = [...FACTORY_SKILLS].sort((left, right) => seededNumber(`${seed}:${left}`) - seededNumber(`${seed}:${right}`))
  const counts = [3, 2, 1, 1, 1]
  ordered.slice(0, counts.length).forEach((skill, index) => { result[skill] = counts[index] })
  return result
}

function difficultyFor(seed: string): FactoryDifficulty {
  const value = seededNumber(seed)
  if (value < 0.18) return 2
  if (value < 0.82) return 3
  return 4
}

export function customIdFor(runId: string, ordinal: number): string {
  return `part1-${runId}-candidate-${String(ordinal).padStart(6, '0')}`
}

export function planPart1(runId: string, count: number, seed = runId): GenerationBlueprint[] {
  if (!Number.isInteger(count) || count < 1 || count > 50_000) throw new Error('Planner count must be an integer between 1 and 50,000')
  const blueprints: GenerationBlueprint[] = []
  for (let index = 0; index < count; index += 1) {
    const itemSeed = `${seed}:${index + 1}`
    const domain = choose(DOMAINS, `${itemSeed}:domain`)
    const genre = choose(GENRES, `${itemSeed}:genre`)
    const subtopic = `${choose(SUBTOPICS, `${itemSeed}:subtopic`)} (${domain} lens ${index + 1})`
    const selectedTarget = choose(TARGET_EXPRESSIONS, `${itemSeed}:target`)
    blueprints.push({
      runId,
      ordinal: index + 1,
      customId: customIdFor(runId, index + 1),
      part: 1,
      difficulty: difficultyFor(`${itemSeed}:difficulty`),
      genre,
      domain,
      subtopic,
      targetProfile: targetProfile(itemSeed),
      avoidTargets: [selectedTarget],
      seed: itemSeed,
      calibrationProfileVersion: FACTORY_CONFIG.calibrationProfileVersion,
    })
  }
  return blueprints
}

export const plannerDimensions = { domains: DOMAINS, genres: GENRES, subtopics: SUBTOPICS }
