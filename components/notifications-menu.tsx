'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, BellOff, CheckCheck } from 'lucide-react'
import { useStore } from './providers/store-provider'
import { Btn } from './ui-kit'
import { formatDateTime } from '@/lib/status'
import type { Audience } from '@/lib/types'
import { cn } from '@/lib/utils'

export function NotificationsMenu({ audience }: { audience: Audience }) {
  const { state, update } = useStore()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const items = (state.notifications ?? []).filter((n) => n.audience === audience)
  const unread = items.filter((n) => !n.read).length

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const markAll = () =>
    update((s) => ({ ...s, notifications: s.notifications.map((n) => (n.audience === audience ? { ...n, read: true } : n)) }))

  const openItem = (id: string, href?: string) => {
    update((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }))
    setOpen(false)
    if (href) router.push(href)
  }

  return (
    <div ref={rootRef} className="relative">
      <Btn
        variant="outline"
        size="icon"
        aria-label={unread ? `الإشعارات — ${unread} غير مقروءة` : 'الإشعارات'}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell />
        {unread > 0 && (
          <span className="absolute -top-1 -end-1 flex min-w-4.5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold leading-4.5 text-black ring-2 ring-background">
            {unread}
          </span>
        )}
      </Btn>

      {open && (
        <div
          role="dialog"
          aria-label="قائمة الإشعارات"
          className="absolute top-12 end-0 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="font-bold">
              الإشعارات
              {unread > 0 && <span className="ms-2 text-xs font-medium text-muted-foreground">{unread} جديدة</span>}
            </div>
            {unread > 0 && (
              <button onClick={markAll} className="flex items-center gap-1 text-xs font-semibold text-info hover:underline">
                <CheckCheck className="size-3.5" />
                تحديد الكل كمقروء
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {items.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => openItem(n.id, n.href)}
                  className={cn('flex w-full items-start gap-3 border-b border-border px-4 py-3 text-start transition last:border-0 hover:bg-accent', !n.read && 'bg-brand/6')}
                >
                  <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-gold')} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{n.title}</span>
                    <span className="block text-xs leading-relaxed text-muted-foreground">{n.body}</span>
                    <span className="mt-1 block text-[11px] text-muted-foreground/80">{formatDateTime(n.at)}</span>
                  </span>
                  {!n.read && <span className="sr-only">غير مقروء</span>}
                </button>
              </li>
            ))}
            {!items.length && (
              <li className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
                <BellOff className="size-6" />
                لا توجد إشعارات حالياً
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
