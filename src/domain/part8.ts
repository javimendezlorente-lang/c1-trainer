import type { BaseExercise } from './exercise'

export interface Part8Text { id: string; label: string; title: string; text: string }
export interface Part8Question { id: `q${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`; prompt: string; correctTextId: string; explanation: string }
export interface Part8Exercise extends BaseExercise { part: 8; type: 'multiple_matching'; content: { texts: Part8Text[] }; questions: [Part8Question, Part8Question, Part8Question, Part8Question, Part8Question, Part8Question, Part8Question, Part8Question, Part8Question, Part8Question] }
