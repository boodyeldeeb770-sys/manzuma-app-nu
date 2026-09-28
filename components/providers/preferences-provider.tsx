'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { dictionary, type DictKey } from '@/lib/i18n'

type Theme = 'dark' | 'light'
type Lang = 'ar' | 'en'

interface PreferencesValue {
  theme: Theme
  lang: Lang
  toggleTheme: () => void
  setTheme: (t: Theme) => void
  setLang: (l: Lang) => void
  t: (k: DictKey) => string
}

const PreferencesContext = createContext<PreferencesValue | null>(null)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [lang, setLangState] = useState<Lang>('ar')

  useEffect(() => {
    const storedTheme = localStorage.getItem('manzuma-theme') as Theme | null
    const storedLang = localStorage.getItem('manzuma-lang') as Lang | null
    if (storedTheme) setThemeState(storedTheme)
    if (storedLang) setLangState(storedLang)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem('manzuma-theme', t)
    document.documentElement.classList.toggle('dark', t === 'dark')
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem('manzuma-lang', l)
    document.documentElement.lang = l
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
  }, [])

  const toggleTheme = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme])

  const t = useCallback((k: DictKey) => dictionary[lang][k] ?? dictionary.ar[k], [lang])

  return (
    <PreferencesContext.Provider value={{ theme, lang, toggleTheme, setTheme, setLang, t }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
