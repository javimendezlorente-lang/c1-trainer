import { describe, expect, it } from 'vitest'
import { listApprovedPart2Exercises } from '../content'
import { gradePart2 } from './part2Grader'
const exercise = listApprovedPart2Exercises()[0]
describe('Part 2 grader', () => { it('accepts canonical and alternatives case-insensitively without mutating answers', () => { const answers = Object.fromEntries(exercise.questions.map((q) => [q.id, `  ${q.acceptedAnswers[0].toUpperCase()}  `])); const before = structuredClone(answers); const grade = gradePart2(exercise, answers); expect(grade.score).toBe(8); expect(answers).toEqual(before) }); it('rejects blank, multiword and fuzzy answers', () => { const grade = gradePart2(exercise, { q1: 'not the answer', q2: '', q3: 'whic' }); expect(grade.results[0].correct).toBe(false); expect(grade.results[1].correct).toBe(false); expect(grade.results[2].correct).toBe(false); expect(grade.complete).toBe(false) }) })
