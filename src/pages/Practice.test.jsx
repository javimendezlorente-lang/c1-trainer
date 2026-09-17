import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import Practice from './Practice'
import { usePracticeStore } from '../store/practiceStore'

// Mock child components
vi.mock('../components/PracticeControls', () => ({
  default: () => <div data-testid="practice-controls">Controls</div>
}))
vi.mock('../components/MultipleChoice', () => ({
  default: () => <div data-testid="multiple-choice">Multiple Choice</div>
}))
vi.mock('../components/MatchPairs', () => ({
  default: () => <div data-testid="match-pairs">Match Pairs</div>
}))
vi.mock('../components/FillBlanks', () => ({
  default: () => <div data-testid="fill-blanks">Fill Blanks</div>
}))

// Mock store
vi.mock('../store/practiceStore')

describe('Practice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the practice page layout', () => {
    usePracticeStore.mockReturnValue({
      currentMode: 'multiple-choice'
    })

    const { container } = render(<Practice />)
    expect(container.querySelector('.practice-page')).toBeTruthy()
  })

  it('renders sidebar with controls', () => {
    usePracticeStore.mockReturnValue({
      currentMode: 'multiple-choice'
    })

    const { container } = render(<Practice />)
    const sidebar = container.querySelector('.practice-sidebar')
    expect(sidebar).toBeTruthy()
  })

  it('renders main content area', () => {
    usePracticeStore.mockReturnValue({
      currentMode: 'multiple-choice'
    })

    const { container } = render(<Practice />)
    const main = container.querySelector('.practice-main')
    expect(main).toBeTruthy()
  })

  it('renders MultipleChoice when mode is multiple-choice', () => {
    usePracticeStore.mockReturnValue({
      currentMode: 'multiple-choice'
    })

    const { getByTestId } = render(<Practice />)
    expect(getByTestId('multiple-choice')).toBeTruthy()
  })

  it('renders MatchPairs when mode is match-pairs', () => {
    usePracticeStore.mockReturnValue({
      currentMode: 'match-pairs'
    })

    const { getByTestId } = render(<Practice />)
    expect(getByTestId('match-pairs')).toBeTruthy()
  })

  it('renders FillBlanks when mode is fill-blanks', () => {
    usePracticeStore.mockReturnValue({
      currentMode: 'fill-blanks'
    })

    const { getByTestId } = render(<Practice />)
    expect(getByTestId('fill-blanks')).toBeTruthy()
  })

  it('renders nothing when mode is unknown', () => {
    usePracticeStore.mockReturnValue({
      currentMode: 'unknown-mode'
    })

    const { container } = render(<Practice />)
    const main = container.querySelector('.practice-main')
    expect(main.children.length).toBe(0)
  })

  it('switches between modes correctly', () => {
    const { rerender, getByTestId } = render(<Practice />)
    
    usePracticeStore.mockReturnValue({
      currentMode: 'multiple-choice'
    })
    rerender(<Practice />)
    expect(getByTestId('multiple-choice')).toBeTruthy()

    usePracticeStore.mockReturnValue({
      currentMode: 'match-pairs'
    })
    rerender(<Practice />)
    expect(getByTestId('match-pairs')).toBeTruthy()

    usePracticeStore.mockReturnValue({
      currentMode: 'fill-blanks'
    })
    rerender(<Practice />)
    expect(getByTestId('fill-blanks')).toBeTruthy()
  })
})
