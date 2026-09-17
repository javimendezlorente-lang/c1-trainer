import type { Part3Exercise } from '../domain/part3'
import { C1_RUOE_STRUCTURE } from '../domain/scoring'
import type { Part2UserAnswers } from './part2Grader'
export interface Part3QuestionResult { questionId: string; answer: string | null; canonicalAnswer: string; acceptedAnswers: string[]; correct: boolean; marks: 0 | 1; maxMarks: 1; root: string; transformations: string[] }
export interface Part3Grade { exerciseId: string; score: number; maxScore: number; complete: boolean; results: Part3QuestionResult[] }
const normalize = (value: string) => value.trim().toLocaleLowerCase('en-US')
const oneWord = (value: string) => value !== '' && !/\s/u.test(value)
export function gradePart3(exercise: Part3Exercise, userAnswers: Part2UserAnswers = {}): Part3Grade {
  const results = exercise.questions.map((question) => { const raw = userAnswers[question.id]; const answer = typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : null; const normalized = answer === null ? '' : normalize(answer); const accepted = question.acceptedAnswers ?? []; const acceptedWithCanonical = [question.canonicalAnswer, ...accepted]; const correct = oneWord(normalized) && acceptedWithCanonical.some((item) => normalize(item) === normalized); const marks: 0 | 1 = correct ? 1 : 0; return { questionId: question.id, answer, canonicalAnswer: question.canonicalAnswer, acceptedAnswers: [...acceptedWithCanonical], correct, marks, maxMarks: 1 as const, root: question.root, transformations: [...question.transformations] } })
  return { exerciseId: exercise.id, score: results.reduce((sum, item) => sum + item.marks, 0), maxScore: C1_RUOE_STRUCTURE[3].maxMarks, complete: exercise.questions.every((question) => typeof userAnswers[question.id] === 'string' && userAnswers[question.id]!.trim() !== ''), results }
}
