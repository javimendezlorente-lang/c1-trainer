import OpenAI from 'openai'
import candidateSchema from './generation/part1Candidate.schema.json'
import { GENERATION_CONFIG, generatorModel, type Env } from './config'
import { GenerationError } from './errors'
import { buildPart1DeveloperPrompt, PART1_PROMPT_VERSION } from './generation/prompts/part1-v1'
import { validateAndCanonicalizePart1 } from './validation'
import type { GenerationMetadata, Part1Candidate, Part1GenerationRequest } from './types'

export interface OpenAIResponseLike {
  id?: string
  output_text?: string
  usage?: {
    input_tokens?: number
    output_tokens?: number
    total_tokens?: number
    input_tokens_details?: { cached_tokens?: number }
    output_tokens_details?: { reasoning_tokens?: number }
  }
  status?: string
  error?: unknown
}

export interface OpenAIResponsesClient {
  responses: {
    create(input: unknown): Promise<OpenAIResponseLike>
  }
}

export function createOpenAIClient(env: Env): OpenAIResponsesClient {
  if (!env.OPENAI_API_KEY) throw new GenerationError('GENERATION_FAILED', 'Generation backend is not configured', 503)
  return new OpenAI({ apiKey: env.OPENAI_API_KEY, dangerouslyAllowBrowser: false }) as unknown as OpenAIResponsesClient
}

function usageMetadata(response: OpenAIResponseLike): GenerationMetadata['usage'] {
  return {
    input_tokens: response.usage?.input_tokens,
    cached_input_tokens: response.usage?.input_tokens_details?.cached_tokens,
    output_tokens: response.usage?.output_tokens,
    reasoning_tokens: response.usage?.output_tokens_details?.reasoning_tokens,
    total_tokens: response.usage?.total_tokens,
  }
}

export async function generatePart1(
  request: Part1GenerationRequest,
  env: Env,
  requestId: string,
  client: OpenAIResponsesClient = createOpenAIClient(env),
): Promise<{ exercise: ReturnType<typeof validateAndCanonicalizePart1>; metadata: GenerationMetadata }> {
  const model = generatorModel(env)
  const startedAt = Date.now()
  let response: OpenAIResponseLike
  try {
    response = await client.responses.create({
      model,
      store: false,
      reasoning: { effort: GENERATION_CONFIG.reasoningEffort },
      max_output_tokens: GENERATION_CONFIG.maxOutputTokens,
      input: [
        { role: 'developer', content: buildPart1DeveloperPrompt(request) },
        { role: 'user', content: 'Return one candidate now. Do not include any prose outside the structured object.' },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'c1_part1_candidate_v1',
          strict: true,
          schema: candidateSchema,
        },
      },
    })
  } catch (error) {
    const status = typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : 0
    if (status === 429) throw new GenerationError('UPSTREAM_RATE_LIMIT', 'The upstream generation service is rate-limited', 503)
    if (status >= 500 || status === 0) throw new GenerationError('UPSTREAM_UNAVAILABLE', 'The upstream generation service is unavailable', 503)
    throw new GenerationError('GENERATION_FAILED', 'The generation request failed', 502)
  }

  if (!response.output_text || response.status === 'incomplete' || response.error) {
    throw new GenerationError('STRUCTURED_OUTPUT_FAILED', 'The upstream service did not return a complete structured candidate', 502)
  }

  let candidate: unknown
  try {
    candidate = JSON.parse(response.output_text) as Part1Candidate
  } catch {
    throw new GenerationError('STRUCTURED_OUTPUT_FAILED', 'The upstream service returned non-JSON output', 502)
  }

  const exercise = validateAndCanonicalizePart1(candidate, model)
  return {
    exercise,
    metadata: {
      model,
      promptVersion: PART1_PROMPT_VERSION,
      requestId,
      usage: usageMetadata(response),
      latencyMs: Date.now() - startedAt,
    },
  }
}
