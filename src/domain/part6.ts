import type { BaseExercise } from './exercise'

export interface Part6Text { id: string; label: string; title: string; text: string }
export interface Part6Question { id: `q${1 | 2 | 3 | 4}`; prompt: string; correctTextId: string; explanation: string }
export interface Part6Exercise extends BaseExercise { part: 6; type: 'cross_text_multiple_matching'; content: { texts: [Part6Text, Part6Text, Part6Text, Part6Text] }; questions: [Part6Question, Part6Question, Part6Question, Part6Question] }
