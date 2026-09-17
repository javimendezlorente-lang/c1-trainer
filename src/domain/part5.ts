import type { BaseExercise } from './exercise'

export interface Part5Option { id: 'A' | 'B' | 'C' | 'D'; text: string }
export interface Part5Question { id: `q${1 | 2 | 3 | 4 | 5 | 6}`; prompt: string; options: [Part5Option, Part5Option, Part5Option, Part5Option]; correctOptionId: Part5Option['id']; explanation: string }
export interface Part5Exercise extends BaseExercise { part: 5; type: 'multiple_choice_reading'; content: { text: string }; questions: [Part5Question, Part5Question, Part5Question, Part5Question, Part5Question, Part5Question] }
