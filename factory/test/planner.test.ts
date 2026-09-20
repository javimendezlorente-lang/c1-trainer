import { describe, expect, it } from 'vitest'
import { buildGenerationBatch } from '../src/batch/build'
import { planPart1 } from '../src/planner'

describe('Part 1 blueprint planner', () => {
  it('creates deterministic, unique, balanced blueprints', () => {
    const first = planPart1('P1-CALIBRATION-100', 100, 'seed-a')
    const second = planPart1('P1-CALIBRATION-100', 100, 'seed-a')
    expect(second).toEqual(first)
    expect(new Set(first.map((blueprint) => blueprint.customId)).size).toBe(100)
    expect(new Set(first.map((blueprint) => blueprint.subtopic)).size).toBe(100)
    expect(first.every((blueprint) => [2, 3, 4].includes(blueprint.difficulty))).toBe(true)
    expect(first.filter((blueprint) => blueprint.difficulty === 3).length).toBeGreaterThan(40)
    expect(new Set(first.map((blueprint) => blueprint.domain)).size).toBeGreaterThan(5)
  })
})

describe('Batch JSONL construction', () => {
  it('creates one independent Responses request per blueprint', () => {
    const blueprints = planPart1('BATCH-TEST', 3, 'seed-b')
    const lines = buildGenerationBatch(blueprints)
    expect(lines.map((line) => line.custom_id)).toEqual(blueprints.map((blueprint) => blueprint.customId))
    expect(lines.every((line) => line.url === '/v1/responses' && line.body.store === false)).toBe(true)
    expect(lines.every((line) => (line.body.text as { format: { type: string; strict: boolean } }).format.type === 'json_schema')).toBe(true)
  })
})
