'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { LangSwitch, Logo, ThemeToggle } from '../controls'
import { usePreferences } from '../providers/preferences-provider'
import { Btn } from '../ui-kit'

export function LandingHeader({
  onLogin,
  onPolicies,
  onHelp,
}: {
  onLogin: () => void
  onPolicies: () => void
  onHelp: () => void
}) {
  const { t } = usePreferences()
  const [open, setOpen] = useState(false)
  const links = [
    { href: '#features', label: t('navFeatures') },
    { href: '#sectors', label: t('navSectors') },
    { href: '#about', label: t('navAbout') },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-6">
        <Logo />
        <nav className="ms-6 hidden items-center gap-1 md:flex" aria-label="روابط الصفحة">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
              {l.label}
            </a>
          ))}
          <button onClick={onPolicies} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
            {t('navPolicies')}
          </button>
          <button onClick={onHelp} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
            {t('navHelp')}
          </button>
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <LangSwitch className="hidden sm:flex" />
          <ThemeToggle />
          <Btn onClick={onLogin} className="hidden sm:inline-flex">
            {t('login')}
          </Btn>
          <Btn variant="outline" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="القائمة">
            {open ? <X /> : <Menu />}
          </Btn>
        </div>
      </div>
      {open && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent">
                {l.label}
              </a>
            ))}
            <button onClick={() => { setOpen(false); onPolicies() }} className="rounded-lg px-3 py-2.5 text-start text-sm font-medium hover:bg-accent">
              {t('navPolicies')}
            </button>
            <button onClick={() => { setOpen(false); onHelp() }} className="rounded-lg px-3 py-2.5 text-start text-sm font-medium hover:bg-accent">
              {t('navHelp')}
            </button>
            <div className="mt-2 flex items-center gap-2">
              <LangSwitch />
              <Btn onClick={() => { setOpen(false); onLogin() }} className="flex-1">
                {t('login')}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
