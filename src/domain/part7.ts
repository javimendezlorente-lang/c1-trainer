import type { BaseExercise } from './exercise'

export interface Part7Segment { kind: 'text' | 'gap'; text?: string; gapId?: `q${1 | 2 | 3 | 4 | 5 | 6}` }
export interface Part7Paragraph { id: string; label: string; text: string }
export interface Part7Question { id: `q${1 | 2 | 3 | 4 | 5 | 6}`; prompt: string; correctParagraphId: string; explanation: string }
export interface Part7Exercise extends BaseExercise { part: 7; type: 'gapped_text'; content: { segments: Part7Segment[]; paragraphs: [Part7Paragraph, Part7Paragraph, Part7Paragraph, Part7Paragraph, Part7Paragraph, Part7Paragraph, Part7Paragraph] }; questions: [Part7Question, Part7Question, Part7Question, Part7Question, Part7Question, Part7Question] }
