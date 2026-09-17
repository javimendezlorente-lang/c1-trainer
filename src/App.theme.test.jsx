import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

describe('App Theme Switcher', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Reset data-theme attribute
    document.documentElement.removeAttribute('data-theme')
  })

  it('renders theme toggle button', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    const themeButton = screen.getByRole('button', { name: /toggle theme/i })
    expect(themeButton).toBeInTheDocument()
  })

  it('toggles theme when button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    const themeButton = screen.getByRole('button', { name: /toggle theme/i })
    
    // Initial state - should be light theme (default)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(themeButton.textContent).toContain('☀️')
    
    // Click to switch to dark
    await user.click(themeButton)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(themeButton.textContent).toContain('🌙')
    
    // Click again to switch back to light
    await user.click(themeButton)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(themeButton.textContent).toContain('☀️')
  })

  it('persists theme preference in localStorage', async () => {
    const user = userEvent.setup()
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    const themeButton = screen.getByRole('button', { name: /toggle theme/i })
    
    // Switch to dark theme
    await user.click(themeButton)
    
    // Check localStorage
    const stored = JSON.parse(localStorage.getItem('theme-storage'))
    expect(stored.state.theme).toBe('dark')
  })
})
