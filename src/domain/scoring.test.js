import { C1_RUOE_STRUCTURE, C1_RUOE_TOTALS } from './scoring.ts'
import { describe, expect, it } from 'vitest'

describe('C1 Reading and Use of English scoring structure', () => {
  it('contains the official question and mark allocation for Parts 1–8', () => {
    expect(C1_RUOE_STRUCTURE).toEqual({
      1: { questions: 8, marksPerQuestion: 1, maxMarks: 8 },
      2: { questions: 8, marksPerQuestion: 1, maxMarks: 8 },
      3: { questions: 8, marksPerQuestion: 1, maxMarks: 8 },
      4: { questions: 6, marksPerQuestion: 2, maxMarks: 12 },
      5: { questions: 6, marksPerQuestion: 2, maxMarks: 12 },
      6: { questions: 4, marksPerQuestion: 2, maxMarks: 8 },
      7: { questions: 6, marksPerQuestion: 2, maxMarks: 12 },
      8: { questions: 10, marksPerQuestion: 1, maxMarks: 10 },
    })
  })

  it('derives 56 questions and 78 marks', () => {
    expect(C1_RUOE_TOTALS).toEqual({ questions: 56, marks: 78 })
  })
})
