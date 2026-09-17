export const C1_RUOE_STRUCTURE = {
  1: { questions: 8, marksPerQuestion: 1, maxMarks: 8 },
  2: { questions: 8, marksPerQuestion: 1, maxMarks: 8 },
  3: { questions: 8, marksPerQuestion: 1, maxMarks: 8 },
  4: { questions: 6, marksPerQuestion: 2, maxMarks: 12 },
  5: { questions: 6, marksPerQuestion: 2, maxMarks: 12 },
  6: { questions: 4, marksPerQuestion: 2, maxMarks: 8 },
  7: { questions: 6, marksPerQuestion: 2, maxMarks: 12 },
  8: { questions: 10, marksPerQuestion: 1, maxMarks: 10 },
} as const

export const C1_RUOE_TOTALS = {
  questions: Object.values(C1_RUOE_STRUCTURE).reduce((total, part) => total + part.questions, 0),
  marks: Object.values(C1_RUOE_STRUCTURE).reduce((total, part) => total + part.maxMarks, 0),
} as const

export type RuoePart = keyof typeof C1_RUOE_STRUCTURE
