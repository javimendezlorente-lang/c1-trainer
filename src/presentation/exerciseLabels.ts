import type { ErrorBankRecord } from '../learning'

const partNames: Record<number, string> = {
  1: 'Multiple-choice cloze', 2: 'Open cloze', 3: 'Word formation', 4: 'Key word transformation',
  5: 'Multiple-choice reading', 6: 'Cross-text multiple matching', 7: 'Gapped text', 8: 'Multiple matching',
}

export function partLabel(part: number): string { return `Part ${part} · ${partNames[part] ?? 'Reading and Use of English'}` }
export function exerciseLabel(part: number, title?: string): string { return title ? `${partLabel(part)} · ${title}` : partLabel(part) }
export function reviewLabel(record: Pick<ErrorBankRecord, 'part' | 'skill'>): string { return `${partLabel(record.part)} · ${record.skill.replaceAll('_', ' ')}` }
