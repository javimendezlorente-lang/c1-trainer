import { describe, expect, it } from 'vitest'
import { listApprovedPart3Exercises } from '../content'
import { gradePart3 } from './part3Grader'
const exercise = listApprovedPart3Exercises()[0]
describe('Part 3 grader', () => { it('accepts canonical/alternative formations and ignores case', () => { const answers = Object.fromEntries(exercise.questions.map((q) => [q.id, q.canonicalAnswer.toUpperCase()])); expect(gradePart3(exercise, answers).score).toBe(8) }); it('rejects the unchanged root, multiword and approximate forms', () => { const grade = gradePart3(exercise, { q1: exercise.questions[0].root, q2: 'transparenc', q3: 'not a word' }); expect(grade.results[0].correct).toBe(false); expect(grade.results[1].correct).toBe(false); expect(grade.results[2].correct).toBe(false) }) })
