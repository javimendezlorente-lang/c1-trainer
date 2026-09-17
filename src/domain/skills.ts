export const SKILL_TAXONOMY = {
  LEXIS: [
    'collocation',
    'fixed_expression',
    'phrasal_verb',
    'idiom',
    'semantic_precision',
    'complementation',
    'dependent_preposition',
  ],
  GRAMMAR: [
    'article',
    'auxiliary',
    'modal',
    'tense_aspect',
    'pronoun',
    'determiner',
    'conjunction',
    'relative_clause',
    'comparison',
    'conditionals',
    'inversion',
    'passive',
    'reporting_structure',
    'causative',
    'concession',
    'preposition',
  ],
  WORD_FORMATION: [
    'prefix',
    'negative_prefix',
    'suffix',
    'compound',
    'internal_change',
    'word_class_change',
  ],
  DISCOURSE_READING: [
    'cohesion',
    'coherence',
    'reference',
    'inference',
    'attitude',
    'tone',
    'purpose',
    'detail',
    'main_idea',
  ],
} as const

export type Skill = (typeof SKILL_TAXONOMY)[keyof typeof SKILL_TAXONOMY][number]

export const ALL_SKILLS = Object.values(SKILL_TAXONOMY).flat() as Skill[]

export interface SkillSet {
  primarySkill: Skill
  secondarySkills: Skill[]
}
