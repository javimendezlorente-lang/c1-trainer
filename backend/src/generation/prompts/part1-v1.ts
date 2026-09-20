import { GENERATION_CONFIG } from '../../config'
import { PART1_CALIBRATION } from '../calibration'
import type { Part1GenerationRequest } from '../../types'

export const PART1_PROMPT_VERSION = 'part1-v1'

export function buildPart1DeveloperPrompt(request: Part1GenerationRequest): string {
  const targets = PART1_CALIBRATION.targets
  return [
    'You are the server-side generator for an independent C1 Advanced study tool.',
    'Create one original Reading and Use of English Part 1 multiple-choice cloze candidate.',
    'This is a candidate for later human and automated quality review, not an official Cambridge paper.',
    '',
    'Non-negotiable task constraints:',
    '- Write coherent, authentic, demanding C1 prose with a useful title.',
    '- Use exactly eight gap markers, written as {{gap:1}} through {{gap:8}} exactly once each.',
    '- Provide exactly four plausible options A–D for every gap and exactly one defensible answer.',
    '- Target collocations, fixed expressions, phrasal verbs, idioms, complementation and semantic precision where natural.',
    '- Use realistic spacing between lexical decisions; do not write eight compressed answer sentences.',
    '- Explanations must identify the decisive context and explain every distractor where supplied.',
    '- Do not copy or closely imitate Cambridge sample-paper text.',
    '',
    'Empirically derived calibration target (not an official Cambridge rule):',
    `- ${targets.runningWords.min}–${targets.runningWords.max} running words, ${targets.paragraphs.min}–${targets.paragraphs.max} paragraphs.`,
    `- At least ${targets.interGapWords.hardMinimum} running words between consecutive gaps; target median ${targets.interGapWords.medianMin}–${targets.interGapWords.medianMax}.`,
    '- C1 lexical demand and nuanced, same-domain distractors are more important than decorative difficulty.',
    '',
    `Request blueprint: ${JSON.stringify(request.blueprint)}`,
    `Requested difficulty: ${request.difficulty}`,
    `The server will add IDs, exam metadata and provenance after validation. Model: ${GENERATION_CONFIG.defaultModel}.`,
  ].join('\n')
}
