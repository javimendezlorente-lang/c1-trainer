import type { ErrorBankRecord } from '../../learning'
import { getApprovedPart1Exercise, getApprovedPart2Exercise, getApprovedPart3Exercise, getApprovedPart4Exercise } from '../../content'
export interface ReviewPrompt { questionText: string; correctText: string; explanation: string; sourceAttemptId?: string; keyword?: string; originalSentence?: string; secondSentence?: string }
export function getReviewPrompt(record: ErrorBankRecord): ReviewPrompt | undefined {
  const exercise = record.part === 1 ? getApprovedPart1Exercise(record.exerciseId) : record.part === 2 ? getApprovedPart2Exercise(record.exerciseId) : record.part === 3 ? getApprovedPart3Exercise(record.exerciseId) : getApprovedPart4Exercise(record.exerciseId)
  const question = exercise?.questions.find((item) => item.id === record.questionId)
  if (!exercise || !question) return record.canonicalAnswer ? { questionText: record.secondSentence ?? record.originalSentence ?? `${record.part} · ${record.questionId}`, correctText: record.canonicalAnswer, explanation: record.explanationReference } : undefined
  if (record.part === 1) { const item = question as import('../../domain/part1').Part1Question; const partExercise = exercise as import('../../domain/part1').Part1Exercise; const source = partExercise.content.text.split(/(?<=[.!?])\s+/u).find((sentence: string) => sentence.includes(`{{gap:${item.gap}}}`)) ?? partExercise.content.text; return { questionText: source.replace(`{{gap:${item.gap}}}`, '______').replace(/\{\{gap:\d+\}\}/gu, '…'), correctText: item.options.find((option) => option.id === item.correctOptionId)?.text ?? item.correctOptionId, explanation: item.explanation } }
  if (record.part === 4) { const item = question as import('../../domain/part4').Part4Question; return { questionText: `${item.originalSentence}\n${item.secondSentence.replace('{{answer}}', '______')}`, correctText: item.canonicalAnswer, explanation: 'Rebuild the meaning using the fixed keyword and compare the complete transformation.', keyword: item.keyword, originalSentence: item.originalSentence, secondSentence: item.secondSentence } }
  const item = question as import('../../domain/part2').Part2Question | import('../../domain/part3').Part3Question; const clozeExercise = exercise as import('../../domain/part2').Part2Exercise | import('../../domain/part3').Part3Exercise
  return { questionText: clozeExercise.content.text.replace(`{{gap:${item.gap}}}`, '______').replace(/\{\{gap:\d+\}\}/gu, '…'), correctText: item.canonicalAnswer, explanation: item.explanation }
}
export const getPart1ReviewPrompt = getReviewPrompt
