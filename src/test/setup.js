import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Ensure React's act environment flag is set so testing-library can avoid spurious act warnings
// See: https://reactjs.org/docs/testing-recipes.html#act
globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Suppress known React Router future flag warnings and route mismatch logs in tests
const _origWarn = console.warn.bind(console)
const _origError = console.error.bind(console)
console.warn = (...args) => {
  const msg = args && args[0] ? String(args[0]) : ''
  if (msg.includes('React Router Future Flag Warning') || msg.includes('No routes matched location') || msg.includes('When testing, code that causes React state updates should be wrapped into act')) return
  _origWarn(...args)
}
console.error = (...args) => {
  const msg = args && args[0] ? String(args[0]) : ''
  if (msg.includes('React Router Future Flag Warning') || msg.includes('No routes matched location') || msg.includes('When testing, code that causes React state updates should be wrapped into act')) return
  _origError(...args)
}

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
