import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import FlipCard from './FlipCard'

describe('FlipCard', () => {
  const mockWord = {
    id: 'abolish',
    word: 'abolish',
    level: 'C1',
    partOfSpeech: 'verb',
    translations: ['eltöröl', 'megszüntet'],
    definition: 'to officially end a law, system, or practice',
    example: 'The government voted to abolish the outdated tax system.'
  }

  it('renders the word on the front side', () => {
    render(<FlipCard {...mockWord} wordId={mockWord.id} />)
    expect(screen.getAllByText('abolish')[0]).toBeInTheDocument()
    expect(screen.getAllByText('C1')[0]).toBeInTheDocument()
  })

  it('shows flip hint on front side', () => {
    render(<FlipCard {...mockWord} wordId={mockWord.id} />)
    expect(screen.getByText(/Click or press Space to flip/)).toBeInTheDocument()
    expect(screen.getByText(/Press Enter to mark as learned/)).toBeInTheDocument()
  })

  it('renders learned toggle button', () => {
    render(<FlipCard {...mockWord} wordId={mockWord.id} />)
    const toggleButtons = screen.getAllByRole('button', { name: /mark as/i })
    expect(toggleButtons.length).toBeGreaterThan(0)
  })

  it('flips card when spacebar is pressed', async () => {
    const user = userEvent.setup()
    render(<FlipCard {...mockWord} wordId={mockWord.id} />)
    
    // Press spacebar
    await user.keyboard(' ')
    
    // Back side should show translations
    expect(screen.getByText(/eltöröl, megszüntet/)).toBeInTheDocument()
  })

  it('toggles card when spacebar is pressed multiple times', async () => {
    const user = userEvent.setup()
    render(<FlipCard {...mockWord} wordId={mockWord.id} />)
    
    // First spacebar - flip to back
    await user.keyboard(' ')
    expect(screen.getByText(/Magyar:/)).toBeInTheDocument()
    
    // Second spacebar - flip to front
    await user.keyboard(' ')
    expect(screen.getByText(/Click or press Space to flip/)).toBeInTheDocument()
  })

  it('flips card when clicked', async () => {
    const user = userEvent.setup()
    render(<FlipCard {...mockWord} wordId={mockWord.id} />)
    
    const card = screen.getByRole('button', { name: /flashcard/i })
    await user.click(card)
    
    // Back side should show translations
    expect(screen.getByText(/eltöröl, megszüntet/)).toBeInTheDocument()
  })

  it('displays translations on back side', async () => {
    const user = userEvent.setup()
    render(<FlipCard {...mockWord} wordId={mockWord.id} />)
    
    const card = screen.getByRole('button', { name: /flashcard/i })
    await user.click(card)
    
    expect(screen.getByText(/Magyar:/)).toBeInTheDocument()
    expect(screen.getByText(/eltöröl, megszüntet/)).toBeInTheDocument()
  })

  it('displays definition and example on back side', async () => {
    const user = userEvent.setup()
    render(<FlipCard {...mockWord} wordId={mockWord.id} />)
    
    const card = screen.getByRole('button', { name: /flashcard/i })
    await user.click(card)
    
    expect(screen.getByText(/Definition:/)).toBeInTheDocument()
    expect(screen.getByText(/to officially end a law/)).toBeInTheDocument()
    expect(screen.getByText(/Example:/)).toBeInTheDocument()
    expect(screen.getByText(/The government voted to abolish/)).toBeInTheDocument()
  })

  it('shows part of speech on back side', async () => {
    const user = userEvent.setup()
    render(<FlipCard {...mockWord} wordId={mockWord.id} />)
    
    const card = screen.getByRole('button', { name: /flashcard/i })
    await user.click(card)
    
    expect(screen.getByText('verb')).toBeInTheDocument()
  })

  it('toggles between front and back when clicked multiple times', async () => {
    const user = userEvent.setup()
    render(<FlipCard {...mockWord} wordId={mockWord.id} />)
    
    const card = screen.getByRole('button', { name: /flashcard/i })
    
    // First click - flip to back
    await user.click(card)
    expect(screen.getByText(/Magyar:/)).toBeInTheDocument()
    
    // Second click - flip to front
    await user.click(card)
    expect(screen.getByText(/Click or press Space to flip/)).toBeInTheDocument()
  })

  it('marks as learned when Enter key is pressed', async () => {
    const user = userEvent.setup()
    render(<FlipCard {...mockWord} wordId={mockWord.id} />)
    
    // Initially should show not learned (○)
    const toggleButton = screen.getAllByRole('button', { name: /mark as learned/i })[0]
    expect(toggleButton).toHaveTextContent('○')
    
    // Press Enter
    await user.keyboard('{Enter}')
    
    // Should now show learned (✓)
    const learnedButton = screen.getAllByRole('button', { name: /mark as not learned/i })[0]
    expect(learnedButton).toHaveTextContent('✓')
  })
})
