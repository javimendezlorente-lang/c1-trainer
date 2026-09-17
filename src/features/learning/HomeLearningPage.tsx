import { useEffect, useState } from 'react'
import { rebuildProjections } from '../../application/part1Submission'
import './learning.css'

export default function HomeLearningPage() {
  const [due, setDue] = useState<number | null>(null)
  useEffect(() => { let active = true; rebuildProjections().then((projections) => { if (active) setDue(projections.review.reviewsDue) }); return () => { active = false } }, [])
  return <section className="learning-page" aria-labelledby="home-title"><p className="eyebrow">C1 Trainer</p><h1 id="home-title">Home</h1><p className="learning-intro">Your next focused practice session starts here.</p><div className="learning-card"><h2>Reviews due</h2><p>{due === null ? 'Loading…' : due}</p><a className="review-link" href="#/review">Review now</a></div></section>
}
