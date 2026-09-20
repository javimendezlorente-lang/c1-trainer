import { describe, expect, it, beforeEach, vi } from 'vitest'
import { handleRequest } from '../src/index'
import { resetRateLimitForTests } from '../src/rateLimit'
import type { OpenAIResponsesClient } from '../src/openai'
import { testEnv, validCandidate, validRequest } from './fixtures'

function makeRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('https://generation.example/api/generate/part1', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...headers } })
}

function mockClient(): OpenAIResponsesClient {
  return { responses: { create: vi.fn().mockResolvedValue({ status: 'completed', output_text: JSON.stringify(validCandidate()), usage: { input_tokens: 1, output_tokens: 2, total_tokens: 3 } }) } }
}

describe('Worker security and endpoint contract', () => {
  beforeEach(() => resetRateLimitForTests())

  it('returns 401 without authentication and does not call upstream', async () => {
    const createClient = vi.fn(() => mockClient())
    const response = await handleRequest(makeRequest(validRequest, { Origin: 'http://localhost:5173', 'CF-Connecting-IP': 'one' }), testEnv, { createClient })
    expect(response.status).toBe(401)
    expect(createClient).not.toHaveBeenCalled()
  })

  it('returns 401 for a wrong token', async () => {
    const response = await handleRequest(makeRequest(validRequest, { Authorization: 'Bearer wrong', 'CF-Connecting-IP': 'two' }), testEnv, { createClient: () => mockClient() })
    expect(response.status).toBe(401)
  })

  it('rejects an unconfigured browser origin', async () => {
    const response = await handleRequest(makeRequest(validRequest, { Origin: 'https://evil.example', Authorization: 'Bearer test-personal-token', 'CF-Connecting-IP': 'three' }), testEnv, { createClient: () => mockClient() })
    expect(response.status).toBe(403)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
    const body = await response.json() as { error: { code: string } }
    expect(body.error.code).toBe('ORIGIN_NOT_ALLOWED')
  })

  it('accepts a valid authenticated request and returns only the candidate envelope', async () => {
    const response = await handleRequest(makeRequest(validRequest, { Origin: 'http://localhost:5173', Authorization: 'Bearer test-personal-token', 'CF-Connecting-IP': 'four' }), testEnv, { createClient: () => mockClient() })
    expect(response.status).toBe(200)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173')
    const body = await response.json() as { exercise: { id: string; source: { kind: string } }; generation: { model: string } }
    expect(body.exercise.id).toMatch(/^gen-c1-p1-/)
    expect(body.exercise.source.kind).toBe('original_ai')
    expect(body.generation.model).toBe('gpt-5.6-luna')
  })

  it('rejects malformed fields and client model injection before upstream', async () => {
    const createClient = vi.fn(() => mockClient())
    const response = await handleRequest(makeRequest({ ...validRequest, model: 'dangerous-model' }, { Authorization: 'Bearer test-personal-token', 'CF-Connecting-IP': 'five' }), testEnv, { createClient })
    expect(response.status).toBe(400)
    expect(createClient).not.toHaveBeenCalled()
  })

  it('enforces the PoC cooldown per client key', async () => {
    const headers = { Authorization: 'Bearer test-personal-token', 'CF-Connecting-IP': 'six' }
    const dependencies = { createClient: () => mockClient(), now: () => 10_000 }
    await expect(handleRequest(makeRequest(validRequest, headers), testEnv, dependencies)).resolves.toMatchObject({ status: 200 })
    await expect(handleRequest(makeRequest(validRequest, headers), testEnv, dependencies)).resolves.toMatchObject({ status: 429 })
  })
})
