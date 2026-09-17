import type { Part1Exercise as Part1ExerciseModel, Part1Option } from '../../domain/part1'
import Part1Question from './Part1Question'

interface Part1ExerciseProps {
  exercise: Part1ExerciseModel
  answers: Readonly<Record<string, string>>
  onAnswer: (questionId: string, optionId: Part1Option['id']) => void
  onSubmit: () => void
  onBack: () => void
}

function renderPassage(text: string) {
  return text.split(/(\{\{gap:\d+\}\})/g).map((segment, index) => {
    const match = segment.match(/^\{\{gap:(\d+)\}\}$/)
    if (!match) return <span key={`text-${index}`}>{segment}</span>

    const number = match[1]
    return (
      <span className="part1-gap" key={`gap-${number}`} aria-label={`Gap ${number}`}>
        ({number}) ______
      </span>
    )
  })
}

export default function Part1Exercise({ exercise, answers, onAnswer, onSubmit, onBack }: Part1ExerciseProps) {
  const unansweredCount = exercise.questions.filter((question) => !answers[question.id]).length

  return (
    <section className="part1-shell" aria-labelledby="part1-exercise-title">
      <div className="part1-toolbar">
        <button type="button" onClick={onBack}>
          ← Back to Part 1
        </button>
        <span className="part1-progress">8 questions · 1 mark each</span>
      </div>

      <div className="part1-heading">
        <p className="eyebrow">Reading &amp; Use of English · Part 1</p>
        <h1 id="part1-exercise-title">{exercise.title}</h1>
        <p className="part1-instruction">
          For questions 1–8, read the text and decide which answer (A, B, C or D) best fits each gap.
        </p>
      </div>

      <article className="part1-passage" aria-label="Exercise text">
        <p>{renderPassage(exercise.content.text)}</p>
      </article>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <ol className="part1-question-list">
          {exercise.questions.map((question) => (
            <Part1Question
              key={question.id}
              question={question}
              selectedOptionId={answers[question.id]}
              onChange={onAnswer}
            />
          ))}
        </ol>

        <div className="part1-submit-panel">
          {unansweredCount > 0 && (
            <p className="part1-unanswered-warning" role="status">
              {unansweredCount} question{unansweredCount === 1 ? '' : 's'} still unanswered. You can submit now.
            </p>
          )}
          <button className="part1-primary-button" type="submit">
            Submit answers
          </button>
        </div>
      </form>
    </section>
  )
}
