import type { Part2Exercise } from '../domain/part2'
import { C1_RUOE_STRUCTURE } from '../domain/scoring'

export type Part2UserAnswers = Readonly<Record<string, string | null | undefined>>
export interface Part2QuestionResult { questionId: string; answer: string | null; canonicalAnswer: string; acceptedAnswers: string[]; correct: boolean; marks: 0 | 1; maxMarks: 1 }
export interface Part2Grade { exerciseId: string; score: number; maxScore: number; complete: boolean; results: Part2QuestionResult[] }
const normalize = (value: string) => value.trim().toLocaleLowerCase('en-US')
const oneWord = (value: string) => value !== '' && !/\s/u.test(value)
export function gradePart2(exercise: Part2Exercise, userAnswers: Part2UserAnswers = {}): Part2Grade {
  const results = exercise.questions.map((question) => { const raw = userAnswers[question.id]; const answer = typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : null; const normalized = answer === null ? '' : normalize(answer); const correct = oneWord(normalized) && question.acceptedAnswers.some((item) => normalize(item) === normalized); const marks: 0 | 1 = correct ? 1 : 0; return { questionId: question.id, answer, canonicalAnswer: question.canonicalAnswer, acceptedAnswers: [...question.acceptedAnswers], correct, marks, maxMarks: 1 as const } })
  return { exerciseId: exercise.id, score: results.reduce((sum, item) => sum + item.marks, 0), maxScore: C1_RUOE_STRUCTURE[2].maxMarks, complete: exercise.questions.every((question) => typeof userAnswers[question.id] === 'string' && userAnswers[question.id]!.trim() !== ''), results }
}
