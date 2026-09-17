import { useLanguageStore } from '../store/languageStore'
import { getTranslations, translate } from '../i18n'

export default function useTranslation() {
  const language = useLanguageStore((s) => s.language)
  const translations = getTranslations(language)

  const t = (key, params) => translate(translations, key, params)

  return { t, language }
}
