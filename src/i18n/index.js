import en from './en'
import de from './de'

const locales = { en, de }

export function getTranslations(language) {
  return locales[language] || locales.en
}

// Template interpolation: t('cardOf', { current: 1, total: 10 })
export function translate(translations, key, params) {
  let text = translations[key] || key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v)
    }
  }
  return text
}
