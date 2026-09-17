import { useState } from 'react'
import { listApprovedPart1Exercises, listApprovedPart2Exercises, listApprovedPart3Exercises, listApprovedPart4Exercises, listApprovedPart5Exercises, listApprovedPart6Exercises, listApprovedPart7Exercises, listApprovedPart8Exercises } from '../../content'
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

type MenuPart = { number:number; title:string; description:string; list:()=>readonly ImplementedExercise[] }
const menu = (number:number, title:string, description:string, list:()=>readonly ImplementedExercise[]):MenuPart => ({number,title,description,list})
const groups:{heading:string;parts:MenuPart[]}[] = [
  { heading:'Use of English', parts:[menu(1,'Multiple-choice cloze','Vocabulary, collocation and fixed expressions',()=>listApprovedPart1Exercises()), menu(2,'Open cloze','Grammar and cohesion with one-word answers',()=>listApprovedPart2Exercises()), menu(3,'Word formation','Form the correct word from the capitalised root',()=>listApprovedPart3Exercises()), menu(4,'Key word transformation','Rewrite the sentence in 3–6 words',()=>listApprovedPart4Exercises())] },
  { heading:'Reading', parts:[menu(5,'Multiple choice reading','Detail, opinion, attitude, tone and implication',()=>listApprovedPart5Exercises()), menu(6,'Cross-text multiple matching','Compare opinions and attitudes across four texts',()=>listApprovedPart6Exercises()), menu(7,'Gapped text','Follow cohesion, coherence and text structure',()=>listApprovedPart7Exercises()), menu(8,'Multiple matching','Find specific information, detail and attitude',()=>listApprovedPart8Exercises())] },
]

export default function UseOfEnglishPracticePage() {
  const [selected, setSelected] = useState<ImplementedExercise|null>(null)
  const [part, setPart] = useState<number|null>(null)
  if (selected) {
    const back = () => setSelected(null)
    if (selected.part === 1) return <Part1ExercisePage initialExercise={selected as Part1Exercise} />
    if (selected.part === 5) return <Part5ExercisePage exercise={selected as Part5Exercise} onBack={back} />
    if (selected.part === 6) return <Part6ExercisePage exercise={selected as Part6Exercise} onBack={back} />
    if (selected.part === 7) return <Part7ExercisePage exercise={selected as Part7Exercise} onBack={back} />
    if (selected.part === 8) return <Part8ExercisePage exercise={selected as Part8Exercise} onBack={back} />
    return <TextExercisePage exercise={selected as any} onBack={back} />
  }
  if (part !== null) {
    const item = groups.flatMap((group) => group.parts).find((candidate) => candidate.number === part)!
    return <section className="part1-shell part1-selector" aria-labelledby="part-title"><div className="part1-heading"><p className="eyebrow">Cambridge C1 Advanced · {part <= 4 ? 'Use of English' : 'Reading'} · Part {part}</p><h1 id="part-title">Choose an exercise</h1><p className="part1-instruction">Original approved content; attempts are saved locally when submitted.</p></div><div className="part1-exercise-list">{item.list().map((exercise,index) => <button className="part1-exercise-choice" type="button" key={exercise.id} onClick={() => setSelected(exercise)}><span><strong>Exercise {index + 1}</strong><span>{exercise.title}</span></span><span aria-hidden="true">→</span></button>)}</div><button type="button" onClick={() => setPart(null)}>← Back to practice</button></section>
  }
  return <section className="part1-shell part1-selector" aria-labelledby="practice-title"><div className="part1-heading"><p className="eyebrow">Cambridge C1 Advanced</p><h1 id="practice-title">Practice</h1><p className="part1-instruction">Choose a focused exercise. All content is available offline after installation.</p></div>{groups.map((group) => <div key={group.heading}><div className="part1-section-heading"><h2>{group.heading}</h2><span>Parts {group.parts[0].number}–{group.parts[group.parts.length - 1].number}</span></div>{group.parts.map((item) => <div key={item.number}><button className="part1-type-card" type="button" onClick={() => setPart(item.number)}><span><strong>Part {item.number} · {item.title}</strong><small>{item.description}</small></span><span className="part1-count">{item.list().length} exercises →</span></button>{item.number === 1 && <div className="part1-exercise-list" aria-label="Available Part 1 exercises">{item.list().map((exercise,index) => <button className="part1-exercise-choice" type="button" key={exercise.id} onClick={() => setSelected(exercise)}><span><strong>Exercise {index + 1}</strong><span>{exercise.title}</span></span><span aria-hidden="true">→</span></button>)}</div>}</div>)}</div>)}</section>
}
