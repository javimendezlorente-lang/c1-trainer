import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PracticeControls from './PracticeControls'
import { usePracticeStore } from '../store/practiceStore'

describe('PracticeControls', () => {
  beforeEach(() => {
    usePracticeStore.getState().resetAll()
  })

  describe('mode selection', () => {
    it('should render all three mode tabs', () => {
      render(<PracticeControls />)
      
      expect(screen.getByRole('button', { name: /multiple choice/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /match pairs/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /fill in blanks/i })).toBeInTheDocument()
    })

    it('should show multiple-choice as active by default', () => {
      render(<PracticeControls />)
      
      const mcButton = screen.getByRole('button', { name: /multiple choice/i })
      expect(mcButton).toHaveClass('active')
    })

    it('should change mode when clicking a tab', async () => {
      const user = userEvent.setup()
      render(<PracticeControls />)
      
      const matchPairsButton = screen.getByRole('button', { name: /match pairs/i })
      await user.click(matchPairsButton)
      
      expect(matchPairsButton).toHaveClass('active')
      expect(usePracticeStore.getState().currentMode).toBe('match-pairs')
    })

    it('should reset session stats when changing modes', async () => {
      const user = userEvent.setup()
      
      // Set up some stats
      usePracticeStore.getState().incrementCorrect()
      usePracticeStore.getState().incrementCorrect()
      usePracticeStore.getState().incrementIncorrect()
      
      render(<PracticeControls />)
      
      const fillBlanksButton = screen.getByRole('button', { name: /fill in blanks/i })
      await user.click(fillBlanksButton)
      
      const state = usePracticeStore.getState()
      expect(state.correctCount).toBe(0)
      expect(state.incorrectCount).toBe(0)
    })
  })

  describe('direction toggle', () => {
    it('should render direction select with HU→EN by default', () => {
      render(<PracticeControls />)
      
      const select = screen.getByLabelText(/direction/i)
      expect(select).toHaveValue('hu-to-en')
    })

    it('should change direction when selecting', async () => {
      const user = userEvent.setup()
      render(<PracticeControls />)
      
      const select = screen.getByLabelText(/direction/i)
      await user.selectOptions(select, 'en-to-hu')
      
      expect(select).toHaveValue('en-to-hu')
      expect(usePracticeStore.getState().direction).toBe('en-to-hu')
    })

    it('should show both direction options', () => {
      render(<PracticeControls />)
      
      expect(screen.getByRole('option', { name: /Hungarian to English/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /English to Hungarian/i })).toBeInTheDocument()
    })
  })

  describe('word pool filter', () => {
    it('should render filter select with "All Words" by default', () => {
      render(<PracticeControls />)
      
      const select = screen.getByLabelText(/word pool/i)
      expect(select).toHaveValue('all')
    })

    it('should change filter when selecting', async () => {
      const user = userEvent.setup()
      render(<PracticeControls />)
      
      const select = screen.getByLabelText(/word pool/i)
      await user.selectOptions(select, 'learned')
      
      expect(select).toHaveValue('learned')
      expect(usePracticeStore.getState().wordPoolFilter).toBe('learned')
    })

    it('should show all filter options', () => {
      render(<PracticeControls />)
      
      expect(screen.getByRole('option', { name: /all words/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /learned only/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /mistakes only/i })).toBeInTheDocument()
    })
  })

  describe('level filter', () => {
    it('should render level select with "All Levels" by default', () => {
      render(<PracticeControls />)
      
      const select = screen.getByLabelText(/level/i)
      expect(select).toHaveValue('all')
    })

    it('should change level filter when selecting', async () => {
      const user = userEvent.setup()
      render(<PracticeControls />)
      
      const select = screen.getByLabelText(/level/i)
      await user.selectOptions(select, 'C1')
      
      expect(select).toHaveValue('C1')
      expect(usePracticeStore.getState().levelFilter).toBe('C1')
    })

    it('should show all level options', () => {
      render(<PracticeControls />)
      
      expect(screen.getByRole('option', { name: /all levels/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /^B1$/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /^B2$/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /^C1$/ })).toBeInTheDocument()
    })
  })

  describe('stats display', () => {
    it('should show placeholder when no attempts made', () => {
      render(<PracticeControls />)
      
      expect(screen.getByText(/start practicing to see your stats/i)).toBeInTheDocument()
    })

    it('should show stats when attempts have been made', () => {
      usePracticeStore.getState().incrementCorrect()
      usePracticeStore.getState().incrementCorrect()
      usePracticeStore.getState().incrementIncorrect()
      
      render(<PracticeControls />)
      
      expect(screen.getByText('2')).toBeInTheDocument() // correct count
      expect(screen.getByText('1')).toBeInTheDocument() // incorrect count
      expect(screen.getByText('67%')).toBeInTheDocument() // accuracy
      
      // Verify stat labels exist
      const statLabels = screen.getAllByText(/correct|incorrect|accuracy/i)
      expect(statLabels.length).toBeGreaterThan(0)
    })

    it('should update stats when store changes', () => {
      const { rerender } = render(<PracticeControls />)
      
      expect(screen.getByText(/start practicing/i)).toBeInTheDocument()
      
      // Add some stats using act to avoid warnings
      const { incrementCorrect } = usePracticeStore.getState()
      incrementCorrect()
      incrementCorrect()
      incrementCorrect()
      
      rerender(<PracticeControls />)
      
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should show 0% accuracy when all incorrect', () => {
      usePracticeStore.getState().incrementIncorrect()
      usePracticeStore.getState().incrementIncorrect()
      
      render(<PracticeControls />)
      
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should show 100% accuracy when all correct', () => {
      usePracticeStore.getState().incrementCorrect()
      usePracticeStore.getState().incrementCorrect()
      usePracticeStore.getState().incrementCorrect()
      
      render(<PracticeControls />)
      
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })
})
