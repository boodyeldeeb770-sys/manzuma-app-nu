'use client'

import Link from 'next/link'
import { Moon, RotateCcw, Sun } from 'lucide-react'
import { toast } from 'sonner'
import { usePreferences } from './providers/preferences-provider'
import { useStore } from './providers/store-provider'
import { Btn, Modal } from './ui-kit'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  const { t } = usePreferences()
  return (
    <Link href="/" className={cn('flex items-center gap-2.5', className)}>
      <img src="/icon-512.png" alt="" className="size-9 rounded-xl ring-1 ring-border" />
      <span className="font-heading text-xl font-extrabold tracking-tight">{t('brand')}</span>
    </Link>
  )
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme, t } = usePreferences()
  return (
    <Btn variant="outline" size="icon" onClick={toggleTheme} className={className} aria-label={t('theme')}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Btn>
  )
}

export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang, t } = usePreferences()
  return (
    <div
      role="group"
      aria-label={t('language')}
      className={cn('flex h-10 items-center rounded-xl border border-border bg-secondary p-1 text-xs font-bold', className)}
    >
      {(['en', 'ar'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            'h-full rounded-lg px-2.5 transition',
            lang === l ? 'bg-brand text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {l === 'en' ? 'EN' : 'عربي'}
        </button>
      ))}
    </div>
  )
}

export function SettingsModal({ open, onClose, extra }: { open: boolean; onClose: () => void; extra?: React.ReactNode }) {
  const { t, theme, setTheme } = usePreferences()
  const { reset } = useStore()
  return (
    <Modal open={open} onClose={onClose} title={t('settings')} size="sm">
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-2 text-sm font-semibold">{t('theme')}</div>
          <div className="grid grid-cols-2 gap-2">
            {(['dark', 'light'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setTheme(m)}
                aria-pressed={theme === m}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition',
                  theme === m ? 'border-brand bg-brand/10 text-brand' : 'border-border bg-secondary hover:bg-accent',
                )}
              >
                {m === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />}
                {t(m)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold">{t('language')}</div>
          <LangSwitch className="w-fit" />
        </div>
        {extra}
        <Btn
          variant="danger"
          onClick={() => {
            reset()
            toast.success('تمت إعادة ضبط البيانات التجريبية')
            onClose()
          }}
        >
          <RotateCcw />
          {t('resetDemo')}
        </Btn>
      </div>
    </Modal>
  )
}
