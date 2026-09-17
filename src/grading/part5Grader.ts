import type { Part5Exercise } from '../domain/part5'
import { C1_RUOE_STRUCTURE } from '../domain/scoring'
export type Part5UserAnswers = Readonly<Record<string, string | null | undefined>>
export interface Part5QuestionResult { questionId: string; selectedOptionId: string | null; correctOptionId: 'A'|'B'|'C'|'D'; correct: boolean; marks: 0|2 }
export interface Part5Grade { exerciseId: string; score: number; maxScore: number; complete: boolean; results: Part5QuestionResult[] }
export function gradePart5(exercise: Part5Exercise, answers: Part5UserAnswers = {}): Part5Grade {
  const results = exercise.questions.map((q) => { const raw = answers[q.id]; const selected = typeof raw === 'string' && raw.trim() ? raw : null; const valid = selected !== null && q.options.some((o) => o.id === selected); const correct = valid && selected === q.correctOptionId; return { questionId: q.id, selectedOptionId: selected, correctOptionId: q.correctOptionId, correct, marks: correct ? 2 as const : 0 as const } })
  return { exerciseId: exercise.id, score: results.reduce((s, r) => s + r.marks, 0), maxScore: C1_RUOE_STRUCTURE[5].maxMarks, complete: exercise.questions.every((q) => typeof answers[q.id] === 'string' && q.options.some((o) => o.id === answers[q.id])), results }
}
