import { describe, expect, it } from 'vitest'
import { listApprovedExercises } from '../../content/contentRepository'
import { getReviewPrompt } from './reviewPrompt'

describe('review prompts', () => {
  it('creates learner-readable prompts for Parts 1–8 without raw storage IDs', () => {
    for (const part of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const exercise = listApprovedExercises(part)[0]
      const question = exercise.questions[0]
      const prompt = getReviewPrompt({
        itemKey: `${exercise.id}:${question.id}`,
        exerciseId: exercise.id,
        questionId: question.id,
        part,
        skill: exercise.skills.primarySkill,
        secondarySkills: [...exercise.skills.secondarySkills],
        explanationReference: `${exercise.id}#${question.id}`,
        totalAttempts: 1,
        correctAttempts: 0,
        incorrectAttempts: 1,
        partialAttempts: 0,
        totalMarks: 0,
        maxMarks: 1,
        lastMarks: 0,
        lastAttemptAt: new Date().toISOString(),
        lastAnswer: null,
        canonicalAnswer: 'answer',
        acceptedAnswers: ['answer'],
        lastResponseCorrect: false,
        status: 'active',
      })
      expect(prompt?.questionText).toBeTruthy()
      expect(prompt?.explanation).toBeTruthy()
      expect(prompt?.questionText).not.toContain(exercise.id)
      expect(prompt?.questionText).not.toContain(question.id)
    }
  })
})
