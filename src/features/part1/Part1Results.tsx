import type { Part1Exercise as Part1ExerciseModel } from '../../domain/part1'
import type { Part1Grade } from '../../grading/part1Grader'

interface Part1ResultsProps {
  exercise: Part1ExerciseModel
  grade: Part1Grade
  onRetry: () => void
  onBack: () => void
}

export default function Part1Results({ exercise, grade, onRetry, onBack }: Part1ResultsProps) {
  return (
    <section className="part1-shell" aria-labelledby="part1-results-title">
      <div className="part1-heading">
        <p className="eyebrow">Reading &amp; Use of English · Part 1</p>
        <h1 id="part1-results-title">Results</h1>
        <p className="part1-score" aria-live="polite">
          Score: {grade.score} / {grade.maxScore}
        </p>
        {!grade.complete && <p className="part1-result-note">Unanswered questions are marked incorrect.</p>}
      </div>

      <ol className="part1-results-list">
        {exercise.questions.map((question, index) => {
          const result = grade.results[index]
          const selectedOption = question.options.find((option) => option.id === result.selectedOptionId)
          const correctOption = question.options.find((option) => option.id === result.correctOptionId)

          return (
            <li className={`part1-result-card ${result.correct ? 'is-correct' : 'is-incorrect'}`} key={question.id}>
              <div className="part1-result-heading">
                <h2>Question {question.gap}</h2>
                <strong>{result.correct ? 'Correct' : 'Incorrect'}</strong>
              </div>
              <p>
                <span className="part1-result-label">Your answer:</span>{' '}
                {selectedOption ? `${selectedOption.id} — ${selectedOption.text}` : 'Not answered'}
              </p>
              <p>
                <span className="part1-result-label">Correct answer:</span> {correctOption?.id} — {correctOption?.text}
              </p>
              <p>
                <span className="part1-result-label">Explanation:</span> {question.explanation}
              </p>
              {question.distractorExplanations && (
                <details>
                  <summary>Why the other options do not fit</summary>
                  <ul>
                    {Object.entries(question.distractorExplanations).map(([optionId, explanation]) => (
                      <li key={optionId}>
                        <strong>{optionId}</strong> — {explanation}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </li>
          )
        })}
      </ol>

      <div className="part1-results-skills">
        <span className="part1-result-label">Skills:</span> {exercise.skills.primarySkill}
        {exercise.skills.secondarySkills.length > 0 && ` · ${exercise.skills.secondarySkills.join(' · ')}`}
      </div>

      <div className="part1-actions">
        <button className="part1-primary-button" type="button" onClick={onRetry}>
          Try again
        </button>
        <button type="button" onClick={onBack}>
          Back to Part 1
        </button>
      </div>
    </section>
  )
}
