import type { ImplementedExercise } from '../domain/exercise'
import type { Part1Exercise } from '../domain/part1'
import type { Part2Exercise } from '../domain/part2'
import type { Part3Exercise } from '../domain/part3'
import type { Part4Exercise } from '../domain/part4'
const modules = import.meta.glob('../../content/approved/part*/*.json', { eager: true, import: 'default' }) as Record<string, unknown>
function assertExercise(value: unknown): ImplementedExercise { if (!value || typeof value !== 'object') throw new Error('Approved content must be an object.'); const candidate = value as Partial<ImplementedExercise>; const validPart = [1, 2, 3, 4].includes(candidate.part as number); const expected = ({ 1: 'multiple_choice_cloze', 2: 'open_cloze', 3: 'word_formation', 4: 'key_word_transformation' } as Record<number, string>)[candidate.part as number]; const count = candidate.part === 4 ? 6 : 8; if (candidate.schemaVersion !== '1.0.0' || !validPart || candidate.type !== expected || !Array.isArray(candidate.questions) || candidate.questions.length !== count || typeof candidate.id !== 'string' || typeof candidate.title !== 'string') throw new Error('Approved content does not match the canonical exercise contract.'); return candidate as ImplementedExercise }
const approvedExercises = Object.values(modules).map(assertExercise).sort((a, b) => a.id.localeCompare(b.id))
export function listApprovedExercises(part?: number, type?: string): readonly ImplementedExercise[] { return approvedExercises.filter((exercise) => (part === undefined || exercise.part === part) && (type === undefined || exercise.type === type)) }
export function listApprovedPart1Exercises() { return approvedExercises.filter((e): e is Part1Exercise => e.part === 1) }
export function listApprovedPart2Exercises() { return approvedExercises.filter((e): e is Part2Exercise => e.part === 2) }
export function listApprovedPart3Exercises() { return approvedExercises.filter((e): e is Part3Exercise => e.part === 3) }
export function listApprovedPart4Exercises() { return approvedExercises.filter((e): e is Part4Exercise => e.part === 4) }
export function getApprovedPart1Exercise(id: string) { return listApprovedPart1Exercises().find((e) => e.id === id) }
export function getApprovedPart2Exercise(id: string) { return listApprovedPart2Exercises().find((e) => e.id === id) }
export function getApprovedPart3Exercise(id: string) { return listApprovedPart3Exercises().find((e) => e.id === id) }
export function getApprovedPart4Exercise(id: string) { return listApprovedPart4Exercises().find((e) => e.id === id) }
