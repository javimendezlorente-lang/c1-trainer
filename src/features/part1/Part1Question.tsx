import type { Part1Option, Part1Question as Part1QuestionModel } from '../../domain/part1'

interface Part1QuestionProps {
  question: Part1QuestionModel
  selectedOptionId?: string
  onChange: (questionId: string, optionId: Part1Option['id']) => void
}

export default function Part1Question({ question, selectedOptionId, onChange }: Part1QuestionProps) {
  const unanswered = !selectedOptionId
  const statusId = `${question.id}-status`

  return (
    <li className={`part1-question-card${unanswered ? ' unanswered' : ''}`}>
      <fieldset aria-describedby={statusId}>
        <legend>Question {question.gap}</legend>
        {unanswered && (
          <p id={statusId} className="part1-question-status">
            Not answered yet
          </p>
        )}
        <div className="part1-options">
          {question.options.map((option) => (
            <label className="part1-option" key={option.id}>
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={selectedOptionId === option.id}
                onChange={() => onChange(question.id, option.id)}
              />
              <span>
                <strong>{option.id}</strong> — {option.text}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </li>
  )
}
