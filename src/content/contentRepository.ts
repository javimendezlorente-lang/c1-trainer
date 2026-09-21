import type { ImplementedExercise } from '../domain/exercise'
import type { Part1Exercise } from '../domain/part1'
import type { Part2Exercise } from '../domain/part2'
import type { Part3Exercise } from '../domain/part3'
import type { Part4Exercise } from '../domain/part4'
import type { Part5Exercise } from '../domain/part5'
import type { Part6Exercise } from '../domain/part6'
import type { Part7Exercise } from '../domain/part7'
import type { Part8Exercise } from '../domain/part8'
const modules = import.meta.glob('../../content/approved/part*/*.json', { eager: true, import: 'default' }) as Record<string, unknown>
function assertExercise(value: unknown): ImplementedExercise { if (!value || typeof value !== 'object') throw new Error('Approved content must be an object.'); const candidate = value as Partial<ImplementedExercise>; const expected = ({ 1: 'multiple_choice_cloze', 2: 'open_cloze', 3: 'word_formation', 4: 'key_word_transformation', 5: 'multiple_choice_reading', 6: 'cross_text_multiple_matching', 7: 'gapped_text', 8: 'multiple_matching' } as Record<number, string>)[candidate.part as number]; const counts = ({ 1: 8, 2: 8, 3: 8, 4: 6, 5: 6, 6: 4, 7: 6, 8: 10 } as Record<number, number>); if (candidate.schemaVersion !== '1.0.0' || !expected || candidate.type !== expected || !Array.isArray(candidate.questions) || candidate.questions.length !== counts[candidate.part as number] || typeof candidate.id !== 'string' || typeof candidate.title !== 'string') throw new Error('Approved content does not match the canonical exercise contract.'); return candidate as ImplementedExercise }
const approvedExercises = Object.values(modules).map(assertExercise).sort((a, b) => a.id.localeCompare(b.id))
// Only content with an explicit approved source status is bundled here; all 24
// current fixtures are therefore eligible for normal fallback rotation.
export const NORMAL_ROTATION_EXCLUSIONS = new Set<string>()
export function listApprovedExercises(part?: number, type?: string): readonly ImplementedExercise[] { return approvedExercises.filter((exercise) => (part === undefined || exercise.part === part) && (type === undefined || exercise.type === type)) }
export function listPracticeExercises(part?: number, type?: string): readonly ImplementedExercise[] { return listApprovedExercises(part, type).filter((exercise) => !NORMAL_ROTATION_EXCLUSIONS.has(exercise.id)) }
export function listApprovedPart1Exercises() { return approvedExercises.filter((e): e is Part1Exercise => e.part === 1) }
export function listApprovedPart2Exercises() { return approvedExercises.filter((e): e is Part2Exercise => e.part === 2) }
export function listApprovedPart3Exercises() { return approvedExercises.filter((e): e is Part3Exercise => e.part === 3) }
export function listApprovedPart4Exercises() { return approvedExercises.filter((e): e is Part4Exercise => e.part === 4) }
export function listApprovedPart5Exercises() { return approvedExercises.filter((e): e is Part5Exercise => e.part === 5) }
export function listApprovedPart6Exercises() { return approvedExercises.filter((e): e is Part6Exercise => e.part === 6) }
export function listApprovedPart7Exercises() { return approvedExercises.filter((e): e is Part7Exercise => e.part === 7) }
export function listApprovedPart8Exercises() { return approvedExercises.filter((e): e is Part8Exercise => e.part === 8) }
export function getApprovedPart1Exercise(id: string) { return listApprovedPart1Exercises().find((e) => e.id === id) }
export function getApprovedPart2Exercise(id: string) { return listApprovedPart2Exercises().find((e) => e.id === id) }
export function getApprovedPart3Exercise(id: string) { return listApprovedPart3Exercises().find((e) => e.id === id) }
export function getApprovedPart4Exercise(id: string) { return listApprovedPart4Exercises().find((e) => e.id === id) }
export function getApprovedPart5Exercise(id: string) { return listApprovedPart5Exercises().find((e) => e.id === id) }
export function getApprovedPart6Exercise(id: string) { return listApprovedPart6Exercises().find((e) => e.id === id) }
export function getApprovedPart7Exercise(id: string) { return listApprovedPart7Exercises().find((e) => e.id === id) }
export function getApprovedPart8Exercise(id: string) { return listApprovedPart8Exercises().find((e) => e.id === id) }
