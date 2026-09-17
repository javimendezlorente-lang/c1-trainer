import React from 'react'
import useTextToSpeech from '../hooks/useTextToSpeech'
import { useLanguageStore } from '../store/languageStore'
import { getTTSLang } from '../utils/vocabularyUtils'
import './SpeakerIcon.css'

export default function SpeakerIcon({ text = '', size = 16, className = '', lang, noRole = false }) {
  const language = useLanguageStore((s) => s.language)
  const ttsLang = lang || getTTSLang(language)
  const { speak, isSpeaking } = useTextToSpeech()

  const handleClick = (e) => {
    // Prevent click-through to parent controls/cards
    e.stopPropagation()
    if (e.preventDefault) e.preventDefault()
    // Speak (ignore promise)
    speak(text, { lang: ttsLang }).catch(() => {})
  }

  const svg = (
    <svg
      className="speaker-svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M3 10v4h4l5 5V5L7 10H3z" fill="currentColor" />
      <path d="M16 8a4 4 0 010 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 5.5a8 8 0 010 13" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  )

  if (noRole) {
    return (
      <span
        className={`speaker-icon ${isSpeaking ? 'speaking' : ''} ${className}`.trim()}
        onClick={handleClick}
        title={`Play pronunciation for ${text}`}
        aria-hidden="true"
      >
        {svg}
      </span>
    )
  }

  return (
    <span
      role="button"
      tabIndex={0}
      className={`speaker-icon ${isSpeaking ? 'speaking' : ''} ${className}`.trim()}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick(e)
        }
      }}
      aria-label={`Play pronunciation for ${text}`}
      title={`Play pronunciation for ${text}`}
    >
      {svg}
    </span>
  )
}

