import './PlaceholderPage.css'

export default function PlaceholderPage({ title, description }) {
  return (
    <section className="placeholder-page" aria-labelledby="page-title">
      <p className="eyebrow">C1 Trainer</p>
      <h2 id="page-title">{title}</h2>
      <p className="placeholder-description">{description}</p>
      <p className="placeholder-status">This foundation milestone has no learner content yet.</p>
    </section>
  )
}

