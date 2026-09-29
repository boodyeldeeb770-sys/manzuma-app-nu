'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LogOut, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Logo, SettingsModal, ThemeToggle } from './controls'
import { NotificationsMenu } from './notifications-menu'
import { usePreferences } from './providers/preferences-provider'
import { Avatar, Btn } from './ui-kit'
import type { DictKey } from '@/lib/i18n'
import type { Audience } from '@/lib/types'
import { cn } from '@/lib/utils'

export interface NavItem {
  href: string
  label: DictKey
  icon: LucideIcon
  badge?: number
}

export function AppShell({
  nav,
  title,
  userName,
  userRole,
  topSlot,
  audience,
  settingsExtra,
  children,
}: {
  nav: NavItem[]
  title: DictKey
  userName: string
  userRole: string
  topSlot?: React.ReactNode
  audience: Audience
  settingsExtra?: React.ReactNode
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { t } = usePreferences()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const root = nav[0].href
  const isActive = (href: string) => (href === root ? pathname === href : pathname.startsWith(href))

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e border-border bg-card/60 p-4 backdrop-blur-xl lg:flex">
        <Logo className="px-2 py-1" />
        <div className="mt-2 px-2 text-xs text-muted-foreground">{t(title)}</div>
        <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="التنقل الرئيسي">
          {nav.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                  active
                    ? 'bg-brand/12 text-brand ring-1 ring-brand/25'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <item.icon className="size-4.5" />
                <span className="flex-1">{t(item.label)}</span>
                {!!item.badge && (
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-bold text-gold">{item.badge}</span>
                )}
              </Link>
            )
          })}
        </nav>
        <div className="glass flex items-center gap-3 rounded-2xl p-3">
          <Avatar name={userName} className="size-9" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{userName}</div>
            <div className="truncate text-xs text-muted-foreground">{userRole}</div>
          </div>
          <Link href="/" aria-label={t('logout')} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-danger">
            <LogOut className="size-4" />
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 md:px-6">
            <Logo className="lg:hidden" />
            <div className="hidden text-sm text-muted-foreground lg:block">
              {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="ms-auto flex items-center gap-2">
              <NotificationsMenu audience={audience} />
              <ThemeToggle />
              <Btn variant="outline" size="icon" onClick={() => setSettingsOpen(true)} aria-label={t('settings')}>
                <Settings />
              </Btn>
            </div>
          </div>
          {topSlot}
        </header>

        <main className="flex-1 px-4 pt-6 pb-28 md:px-6 lg:pb-10">{children}</main>
      </div>

      <nav
        aria-label="التنقل السفلي"
        className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-1 overflow-x-auto rounded-2xl border border-border bg-popover/90 p-1.5 shadow-2xl backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
      >
        {nav.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-w-14 flex-1 flex-col items-center gap-0.5 rounded-xl px-1.5 py-1.5 text-[10px] font-semibold transition',
                active ? 'bg-brand/12 text-brand' : 'text-muted-foreground',
              )}
            >
              <item.icon className="size-5" />
              <span className="truncate">{t(item.label)}</span>
              {!!item.badge && <span className="absolute top-1 end-2 size-2 rounded-full bg-gold" />}
            </Link>
          )
        })}
      </nav>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} extra={settingsExtra} />
    </div>
  )
}
