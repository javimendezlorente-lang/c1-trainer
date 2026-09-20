import type { Part1Candidate } from '../src/types'

const segmentWords = [
  'careful', 'observers', 'compare', 'ordinary', 'routines', 'before', 'they', 'draw', 'firm', 'conclusions', 'about', 'what', 'a', 'pattern', 'means',
]

export function validCandidate(): Part1Candidate {
  const segments = Array.from({ length: 9 }, (_, index) => `${segmentWords.join(' ')} ${index + 1}`)
  const text = `${segments[0]} {{gap:1}} ${segments[1]} {{gap:2}} ${segments[2]}\n\n${segments[3]} {{gap:3}} ${segments[4]} {{gap:4}} ${segments[5]}\n\n${segments[6]} {{gap:5}} ${segments[7]} {{gap:6}} ${segments[8]} {{gap:7}} ${segments[0]} {{gap:8}} ${segments[1]}`
  return {
    title: 'The value of patient observation',
    difficulty: 4,
    topic: 'research practice',
    skills: { primarySkill: 'semantic_precision', secondarySkills: ['collocation', 'fixed_expression'] },
    content: {
      text,
      gaps: Array.from({ length: 8 }, (_, index) => ({ id: `g${index + 1}` as `g${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`, number: (index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 })),
    },
    questions: Array.from({ length: 8 }, (_, index) => ({
      id: `q${index + 1}` as `q${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`,
      gap: (index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
      options: [
        { id: 'A' as const, text: `answer${index}` },
        { id: 'B' as const, text: `alternative${index}` },
        { id: 'C' as const, text: `contrast${index}` },
        { id: 'D' as const, text: `different${index}` },
      ],
      correctOptionId: 'A' as const,
      explanation: 'The surrounding context selects the intended expression.',
      distractorExplanations: { B: 'This changes the meaning.', C: 'This does not fit the structure.', D: 'This is not the intended collocation.' },
    })),
  }
}

export const validRequest = {
  difficulty: 'demanding' as const,
  blueprint: {
    topicDomain: 'social psychology',
    genre: 'magazine feature',
    targetSkills: ['collocation', 'semantic_precision'] as const,
  },
}

export const testEnv = {
  OPENAI_API_KEY: 'test-only-not-a-real-key',
  C1_TRAINER_ACCESS_TOKEN: 'test-personal-token',
  ALLOWED_ORIGINS: 'https://javimendezlorente-lang.github.io,http://localhost:5173',
  GENERATOR_MODEL: 'gpt-5.6-luna',
}
