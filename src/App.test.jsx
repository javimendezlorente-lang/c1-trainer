import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('C1 Trainer shell', () => {
  it('renders the rebranded product and all shell destinations', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /C1 Trainer home/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument()

    for (const label of ['Home', 'Practice', 'Review', 'Progress', 'Settings']) {
      expect(screen.getByRole('link', { name: label, exact: true })).toBeInTheDocument()
    }
  })

  it('does not expose the removed language-learning controls', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.queryByText('Vocabulary')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'English' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Deutsch' })).not.toBeInTheDocument()
  })
})
