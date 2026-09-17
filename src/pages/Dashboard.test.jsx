import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Dashboard from './Dashboard'

describe('Dashboard page', () => {
  it('renders stats and action buttons and footer and handles clicks', () => {
    render(<Dashboard />)
    // Buttons
    const clearBtn = screen.getByText(/Clear All Progress/i)
    const dlBtn = screen.getByText(/Download Progress/i)
    const upBtn = screen.getByText(/Upload Progress/i)
    // Footer
    const version = screen.getByText(/Version/)
    const gh = screen.getByLabelText('GitHub')

    expect(clearBtn).toBeInTheDocument()
    expect(dlBtn).toBeInTheDocument()
    expect(upBtn).toBeInTheDocument()
    expect(version).toBeInTheDocument()
    expect(gh).toBeInTheDocument()

    // Click download and upload to exercise handlers (no exceptions)
    fireEvent.click(dlBtn)
    fireEvent.click(upBtn)
  })
})
