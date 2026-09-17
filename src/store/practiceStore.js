import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePracticeStore = create(
  persist(
    (set, get) => ({
      // Current mode: 'multiple-choice', 'match-pairs', 'fill-blanks'
      currentMode: 'multiple-choice',
      
      // Translation direction: language-specific (e.g., 'hu-to-en', 'en-to-hu', 'hu-to-de', 'de-to-hu')
      direction: 'hu-to-en',
      
      // Word pool filter: 'all', 'learned', 'mistakes'
      wordPoolFilter: 'all',
      
      // Level filter: 'all', 'B1', 'B2', 'C1'
      levelFilter: 'all',
      
      // Per-language statistics storage
      _statsPerLanguage: {
        en: { globalCorrectCount: 0, globalIncorrectCount: 0 },
        de: { globalCorrectCount: 0, globalIncorrectCount: 0 },
      },
      _currentLanguage: 'en',
      
      // Global statistics (for current language)
      globalCorrectCount: 0,
      globalIncorrectCount: 0,
      
      // Session statistics (reset when changing modes)
      correctCount: 0,
      incorrectCount: 0,
      
      // Current question state (varies by mode)
      currentQuestion: null,
      
      // Settings for each mode
      settings: {
        multipleChoice: {
          optionCount: 4  // 4, 6, or 8 options
        },
        matchPairs: {
          pairCount: 4    // 4-8 pairs
        },
        fillBlanks: {
          blankCount: 2,       // 1-3 blanks per sentence
          distractorCount: 3   // 2-6 distractors
        }
      },
      
      // Switch language: save current stats, load new language's stats
      setLanguage: (lang) => set((state) => {
        const curLang = state._currentLanguage || 'en'
        const stats = { ...state._statsPerLanguage }
        // Save current
        stats[curLang] = {
          globalCorrectCount: state.globalCorrectCount,
          globalIncorrectCount: state.globalIncorrectCount,
        }
        // Load new
        const newStats = stats[lang] || { globalCorrectCount: 0, globalIncorrectCount: 0 }
        if (!stats[lang]) stats[lang] = newStats
        return {
          _currentLanguage: lang,
          _statsPerLanguage: stats,
          globalCorrectCount: newStats.globalCorrectCount,
          globalIncorrectCount: newStats.globalIncorrectCount,
          // Reset session on language switch
          correctCount: 0,
          incorrectCount: 0,
          currentQuestion: null,
        }
      }),
      
      // Actions
      setMode: (mode) => set({ currentMode: mode }),
      
      setDirection: (direction) => set({ direction }),
      
      setWordPoolFilter: (filter) => set({ wordPoolFilter: filter }),
      
      setLevelFilter: (level) => set({ levelFilter: level }),
      
      setCurrentQuestion: (question) => set({ currentQuestion: question }),
      
      incrementCorrect: () => set((state) => ({ 
        correctCount: state.correctCount + 1,
        globalCorrectCount: state.globalCorrectCount + 1
      })),
      
      incrementIncorrect: () => set((state) => ({ 
        incorrectCount: state.incorrectCount + 1,
        globalIncorrectCount: state.globalIncorrectCount + 1
      })),
      
      updateSettings: (mode, settings) => set((state) => ({
        settings: {
          ...state.settings,
          [mode]: { ...state.settings[mode], ...settings }
        }
      })),
      
      getAccuracy: () => {
        const { correctCount, incorrectCount } = get()
        const total = correctCount + incorrectCount
        return total === 0 ? 0 : Math.round((correctCount / total) * 100)
      },
      
      resetSession: () => set({
        correctCount: 0,
        incorrectCount: 0,
        currentQuestion: null
      }),
      
      resetAll: () => set((state) => {
        const lang = state._currentLanguage || 'en'
        const stats = { ...state._statsPerLanguage }
        stats[lang] = { globalCorrectCount: 0, globalIncorrectCount: 0 }
        return {
          currentMode: 'multiple-choice',
          direction: 'hu-to-en',
          wordPoolFilter: 'all',
          correctCount: 0,
          incorrectCount: 0,
          globalCorrectCount: 0,
          globalIncorrectCount: 0,
          currentQuestion: null,
          _statsPerLanguage: stats,
          settings: {
            multipleChoice: {
              optionCount: 4
            },
            matchPairs: {
              pairCount: 6
            },
            fillBlanks: {
              blankCount: 2,
              distractorCount: 3
            }
          }
        }
      }),

      // Import stats for a given language (overwrites per-language stats and updates current stats if language matches)
      importStatsForLanguage: (lang, payload) => set((state) => {
        const stats = { ...(state._statsPerLanguage || {}) }
        stats[lang] = {
          globalCorrectCount: typeof payload?.globalCorrectCount === 'number' ? payload.globalCorrectCount : 0,
          globalIncorrectCount: typeof payload?.globalIncorrectCount === 'number' ? payload.globalIncorrectCount : 0,
        }
        const updates = { _statsPerLanguage: stats }
        if ((state._currentLanguage || 'en') === lang) {
          updates.globalCorrectCount = stats[lang].globalCorrectCount
          updates.globalIncorrectCount = stats[lang].globalIncorrectCount
        }
        return updates
      })
    }),
    {
      name: 'practice-store',
      // Migration: wrap old flat stats into per-language format
      merge: (persistedState, currentState) => {
        if (persistedState && !persistedState._statsPerLanguage) {
          // Old format: migrate globalCorrect/Incorrect as English stats
          const enStats = {
            globalCorrectCount: persistedState.globalCorrectCount || 0,
            globalIncorrectCount: persistedState.globalIncorrectCount || 0,
          }
          return {
            ...currentState,
            ...persistedState,
            _currentLanguage: 'en',
            _statsPerLanguage: {
              en: enStats,
              de: { globalCorrectCount: 0, globalIncorrectCount: 0 },
            },
          }
        }
        return { ...currentState, ...persistedState }
      }
    }
  )
)
