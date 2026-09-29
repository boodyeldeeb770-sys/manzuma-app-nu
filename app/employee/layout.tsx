'use client'

import { createContext, useContext, useState } from 'react'
import { CalendarClock, CloudOff, FileText, IdCard, MapPinned, Receipt } from 'lucide-react'
import { AppShell, type NavItem } from '@/components/app-shell'
import { EmployeeAccountSettings } from '@/components/employee-account-settings'
import { useStore } from '@/components/providers/store-provider'
import { cn } from '@/lib/utils'

interface ConnCtx {
  online: boolean
  setOnline: (v: boolean) => void
}

const ConnectivityContext = createContext<ConnCtx | null>(null)

export function useConnectivity() {
  const ctx = useContext(ConnectivityContext)
  if (!ctx) throw new Error('useConnectivity must be used within EmployeeLayout')
  return ctx
}

function OfflineBar({ online, pending }: { online: boolean; pending: number }) {
  const synced = online && pending === 0
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center gap-2 border-t border-border px-4 py-2 text-xs font-semibold md:px-6',
        synced ? 'bg-brand/10 text-brand' : 'bg-gold/10 text-gold',
      )}
    >
      {synced ? (
        <>
          <span className="size-2 shrink-0 animate-pulse rounded-full bg-brand" />
          جميع البيانات متزامنة مع الخادم
        </>
      ) : (
        <>
          {online ? (
            <span className="size-2 shrink-0 animate-pulse rounded-full bg-gold" />
          ) : (
            <CloudOff className="size-3.5 shrink-0" />
          )}
          <span>
            {online ? 'جارٍ المزامنة — ' : 'وضع غير متصل: '}
            <span className="tabular-nums">{pending}</span> حركة محفوظة محلياً بانتظار الاتصال
          </span>
        </>
      )}
    </div>
  )
}

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const { state } = useStore()
  const [online, setOnline] = useState(true)
  const me = state.employees.find((e) => e.id === state.me.employeeId) ?? state.employees[0]
  const pending = state.me.pendingPunches.length
  const newOffers = state.offers.filter((o) => o.status === 'new').length

  const nav: NavItem[] = [
    { href: '/employee', label: 'navShift', icon: CalendarClock },
    { href: '/employee/requests', label: 'navMyRequests', icon: FileText },
    { href: '/employee/payslip', label: 'navPayslip', icon: Receipt },
    { href: '/employee/cv', label: 'navCV', icon: IdCard },
    { href: '/employee/jobs', label: 'navJobs', icon: MapPinned, badge: newOffers },
  ]

  return (
    <ConnectivityContext.Provider value={{ online, setOnline }}>
      <AppShell
        nav={nav}
        title="employeeApp"
        userName={me.name}
        userRole={me.title}
        topSlot={<OfflineBar online={online} pending={pending} />}
        audience="employee"
        settingsExtra={<EmployeeAccountSettings />}
      >
        {children}
      </AppShell>
    </ConnectivityContext.Provider>
  )
}
