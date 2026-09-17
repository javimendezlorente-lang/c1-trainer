import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ReviewPage from './ReviewPage'

describe('Review page', () => {
  it('loads the offline review surface and keeps the Error Bank separate', async () => {
    render(<MemoryRouter><ReviewPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Error Bank' })).toBeInTheDocument()
  })
})
