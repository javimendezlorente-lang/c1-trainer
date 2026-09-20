import candidateSchema from '../../../backend/src/generation/part1Candidate.schema.json'
import { buildPart1GenerationV2Prompt, type Part1V2Blueprint } from '../../../backend/src/generation/prompts/part1-v2'
import { FACTORY_CONFIG } from '../config'
import type { BatchLine, GenerationBlueprint } from '../types'

function asPromptBlueprint(blueprint: GenerationBlueprint): Part1V2Blueprint {
  return blueprint
}

export function generationBody(blueprint: GenerationBlueprint): Record<string, unknown> {
  return {
    model: FACTORY_CONFIG.generatorModel,
    store: false,
    reasoning: { effort: FACTORY_CONFIG.reasoningEffort },
    max_output_tokens: FACTORY_CONFIG.maxOutputTokens,
    input: [
      { role: 'developer', content: buildPart1GenerationV2Prompt(asPromptBlueprint(blueprint)) },
      { role: 'user', content: 'Return exactly one candidate structured object and no prose outside it.' },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'c1_part1_candidate_v1',
        strict: true,
        schema: candidateSchema,
      },
    },
  }
}

export function buildGenerationBatch(blueprints: GenerationBlueprint[]): BatchLine[] {
  const ids = new Set<string>()
  return blueprints.map((blueprint) => {
    if (ids.has(blueprint.customId)) throw new Error(`Duplicate custom_id: ${blueprint.customId}`)
    ids.add(blueprint.customId)
    return { custom_id: blueprint.customId, method: 'POST', url: '/v1/responses', body: generationBody(blueprint) }
  })
}

export function buildRegenerationBatch(blueprints: GenerationBlueprint[], attempt: number): BatchLine[] {
  if (!Number.isInteger(attempt) || attempt < 1 || attempt > FACTORY_CONFIG.maxRegenerations) throw new Error(`Regeneration attempt must be 1–${FACTORY_CONFIG.maxRegenerations}`)
  return buildGenerationBatch(blueprints.map((blueprint) => ({ ...blueprint, attempt })))
}

export function toJsonl(lines: BatchLine[]): string {
  return `${lines.map((line) => JSON.stringify(line)).join('\n')}\n`
}
