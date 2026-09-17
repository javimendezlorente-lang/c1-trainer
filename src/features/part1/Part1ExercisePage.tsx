import { useState } from 'react'
import type { Part1Exercise as Part1ExerciseModel, Part1Option } from '../../domain/part1'
import { listApprovedPart1Exercises } from '../../content'
import { gradePart1 } from '../../grading'
import type { Part1Grade } from '../../grading'
import Part1Exercise from './Part1Exercise'
import Part1Results from './Part1Results'
import './part1.css'

type Answers = Record<string, string>

export default function Part1ExercisePage() {
  const exercises = listApprovedPart1Exercises()
  const [selectedExercise, setSelectedExercise] = useState<Part1ExerciseModel | null>(null)
  const [answers, setAnswers] = useState<Answers>({})
  const [grade, setGrade] = useState<Part1Grade | null>(null)

  const startExercise = (exercise: Part1ExerciseModel) => {
    setSelectedExercise(exercise)
    setAnswers({})
    setGrade(null)
  }

  const backToList = () => {
    setSelectedExercise(null)
    setAnswers({})
    setGrade(null)
  }

  const answerQuestion = (questionId: string, optionId: Part1Option['id']) => {
    setAnswers((current) => ({ ...current, [questionId]: optionId }))
  }

  if (selectedExercise && grade) {
    return (
      <Part1Results
        exercise={selectedExercise}
        grade={grade}
        onRetry={() => {
          setAnswers({})
          setGrade(null)
        }}
        onBack={backToList}
      />
    )
  }

  if (selectedExercise) {
    return (
      <Part1Exercise
        exercise={selectedExercise}
        answers={answers}
        onAnswer={answerQuestion}
        onSubmit={() => setGrade(gradePart1(selectedExercise, answers))}
        onBack={backToList}
      />
    )
  }

  return (
    <section className="part1-shell part1-selector" aria-labelledby="practice-title">
      <div className="part1-heading">
        <p className="eyebrow">Cambridge C1 Advanced</p>
        <h1 id="practice-title">Practice</h1>
        <p className="part1-instruction">Choose a focused exercise. Your answers stay in this session and are not saved yet.</p>
      </div>

      <div className="part1-section-heading">
        <h2>Reading &amp; Use of English</h2>
        <span>Part 1</span>
      </div>
      <div className="part1-type-card">
        <div>
          <h3>Multiple-choice cloze</h3>
          <p>Eight questions testing vocabulary, collocation and fixed expressions.</p>
        </div>
        <span className="part1-count">{exercises.length} exercises</span>
      </div>

      <div className="part1-exercise-list" aria-label="Available Part 1 exercises">
        {exercises.map((exercise, index) => (
          <button className="part1-exercise-choice" type="button" key={exercise.id} onClick={() => startExercise(exercise)}>
            <span>
              <strong>Exercise {index + 1}</strong>
              <span>{exercise.title}</span>
            </span>
            <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>

      <div className="part1-coming-later" aria-label="Future exercise parts">
        <strong>More parts coming later</strong>
        <span>Parts 2–8 will be added in later milestones.</span>
      </div>
    </section>
  )
}
