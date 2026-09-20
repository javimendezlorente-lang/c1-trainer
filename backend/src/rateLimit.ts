import { GENERATION_CONFIG } from './config'

const lastAcceptedRequest = new Map<string, number>()

export function rateLimitKey(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || 'unknown-client'
}

export function isRateLimited(key: string, now = Date.now()): boolean {
  const previous = lastAcceptedRequest.get(key)
  if (previous !== undefined && now - previous < GENERATION_CONFIG.cooldownMs) return true
  lastAcceptedRequest.set(key, now)
  return false
}

export function resetRateLimitForTests(): void {
  lastAcceptedRequest.clear()
}

export function rateLimitDescription(): string {
  return `Best-effort per-isolate cooldown of ${GENERATION_CONFIG.cooldownMs}ms; a durable edge limiter is a pre-production requirement.`
}
