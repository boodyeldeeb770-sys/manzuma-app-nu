'use client'

import { Banknote, ClipboardList, LayoutDashboard, MapPinned, QrCode, Settings, Users } from 'lucide-react'
import { AppShell, type NavItem } from '@/components/app-shell'
import { useStore } from '@/components/providers/store-provider'

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const { state } = useStore()
  const pending = state.requests.filter((r) => r.status === 'pending').length
  const nav: NavItem[] = [
    { href: '/employer', label: 'navDashboard', icon: LayoutDashboard },
    { href: '/employer/kiosk', label: 'navKiosk', icon: QrCode },
    { href: '/employer/staff', label: 'navStaff', icon: Users },
    { href: '/employer/requests', label: 'navRequests', icon: ClipboardList, badge: pending },
    { href: '/employer/payroll', label: 'navPayroll', icon: Banknote },
    { href: '/employer/recruitment', label: 'navRecruit', icon: MapPinned },
    { href: '/employer/settings', label: 'navSettings', icon: Settings },
  ]
  return (
    <AppShell nav={nav} title="employerApp" userName={state.managerName} userRole={state.business.name}>
      {children}
    </AppShell>
  )
}
