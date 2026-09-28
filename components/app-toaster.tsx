'use client'

import { Toaster } from 'sonner'
import { usePreferences } from './providers/preferences-provider'

export function AppToaster() {
  const { theme, lang } = usePreferences()
  return (
    <Toaster
      theme={theme}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      position="top-center"
      richColors
      toastOptions={{ style: { fontFamily: 'var(--font-plex)' } }}
    />
  )
}
