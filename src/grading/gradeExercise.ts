import type { ImplementedExercise } from '../domain/exercise'
import { gradePart1, type Part1Grade } from './part1Grader'
import { gradePart2, type Part2Grade } from './part2Grader'
import { gradePart3, type Part3Grade } from './part3Grader'
import { gradePart4, type Part4Grade } from './part4Grader'
export type ExerciseGrade = Part1Grade | Part2Grade | Part3Grade | Part4Grade
export function gradeExercise(exercise: ImplementedExercise, answers: Readonly<Record<string, string | null | undefined>>): ExerciseGrade { if (exercise.part === 1) return gradePart1(exercise, answers); if (exercise.part === 2) return gradePart2(exercise, answers); if (exercise.part === 3) return gradePart3(exercise, answers); return gradePart4(exercise, answers) }
