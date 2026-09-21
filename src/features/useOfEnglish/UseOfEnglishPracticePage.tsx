import { useEffect, useState } from 'react'
import { exerciseLibrary } from '../../content/exerciseLibrary'
import { attemptRepository } from '../../storage'
import type { ImplementedExercise } from '../../domain/exercise'
import type { Part1Exercise } from '../../domain/part1'
import type { Part5Exercise } from '../../domain/part5'
import type { Part6Exercise } from '../../domain/part6'
import type { Part7Exercise } from '../../domain/part7'
import type { Part8Exercise } from '../../domain/part8'
import Part1ExercisePage from '../part1/Part1ExercisePage'
import TextExercisePage from './TextExercisePage'
import Part5ExercisePage from '../part5/Part5ExercisePage'
import Part6ExercisePage from '../part6/Part6ExercisePage'
import Part7ExercisePage from '../part7/Part7ExercisePage'
import Part8ExercisePage from '../part8/Part8ExercisePage'

type MenuPart = { number: number; title: string; description: string }
const groups: { heading: string; parts: MenuPart[] }[] = [
  { heading: 'Use of English', parts: [
    { number: 1, title: 'Multiple-choice cloze', description: 'Vocabulary, collocation and fixed expressions' },
    { number: 2, title: 'Open cloze', description: 'Grammar and cohesion with one-word answers' },
    { number: 3, title: 'Word formation', description: 'Form the correct word from the capitalised root' },
    { number: 4, title: 'Key word transformation', description: 'Rewrite the sentence in 3–6 words' },
  ] },
  { heading: 'Reading', parts: [
    { number: 5, title: 'Multiple choice reading', description: 'Detail, opinion, attitude, tone and implication' },
    { number: 6, title: 'Cross-text multiple matching', description: 'Compare opinions and attitudes across four texts' },
    { number: 7, title: 'Gapped text', description: 'Follow cohesion, coherence and text structure' },
    { number: 8, title: 'Multiple matching', description: 'Find specific information, detail and attitude' },
  ] },
]

function renderExercise(exercise: ImplementedExercise, onBack: () => void) {
  if (exercise.part === 1) return <Part1ExercisePage initialExercise={exercise as Part1Exercise} />
  if (exercise.part === 5) return <Part5ExercisePage exercise={exercise as Part5Exercise} onBack={onBack} />
  if (exercise.part === 6) return <Part6ExercisePage exercise={exercise as Part6Exercise} onBack={onBack} />
  if (exercise.part === 7) return <Part7ExercisePage exercise={exercise as Part7Exercise} onBack={onBack} />
  if (exercise.part === 8) return <Part8ExercisePage exercise={exercise as Part8Exercise} onBack={onBack} />
  return <TextExercisePage exercise={exercise as any} onBack={onBack} />
}

export default function UseOfEnglishPracticePage() {
  const [selected, setSelected] = useState<ImplementedExercise | null>(null)
  const [attempted, setAttempted] = useState<string[]>([])
  const [starting, setStarting] = useState<number | null>(null)

  useEffect(() => { void attemptRepository.list().then((events) => setAttempted(events.map((event) => event.exerciseId))) }, [])

  async function startPractice(part: number) {
    setStarting(part)
    try {
      const events = await attemptRepository.list()
      const recent = events.slice(-4).map((event) => event.exerciseId)
      const exercise = exerciseLibrary.select({ part, attemptedExerciseIds: events.map((event) => event.exerciseId), recentExerciseIds: recent, seed: new Date().toISOString().slice(0, 10) })
      if (exercise) setSelected(exercise)
    } finally { setStarting(null) }
  }

  if (selected) return renderExercise(selected, () => setSelected(null))

  return <section className="part1-shell part1-selector" aria-labelledby="practice-title">
    <div className="part1-heading"><p className="eyebrow">Cambridge C1 Advanced</p><h1 id="practice-title">What do you want to practise?</h1><p className="part1-instruction">Start an approved exercise. If you have completed the small bundled set, the app revisits the least recent item. Your learning history stays on this device and the app works offline.</p></div>
    {groups.map((group) => <div key={group.heading}><div className="part1-section-heading"><h2>{group.heading}</h2><span>Parts {group.parts[0].number}–{group.parts[group.parts.length - 1].number}</span></div>{group.parts.map((item) => <article className="part1-type-card practice-part-card" key={item.number}><div><h3>Part {item.number} · {item.title}</h3><p>{item.description}</p><small>{exerciseLibrary.list(item.number).length} eligible offline exercises · {attempted.filter((id) => exerciseLibrary.list(item.number).some((exercise) => exercise.id === id)).length} attempted</small></div><button className="part1-primary-button" type="button" onClick={() => void startPractice(item.number)} disabled={starting !== null}>{starting === item.number ? 'Opening…' : 'Start practice'}</button></article>)}</div>)}
    <details className="practice-library"><summary>Library (optional)</summary><p>Use this only when you want to revisit the bundled reference set.</p>{groups.flatMap((group) => group.parts).map((item) => <p key={item.number}>Part {item.number}: {exerciseLibrary.list(item.number).length} exercises</p>)}</details>
  </section>
}
