/* global global */
import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import useTextToSpeech from './useTextToSpeech'

function TestHarness({ onReady }) {
  const tts = useTextToSpeech({ langPreference: 'en-GB' })
  React.useEffect(() => { onReady(tts) }, [onReady, tts])
  return null
}

describe('useTextToSpeech hook', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete global.speechSynthesis
    delete global.SpeechSynthesisUtterance
  })

  it('chooses voices and speaks when speechSynthesis is available', async () => {
    const voices = [{ lang: 'en-GB', name: 'v1' }, { lang: 'de-DE', name: 'v2' }]
    // Mock SpeechSynthesisUtterance
    global.SpeechSynthesisUtterance = function (text) {
      this.text = text
      this.voice = null
      this.lang = null
      this.onstart = null
      this.onend = null
      this.onerror = null
    }
    // Mock speechSynthesis
    const speakMock = vi.fn((utter) => {
      // Immediately call start and end handlers
      if (utter.onstart) utter.onstart()
      if (utter.onend) utter.onend()
    })
    const getVoices = vi.fn(() => voices)
    global.speechSynthesis = {
      getVoices,
      speak: speakMock,
      cancel: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      speaking: false
    }

    const ready = vi.fn()
    render(<TestHarness onReady={ready} />)

    await waitFor(() => expect(ready).toHaveBeenCalled())
    const { speak, cancel } = ready.mock.calls[0][0]
    // speak should return a promise
    await expect(speak('hello')).resolves.toBeUndefined()
    expect(getVoices).toHaveBeenCalled()
    // cancel should be callable
    cancel()
  })

  it('rejects speak when TTS not supported', async () => {
    // Ensure no speechSynthesis available
    delete global.speechSynthesis
    delete global.SpeechSynthesisUtterance

    const ready = vi.fn()
    render(<TestHarness onReady={ready} />)
    await waitFor(() => expect(ready).toHaveBeenCalled())
    const { speak } = ready.mock.calls[0][0]
    await expect(speak('hello')).rejects.toThrow('TTS not supported')
  })

  it('speak resolves immediately for empty text', async () => {
    global.SpeechSynthesisUtterance = function (text) { this.text = text }
    global.speechSynthesis = { getVoices: () => [], speak: () => {}, cancel: () => {}, addEventListener: () => {}, removeEventListener: () => {} }
    const ready = vi.fn()
    render(<TestHarness onReady={ready} />)
    await waitFor(() => expect(ready).toHaveBeenCalled())
    const { speak } = ready.mock.calls[0][0]
    await expect(speak('')).resolves.toBeUndefined()
  })

  it('when speaking is true should call cancel before speaking', async () => {
    const voices = [{ lang: 'en-GB', name: 'v1' }]
    global.SpeechSynthesisUtterance = function (text) { this.text = text }
    const cancelMock = vi.fn()
    let speaking = true
    global.speechSynthesis = {
      getVoices: () => voices,
      speak: vi.fn((utter) => { if (utter.onstart) utter.onstart(); if (utter.onend) utter.onend() }),
      cancel: cancelMock,
      addEventListener: () => {},
      removeEventListener: () => {},
      get speaking() { return speaking },
      set speaking(v) { speaking = v }
    }
    const ready = vi.fn()
    render(<TestHarness onReady={ready} />)
    await waitFor(() => expect(ready).toHaveBeenCalled())
    const { speak } = ready.mock.calls[0][0]
    await expect(speak('hello')).resolves.toBeUndefined()
    expect(cancelMock).toHaveBeenCalled()
  })

  it('when speak throws should reject', async () => {
    global.SpeechSynthesisUtterance = function (text) { this.text = text }
    const speakMock = vi.fn(() => { throw new Error('speak error') })
    global.speechSynthesis = { getVoices: () => [], speak: speakMock, cancel: () => {}, addEventListener: () => {}, removeEventListener: () => {} }
    const ready = vi.fn()
    render(<TestHarness onReady={ready} />)
    await waitFor(() => expect(ready).toHaveBeenCalled())
    const { speak } = ready.mock.calls[0][0]
    await expect(speak('hello')).rejects.toThrow('speak error')
  })
})
