import type { ErrorBankRecord } from '../../learning'
import { getApprovedPart1Exercise } from '../../content'

export interface Part1ReviewPrompt {
  questionText: string
  correctText: string
  explanation: string
  sourceAttemptId?: string
}

export function getPart1ReviewPrompt(record: ErrorBankRecord): Part1ReviewPrompt | undefined {
  const exercise = getApprovedPart1Exercise(record.exerciseId)
  const question = exercise?.questions.find((item) => item.id === record.questionId)
  if (!exercise || !question) return undefined
  const sentences = exercise.content.text.split(/(?<=[.!?])\s+/)
  const source = sentences.find((sentence) => sentence.includes(`{{gap:${question.gap}}}`)) ?? exercise.content.text
  return {
    questionText: source.replace(`{{gap:${question.gap}}}`, '______').replace(/\{\{gap:\d+\}\}/g, '…'),
    correctText: question.options.find((option) => option.id === question.correctOptionId)?.text ?? question.correctOptionId,
    explanation: question.explanation,
  }
}
