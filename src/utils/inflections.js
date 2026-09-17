import { useState, useEffect } from 'react'

// Hook to load precomputed inflections for German and English (if available in public/data)
// Returns null if not available or for unsupported languages.
const cache = {}

export default function useInflections(language) {
  const [data, setData] = useState(cache[language] || null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (language !== 'de' && language !== 'en') {
        if (mounted) setData(null)
        return
      }

      if (cache[language]) {
        if (mounted) setData(cache[language])
        return
      }

      const base = import.meta.env.BASE_URL || '/'
      const stripLeadingSlash = (p) => p.replace(/^\/+/, '')
      
      // Build candidate URLs based on language
      const langCode = language === 'de' ? 'de' : 'en'
      const candidates = [
        `${base}${stripLeadingSlash(`data/vocabulary-${langCode}-inflections.json`)}`,
        `${base}${stripLeadingSlash(`vocabulary-${langCode}-inflections.json`)}`,
        `${base}${stripLeadingSlash(`vocab_${langCode}_inflections.json`)}`,
        `${base}${stripLeadingSlash(`data/vocab_${langCode}_inflections.json`)}`
      ]

      let loaded = null
      for (const url of candidates) {
        try {
          const res = await fetch(url)
          if (res.ok) {
            loaded = await res.json()
            break
          }
        } catch {
          // ignore and try next
        }
      }

      cache[language] = loaded
      if (mounted) setData(loaded)
    }

    load()
    return () => { mounted = false }
  }, [language])

  return data
}
