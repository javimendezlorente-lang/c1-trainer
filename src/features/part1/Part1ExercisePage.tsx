import { useState } from 'react'
import type { Part1Exercise as Part1ExerciseModel, Part1Option } from '../../domain/part1'
import { listApprovedPart1Exercises } from '../../content'
import type { Part1Grade } from '../../grading'
import { submitPart1Attempt } from '../../application/part1Submission'
import Part1Exercise from './Part1Exercise'
import Part1Results from './Part1Results'
import './part1.css'

type Answers = Record<string, string>

export default function Part1ExercisePage({ initialExercise = null }: { initialExercise?: Part1ExerciseModel | null } = {}) {
  const exercises = listApprovedPart1Exercises()
  const [selectedExercise, setSelectedExercise] = useState<Part1ExerciseModel | null>(initialExercise)
  const [answers, setAnswers] = useState<Answers>({})
  const [grade, setGrade] = useState<Part1Grade | null>(null)
  const [idempotencyKey, setIdempotencyKey] = useState(() => initialExercise ? `part1-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`}` : '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const createSessionKey = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `part1-${crypto.randomUUID()}`
    }
    return `part1-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  const startExercise = (exercise: Part1ExerciseModel) => {
    setSelectedExercise(exercise)
    setAnswers({})
    setGrade(null)
    setIdempotencyKey(createSessionKey())
    setSubmissionError(null)
  }

  const backToList = () => {
    setSelectedExercise(null)
    setAnswers({})
    setGrade(null)
    setIdempotencyKey('')
    setSubmissionError(null)
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
          setIdempotencyKey(createSessionKey())
          setSubmissionError(null)
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
        onSubmit={async () => {
          if (isSubmitting || !idempotencyKey) return
          setIsSubmitting(true)
          setSubmissionError(null)
          try {
            const submission = await submitPart1Attempt({
              exercise: selectedExercise,
              answers,
              idempotencyKey,
            })
            setGrade(submission.grade)
          } catch (error) {
            setSubmissionError(error instanceof Error && error.message.includes('IndexedDB') ? 'Local storage is unavailable in this browser. Open C1 Trainer in Safari or enable site storage, then try again.' : 'The attempt could not be saved locally. Check that site storage is enabled and try submitting again. Your answer has not been counted.')
          } finally {
            setIsSubmitting(false)
          }
        }}
        onBack={backToList}
        isSubmitting={isSubmitting}
        submissionError={submissionError}
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
