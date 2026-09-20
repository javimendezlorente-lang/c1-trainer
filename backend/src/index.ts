import { hasValidBearerToken } from './auth'
import { GENERATION_CONFIG, type Env } from './config'
import { corsHeaders, isAllowedOrigin, requestOrigin } from './cors'
import { GenerationError, jsonError, jsonResponse } from './errors'
import { createOpenAIClient, generatePart1, type OpenAIResponsesClient } from './openai'
import { parseGenerationRequest } from './request'
import { isRateLimited, rateLimitKey } from './rateLimit'

export interface RequestDependencies {
  createClient?: (env: Env) => OpenAIResponsesClient
  now?: () => number
}

export async function handleRequest(request: Request, env: Env, dependencies: RequestDependencies = {}): Promise<Response> {
  const origin = isAllowedOrigin(request, env) ? requestOrigin(request) : null
  const requestId = crypto.randomUUID()
  const headers = corsHeaders(origin, env)
  const url = new URL(request.url)

  if (url.pathname !== '/api/generate/part1') return jsonError('INVALID_REQUEST', 'Unknown endpoint', requestId, 404, origin)
  if (request.method === 'OPTIONS') {
    if (!isAllowedOrigin(request, env)) return jsonError('ORIGIN_NOT_ALLOWED', 'Origin is not allowed', requestId, 403, origin)
    return new Response(null, { status: 204, headers })
  }
  if (request.method !== 'POST') return jsonError('INVALID_REQUEST', 'Only POST is supported', requestId, 405, origin, ['Allow: POST'])
  if (!isAllowedOrigin(request, env)) return jsonError('ORIGIN_NOT_ALLOWED', 'Origin is not allowed', requestId, 403, origin)
  if (!hasValidBearerToken(request, env.C1_TRAINER_ACCESS_TOKEN)) return jsonError('AUTH_REQUIRED', 'A valid access token is required', requestId, 401, origin)
  if (isRateLimited(rateLimitKey(request), dependencies.now?.() ?? Date.now())) return jsonError('RATE_LIMITED', 'Please wait before requesting another candidate', requestId, 429, origin)

  try {
    const generationRequest = await parseGenerationRequest(request, GENERATION_CONFIG.maxRequestBytes)
    const result = await generatePart1(generationRequest, env, requestId, dependencies.createClient?.(env) ?? createOpenAIClient(env))
    return jsonResponse({ exercise: result.exercise, generation: result.metadata }, 200, origin, headers)
  } catch (error) {
    if (error instanceof GenerationError) return jsonError(error.code, error.message, requestId, error.status, origin, error.details)
    return jsonError('GENERATION_FAILED', 'The generation service failed safely', requestId, 500, origin)
  }
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env)
  },
}
