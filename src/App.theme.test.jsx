import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { useThemeStore } from './store/themeStore'

describe('C1 Trainer theme', () => {
  beforeEach(() => {
    localStorage.clear()
    useThemeStore.getState().setTheme('light')
    document.documentElement.removeAttribute('data-theme')
  })

  it('supports light/dark theme changes from the shell', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    const themeButton = screen.getByRole('button', { name: /use dark theme/i })
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    await user.click(themeButton)

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(screen.getByRole('button', { name: /use light theme/i })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('theme-storage')).state.theme).toBe('dark')
  })

  it('exposes the theme preference on Settings', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Theme' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /switch to dark theme/i })).toBeInTheDocument()
  })
})
