import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('C1 Trainer routing', () => {
  it.each([
    ['/practice', 'What do you want to practise?'],
    ['/review', 'Review'],
    ['/progress', 'Progress'],
    ['/settings', 'Settings'],
  ])('renders the %s shell section', (path, heading) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
  })

  it('falls back safely for an obsolete vocabulary route', () => {
    render(
      <MemoryRouter initialEntries={['/vocabulary']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Vocabulary' })).not.toBeInTheDocument()
  })
})
