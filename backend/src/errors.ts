export type GenerationErrorCode =
  | 'AUTH_REQUIRED'
  | 'ORIGIN_NOT_ALLOWED'
  | 'INVALID_REQUEST'
  | 'RATE_LIMITED'
  | 'GENERATION_FAILED'
  | 'STRUCTURED_OUTPUT_FAILED'
  | 'SCHEMA_VALIDATION_FAILED'
  | 'SEMANTIC_VALIDATION_FAILED'
  | 'UPSTREAM_RATE_LIMIT'
  | 'UPSTREAM_UNAVAILABLE'

export class GenerationError extends Error {
  constructor(
    public readonly code: GenerationErrorCode,
    message: string,
    public readonly status: number,
    public readonly details?: string[],
  ) {
    super(message)
    this.name = 'GenerationError'
  }
}

export function jsonError(code: GenerationErrorCode, message: string, requestId: string, status: number, origin: string | null, details?: string[]): Response {
  return jsonResponse({ error: { code, message, requestId, ...(details?.length ? { details } : {}) } }, status, origin)
}

export function jsonResponse(body: unknown, status: number, origin: string | null, extraHeaders: Record<string, string> = {}): Response {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  })
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Vary', 'Origin')
  }
  return new Response(JSON.stringify(body), { status, headers })
}
