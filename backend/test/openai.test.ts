import { describe, expect, it, vi } from 'vitest'
import { generatePart1, type OpenAIResponsesClient } from '../src/openai'
import { validCandidate, validRequest, testEnv } from './fixtures'

describe('Responses API generation adapter', () => {
  it('uses the configured model, store false and server-owned Structured Outputs schema', async () => {
    const create = vi.fn().mockResolvedValue({
      id: 'resp_test',
      status: 'completed',
      output_text: JSON.stringify(validCandidate()),
      usage: { input_tokens: 100, output_tokens: 500, total_tokens: 600, input_tokens_details: { cached_tokens: 10 }, output_tokens_details: { reasoning_tokens: 50 } },
    })
    const client: OpenAIResponsesClient = { responses: { create } }
    const result = await generatePart1(validRequest, testEnv, 'request-test', client)
    const payload = create.mock.calls[0][0] as Record<string, unknown>
    expect(payload.model).toBe('gpt-5.6-luna')
    expect(payload.store).toBe(false)
    expect(payload.reasoning).toEqual({ effort: 'low' })
    expect((payload.text as Record<string, unknown>).format).toMatchObject({ type: 'json_schema', name: 'c1_part1_candidate_v1', strict: true })
    expect(result.metadata.usage).toMatchObject({ input_tokens: 100, cached_input_tokens: 10, output_tokens: 500, reasoning_tokens: 50, total_tokens: 600 })
  })

  it('never returns malformed or incomplete structured output as a candidate', async () => {
    const client: OpenAIResponsesClient = { responses: { create: vi.fn().mockResolvedValue({ status: 'incomplete', output_text: '' }) } }
    await expect(generatePart1(validRequest, testEnv, 'request-test', client)).rejects.toThrow(/structured candidate/)
  })

  it('maps upstream rate limiting to a controlled error', async () => {
    const upstreamError = Object.assign(new Error('rate limited'), { status: 429 })
    const client: OpenAIResponsesClient = { responses: { create: vi.fn().mockRejectedValue(upstreamError) } }
    await expect(generatePart1(validRequest, testEnv, 'request-test', client)).rejects.toThrow(/rate-limited/)
  })
})
