import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useVocabularyStore = create(
  persist(
    (set, get) => ({
      // Per-language data storage
      _currentLanguage: 'en',
      _perLanguage: {
        en: { learnedWords: [], mistakeWords: [] },
        de: { learnedWords: [], mistakeWords: [] },
      },

      // Computed Sets for current language
      learnedWords: new Set(),
      mistakeWords: new Set(),
      currentFilter: 'all',

      // Sync Sets from persisted arrays for current language
      _syncSets: () => {
        const state = get()
        const lang = state._currentLanguage || 'en'
        const perLang = state._perLanguage || {}
        const langData = perLang[lang] || {}
        set({
          learnedWords: new Set(langData.learnedWords || []),
          mistakeWords: new Set(langData.mistakeWords || []),
        })
      },

      setLanguage: (lang) => {
        const state = get()
        // Save current Sets to persisted arrays before switching
        const curLang = state._currentLanguage || 'en'
        const perLang = { ...state._perLanguage }
        perLang[curLang] = {
          learnedWords: Array.from(state.learnedWords),
          mistakeWords: Array.from(state.mistakeWords),
        }
        // Load new language's data
        const newData = perLang[lang] || { learnedWords: [], mistakeWords: [] }
        if (!perLang[lang]) perLang[lang] = newData
        set({
          _currentLanguage: lang,
          _perLanguage: perLang,
          learnedWords: new Set(newData.learnedWords || []),
          mistakeWords: new Set(newData.mistakeWords || []),
        })
      },
      
      markAsLearned: (wordId) => set((state) => {
        const newLearned = new Set(state.learnedWords)
        newLearned.add(wordId)
        return { learnedWords: newLearned }
      }),
      
      unmarkAsLearned: (wordId) => set((state) => {
        const newLearned = new Set(state.learnedWords)
        newLearned.delete(wordId)
        return { learnedWords: newLearned }
      }),
      
      isLearned: (wordId) => {
        return get().learnedWords.has(wordId)
      },
      
      markAsMistake: (wordId) => set((state) => {
        const newMistakes = new Set(state.mistakeWords)
        newMistakes.add(wordId)
        return { mistakeWords: newMistakes }
      }),
      
      clearMistake: (wordId) => set((state) => {
        const newMistakes = new Set(state.mistakeWords)
        newMistakes.delete(wordId)
        return { mistakeWords: newMistakes }
      }),
      
      isMistake: (wordId) => {
        return get().mistakeWords.has(wordId)
      },
      
      clearAllMistakes: () => set({ mistakeWords: new Set() }),
      
      setFilter: (filter) => set({ currentFilter: filter }),
      
      getLearnedCount: () => get().learnedWords.size,
      
      getMistakeCount: () => get().mistakeWords.size,
      
      resetProgress: () => set({ 
        learnedWords: new Set(),
        mistakeWords: new Set()
      }),

      // Import progress for a given language (overwrites per-language arrays and updates current sets if language matches)
      importProgress: (lang, payload) => set((state) => {
        const perLang = { ...(state._perLanguage || {}) }
        perLang[lang] = {
          learnedWords: Array.isArray(payload?.learnedWords) ? payload.learnedWords : [],
          mistakeWords: Array.isArray(payload?.mistakeWords) ? payload.mistakeWords : [],
        }
        const updates = { _perLanguage: perLang }
        if ((state._currentLanguage || 'en') === lang) {
          updates.learnedWords = new Set(perLang[lang].learnedWords)
          updates.mistakeWords = new Set(perLang[lang].mistakeWords)
        }
        return updates
      })
    }),
    {
      name: 'c1-examiner-vocabulary',
      // Custom serialization: save per-language data
      partialize: (state) => ({
        _currentLanguage: state._currentLanguage,
        _perLanguage: {
          ...state._perLanguage,
          // Always save current language's live Sets
          [state._currentLanguage || 'en']: {
            learnedWords: Array.from(state.learnedWords),
            mistakeWords: Array.from(state.mistakeWords),
          }
        },
        currentFilter: state.currentFilter
      }),
      // Custom deserialization: migrate old format and load Sets
      merge: (persistedState, currentState) => {
        // Migration: if old format (flat arrays), wrap as English
        if (persistedState && Array.isArray(persistedState.learnedWords)) {
          const perLang = {
            en: {
              learnedWords: persistedState.learnedWords || [],
              mistakeWords: persistedState.mistakeWords || [],
            },
            de: { learnedWords: [], mistakeWords: [] },
          }
          const lang = persistedState._currentLanguage || 'en'
          const langData = perLang[lang] || perLang.en
          return {
            ...currentState,
            _currentLanguage: lang,
            _perLanguage: perLang,
            learnedWords: new Set(langData.learnedWords || []),
            mistakeWords: new Set(langData.mistakeWords || []),
            currentFilter: persistedState.currentFilter || 'all',
          }
        }
        // New format: load from per-language storage
        const lang = persistedState?._currentLanguage || 'en'
        const perLang = persistedState?._perLanguage || {
          en: { learnedWords: [], mistakeWords: [] },
          de: { learnedWords: [], mistakeWords: [] },
        }
        const langData = perLang[lang] || { learnedWords: [], mistakeWords: [] }
        return {
          ...currentState,
          ...persistedState,
          _currentLanguage: lang,
          _perLanguage: perLang,
          learnedWords: new Set(langData.learnedWords || []),
          mistakeWords: new Set(langData.mistakeWords || []),
        }
      }
    }
  )
)
