export function normalizeText(text = '') {
  return String(text)
    .replace(/[.,;:!?()"'\u201c\u201d\u00ab\u00bb]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Helper for Multiple Choice direction-specific display
// Show TTS for the target language side (English or German), not Hungarian
export function shouldShowTTSForMultipleChoice({ direction = 'en_to_hu', side = 'main' } = {}) {
  // Accept both 'en-to-hu' and 'en_to_hu' (and de-to-hu / de_to_hu)
  const norm = String(direction).replace(/-/g, '_')
  // "main" speaker shows when prompt is in the target language (target-to-hu)
  if (side === 'main') return norm === 'en_to_hu' || norm === 'de_to_hu'
  // "option" speaker shows when options are in the target language (hu-to-target)
  if (side === 'option') return norm === 'hu_to_en' || norm === 'hu_to_de'
  return false
}
