import { allowedOrigins, type Env } from './config'

export function requestOrigin(request: Request): string | null {
  return request.headers.get('Origin')
}

export function isAllowedOrigin(request: Request, env: Env): boolean {
  const origin = requestOrigin(request)
  // Non-browser clients such as the local curl harness do not send Origin.
  return origin === null || allowedOrigins(env).includes(origin)
}

export function corsHeaders(origin: string | null, env: Env): Record<string, string> {
  if (!origin || !allowedOrigins(env).includes(origin)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  }
}
