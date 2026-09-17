import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../App'

describe('Part 1 practice flow', () => {
  it('selects, changes, submits, retries and returns to the list', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/practice']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /Exercise 1 Signals in the canopy/i }))
    expect(screen.getAllByRole('radio')).toHaveLength(32)
    expect(screen.queryByText(/Correct answer:/i)).not.toBeInTheDocument()

    const firstOption = screen.getAllByRole('radio')[0]
    const changedOption = screen.getAllByRole('radio')[1]
    await user.click(firstOption)
    await user.click(changedOption)
    expect(firstOption).not.toBeChecked()
    expect(changedOption).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Submit answers' }))
    expect(await screen.findByText('Score: 1 / 8')).toBeInTheDocument()
    expect(screen.getAllByText(/Correct answer:/i)).toHaveLength(8)
    expect(screen.getAllByText(/Explanation:/i)).toHaveLength(8)

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.getByRole('button', { name: 'Submit answers' })).toBeInTheDocument()
    expect(screen.queryByText(/Correct answer:/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Back to Part 1/i }))
    expect(screen.getByRole('heading', { name: 'Practice' })).toBeInTheDocument()
  })
})
