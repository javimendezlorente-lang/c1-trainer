import type { ImplementedExercise } from '../domain/exercise'
import { gradePart1, type Part1Grade } from './part1Grader'
import { gradePart2, type Part2Grade } from './part2Grader'
import { gradePart3, type Part3Grade } from './part3Grader'
import { gradePart4, type Part4Grade } from './part4Grader'
import { gradePart5, type Part5Grade } from './part5Grader'
import { gradePart6, type Part6Grade } from './part6Grader'
import { gradePart7, type Part7Grade } from './part7Grader'
import { gradePart8, type Part8Grade } from './part8Grader'
export type ExerciseGrade = Part1Grade | Part2Grade | Part3Grade | Part4Grade | Part5Grade | Part6Grade | Part7Grade | Part8Grade
export function gradeExercise(exercise: ImplementedExercise, answers: Readonly<Record<string, string | null | undefined>>): ExerciseGrade { if (exercise.part === 1) return gradePart1(exercise, answers); if (exercise.part === 2) return gradePart2(exercise, answers); if (exercise.part === 3) return gradePart3(exercise, answers); if (exercise.part === 4) return gradePart4(exercise, answers); if (exercise.part === 5) return gradePart5(exercise, answers); if (exercise.part === 6) return gradePart6(exercise, answers); if (exercise.part === 7) return gradePart7(exercise, answers); return gradePart8(exercise, answers) }
