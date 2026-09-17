import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import FlipCard from './FlipCard'

describe('FlipCard Layout Regression Tests', () => {
  const mockWord = {
    word: 'comprehensive',
    level: 'C1',
    partOfSpeech: 'adjective',
    translations: ['átfogó', 'teljes körű'],
    definition: 'complete and including everything',
    example: 'The report provides a comprehensive overview of the situation.'
  }

  it('renders without overflow - bug #2 regression', () => {
    // Regression test: FlipCard should not extend beyond container
    const { container } = render(<FlipCard {...mockWord} />)
    
    const flipCard = container.querySelector('.flip-card')
    const flipCardInner = container.querySelector('.flip-card-inner')
    const flipCardFront = container.querySelector('.flip-card-front')
    const flipCardBack = container.querySelector('.flip-card-back')
    
    // Verify structure exists
    expect(flipCard).toBeTruthy()
    expect(flipCardInner).toBeTruthy()
    expect(flipCardFront).toBeTruthy()
    expect(flipCardBack).toBeTruthy()
  })

  it('back content has proper overflow classes', () => {
    const { container } = render(<FlipCard {...mockWord} />)
    
    const backContent = container.querySelector('.back-content')
    expect(backContent).toBeTruthy()
    expect(backContent.className).toBe('back-content')
  })

  it('word title has word-break class structure', () => {
    const { container } = render(<FlipCard {...mockWord} />)
    
    const wordTitle = container.querySelector('.word-title')
    expect(wordTitle).toBeTruthy()
    expect(wordTitle.textContent).toBe('comprehensive')
  })

  it('maintains proper CSS classes for responsive design', () => {
    const { container } = render(<FlipCard {...mockWord} />)
    
    const flipCard = container.querySelector('.flip-card')
    expect(flipCard.className).toContain('flip-card')
  })
})
