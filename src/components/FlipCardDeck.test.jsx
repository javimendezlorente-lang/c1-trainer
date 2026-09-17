import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import FlipCardDeck from './FlipCardDeck'

describe('FlipCardDeck Navigation', () => {
  const mockWords = [
    {
      id: '1',
      word: 'abolish',
      level: 'C1',
      partOfSpeech: 'verb',
      translations: ['eltöröl', 'megszüntet'],
      definition: 'to officially end a law, system, or practice',
      example: 'The government voted to abolish the outdated tax system.'
    },
    {
      id: '2',
      word: 'abstract',
      level: 'C1',
      partOfSpeech: 'adjective',
      translations: ['elvont', 'absztrakt'],
      definition: 'existing in thought or as an idea but not having a physical reality',
      example: 'The concept of freedom is quite abstract.'
    },
    {
      id: '3',
      word: 'accommodate',
      level: 'C1',
      partOfSpeech: 'verb',
      translations: ['elszállásol', 'alkalmazkodik'],
      definition: 'to provide lodging or sufficient space for',
      example: 'The hotel can accommodate up to 500 guests.'
    }
  ]

  it('navigates to next card when Next button is clicked', async () => {
    const user = userEvent.setup()
    const onProgress = vi.fn()
    
    render(<FlipCardDeck words={mockWords} onProgress={onProgress} />)
    
    // First card should be visible (check for front side word)
    expect(screen.getAllByText('abolish')[0]).toBeInTheDocument()
    
    // Click Next button
    const nextButton = screen.getByRole('button', { name: /next card/i })
    await user.click(nextButton)
    
    // Second card should be visible
    expect(screen.getAllByText('abstract')[0]).toBeInTheDocument()
  })

  it('navigates to previous card when Previous button is clicked', async () => {
    const user = userEvent.setup()
    const onProgress = vi.fn()
    
    render(<FlipCardDeck words={mockWords} onProgress={onProgress} />)
    
    // Navigate to second card first
    const nextButton = screen.getByRole('button', { name: /next card/i })
    await user.click(nextButton)
    expect(screen.getAllByText('abstract')[0]).toBeInTheDocument()
    
    // Click Previous button
    const prevButton = screen.getByRole('button', { name: /previous card/i })
    await user.click(prevButton)
    
    // First card should be visible again
    expect(screen.getAllByText('abolish')[0]).toBeInTheDocument()
  })

  it('navigates forward with arrow right key', async () => {
    const user = userEvent.setup()
    const onProgress = vi.fn()
    
    render(<FlipCardDeck words={mockWords} onProgress={onProgress} />)
    
    // First card should be visible
    expect(screen.getAllByText('abolish')[0]).toBeInTheDocument()
    
    // Press arrow right
    await user.keyboard('{ArrowRight}')
    
    // Second card should be visible
    expect(screen.getAllByText('abstract')[0]).toBeInTheDocument()
  })

  it('navigates backward with arrow left key', async () => {
    const user = userEvent.setup()
    const onProgress = vi.fn()
    
    render(<FlipCardDeck words={mockWords} onProgress={onProgress} />)
    
    // Navigate to second card first
    await user.keyboard('{ArrowRight}')
    expect(screen.getAllByText('abstract')[0]).toBeInTheDocument()
    
    // Press arrow left
    await user.keyboard('{ArrowLeft}')
    
    // First card should be visible again
    expect(screen.getAllByText('abolish')[0]).toBeInTheDocument()
  })

  it('calls onProgress callback with correct values when navigating', async () => {
    const user = userEvent.setup()
    const onProgress = vi.fn()
    
    render(<FlipCardDeck words={mockWords} onProgress={onProgress} />)
    
    // Initial progress
    expect(onProgress).toHaveBeenCalledWith({ current: 1, total: 3 })
    
    // Navigate to next card
    const nextButton = screen.getByRole('button', { name: /next card/i })
    await user.click(nextButton)
    
    // Progress should update
    expect(onProgress).toHaveBeenCalledWith({ current: 2, total: 3 })
    
    // Navigate to third card
    await user.click(nextButton)
    expect(onProgress).toHaveBeenCalledWith({ current: 3, total: 3 })
  })

  it('disables Previous button on first card', () => {
    render(<FlipCardDeck words={mockWords} />)
    
    const prevButton = screen.getByRole('button', { name: /previous card/i })
    expect(prevButton).toBeDisabled()
  })

  it('disables Next button on last card', async () => {
    const user = userEvent.setup()
    render(<FlipCardDeck words={mockWords} />)
    
    const nextButton = screen.getByRole('button', { name: /next card/i })
    
    // Navigate to last card
    await user.click(nextButton) // Card 2
    await user.click(nextButton) // Card 3
    
    // Next button should be disabled
    expect(nextButton).toBeDisabled()
  })

  it('navigates through all cards sequentially', async () => {
    const user = userEvent.setup()
    render(<FlipCardDeck words={mockWords} />)
    
    // Start at card 1
    expect(screen.getAllByText('abolish')[0]).toBeInTheDocument()
    
    const nextButton = screen.getByRole('button', { name: /next card/i })
    
    // Go to card 2
    await user.click(nextButton)
    expect(screen.getAllByText('abstract')[0]).toBeInTheDocument()
    
    // Go to card 3
    await user.click(nextButton)
    expect(screen.getAllByText('accommodate')[0]).toBeInTheDocument()
    
    // Can't go further (button should be disabled)
    expect(nextButton).toBeDisabled()
  })
})
