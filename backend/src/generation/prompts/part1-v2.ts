import { PART1_CALIBRATION } from '../calibration'

export const PART1_PROMPT_V2 = 'part1-generation-v2'

export interface Part1V2Blueprint {
  part: 1
  difficulty: 2 | 3 | 4
  genre: string
  domain: string
  subtopic: string
  targetProfile: Record<string, number>
  avoidTargets: string[]
  seed: string
  calibrationProfileVersion: string
  attempt?: number
  previousRejectionReasons?: string[]
}

export function buildPart1GenerationV2Prompt(blueprint: Part1V2Blueprint): string {
  const targets = PART1_CALIBRATION.targets
  return [
    'You are an original-content generator for an independent C1 Advanced study tool.',
    'Create one complete Reading and Use of English Part 1 multiple-choice cloze candidate for later quality review.',
    'This is not an official Cambridge paper and must not reproduce or closely imitate Cambridge source text.',
    '',
    'Authoring order is mandatory:',
    '1. Design and write the complete coherent passage first.',
    '2. Select eight natural lexical decision points distributed through that finished passage.',
    '3. Replace only those words or short expressions with {{gap:1}} through {{gap:8}}, each exactly once.',
    '4. Build four plausible options and explanations from the finished context.',
    '',
    'Quality requirements:',
    '- Demanding but natural C1 educated British/international English.',
    '- Authentic coherent prose, not eight isolated sentences joined together.',
    '- Exactly eight gaps and exactly four options A–D per gap.',
    '- Exactly one defensible answer per gap; no grammatical giveaways.',
    '- Distractors must be same-domain and plausible, with collocational or semantic sophistication.',
    '- Explanations must explicitly contrast the alternatives and state why the correct answer fits.',
    '- Avoid copied, formulaic or recognisably Cambridge-specific wording.',
    '- Do not use factual claims whose uncertainty changes the answer.',
    '',
    'Empirical calibration target (not an official Cambridge word-count rule):',
    `- ${targets.runningWords.min}–${targets.runningWords.max} running words and ${targets.paragraphs.min}–${targets.paragraphs.max} paragraphs.`,
    `- At least ${targets.interGapWords.hardMinimum} running words between consecutive gaps; target median ${targets.interGapWords.medianMin}–${targets.interGapWords.medianMax}.`,
    '',
    `Generation blueprint: ${JSON.stringify(blueprint)}`,
    ...(blueprint.attempt && blueprint.previousRejectionReasons?.length ? [`This is regeneration attempt ${blueprint.attempt} of 2. Correct only these concise rejection categories: ${blueprint.previousRejectionReasons.join(', ')}.`] : []),
    'Return only the strict structured candidate object. Do not include IDs, exam metadata or provenance; the factory adds those after validation.',
  ].join('\n')
}
