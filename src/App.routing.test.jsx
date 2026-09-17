import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App Routing Regression Tests', () => {
  it('handles root path without trailing slash', () => {
    // Regression test for bug #1: Dashboard URL missing final slash
    window.history.pushState({}, 'Test', '/examiner')
    
    render(
      <BrowserRouter basename="/examiner">
        <App />
      </BrowserRouter>
    )
    
    // Should render Dashboard without redirect error
    expect(screen.getByText('C1 Examiner')).toBeInTheDocument()
  })

  it('handles root path with trailing slash', () => {
    window.history.pushState({}, 'Test', '/examiner/')
    
    render(
      <BrowserRouter basename="/examiner">
        <App />
      </BrowserRouter>
    )
    
    // Should render Dashboard
    expect(screen.getByText('C1 Examiner')).toBeInTheDocument()
  })

  it('has all navigation links', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Vocabulary')).toBeInTheDocument()
    expect(screen.getByText('Practice')).toBeInTheDocument()
  })
})
