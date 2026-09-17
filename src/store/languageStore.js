import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useLanguageStore = create(
  persist(
    (set) => ({
      // Target language: 'en' (English) or 'de' (German)
      language: 'en',

      setLanguage: (language) => set({ language }),
    }),
    { name: 'language-store' }
  )
)
