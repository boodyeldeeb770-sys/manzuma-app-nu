'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlarmClock, ArrowLeft, Banknote, ClipboardList, Command, Megaphone, QrCode, Search, Timer, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { AreaChart, BarsMini, KpiCard, RadialRing } from '@/components/charts'
import { useStore } from '@/components/providers/store-provider'
import { useAnnouncementSender } from '@/components/announcements'
import { Avatar, Btn, btnVariants, GlassCard, Modal, PageHeader, Pill } from '@/components/ui-kit'
import { PEAK_HOURS, WEEK_DAYS, WEEKLY_ATTENDANCE, WEEKLY_LATE, WEEKLY_OVERTIME } from '@/lib/mock-data'
import { STATUS_META } from '@/lib/status'

export default function EmployerDashboard() {
  const router = useRouter()
  const { state } = useStore()
  const [query, setQuery] = useState('')
  const [announce, setAnnounce] = useState(false)

  const scheduled = state.employees.filter((e) => e.status !== 'leave' && e.status !== 'off')
  const onTime = scheduled.filter((e) => e.status === 'present').length
  const active = state.employees.filter((e) => e.status === 'present' || e.status === 'late').length
  const attended = scheduled.filter((e) => e.status === 'present' || e.status === 'late').length
  const pending = state.requests.filter((r) => r.status === 'pending')
  const rate = scheduled.length ? +((attended / scheduled.length) * 100).toFixed(1) : 0

  const commands = useMemo(
    () => [
      { label: 'فتح شاشة الكشك', icon: QrCode, run: () => router.push('/employer/kiosk') },
      { label: 'مراجعة الطلبات المعلقة', icon: ClipboardList, run: () => router.push('/employer/requests') },
      { label: 'كشف رواتب الشهر', icon: Banknote, run: () => router.push('/employer/payroll') },
      { label: 'البحث عن مرشحين قريبين', icon: UserPlus, run: () => router.push('/employer/recruitment') },
      { label: 'إرسال إعلان للفريق', icon: Megaphone, run: () => setAnnounce(true) },
      ...state.employees.map((e) => ({ label: `ملف ${e.name}`, icon: Users, run: () => router.push(`/employer/staff?focus=${e.id}`) })),
    ],
    [router, state.employees],
  )
  const filtered = query ? commands.filter((c) => c.label.includes(query)) : commands.slice(0, 5)

  return (
    <>
      <PageHeader
        title={`صباح الخير، ${state.managerName.replace('م. ', '')}`}
        description={`${state.business.name} — نظرة شاملة على أداء فريقك اليوم`}
        actions={
          <>
            <Btn variant="outline" onClick={() => setAnnounce(true)}>
              <Megaphone />
              إعلان للفريق
            </Btn>
            <Link href="/employer/kiosk" className={btnVariants()}>
              <QrCode />
              فتح الكشك
            </Link>
          </>
        }
      />

      <GlassCard className="relative mb-6 p-2">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            filtered[0]?.run()
          }}
          className="flex items-center gap-2 px-2"
        >
          <Command className="size-4 text-brand" />
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="شريط الأوامر السريع — ابحث عن موظف أو إجراء..."
            aria-label="شريط الأوامر"
            className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>
        <div className="flex gap-2 overflow-x-auto px-2 pt-1 pb-1">
          {filtered.slice(0, 6).map((c) => (
            <button key={c.label} onClick={c.run} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium hover:border-brand/40 hover:text-brand">
              <c.icon className="size-3.5" />
              {c.label}
            </button>
          ))}
          {!filtered.length && <span className="px-2 py-1.5 text-xs text-muted-foreground">لا توجد نتائج</span>}
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="flex flex-col items-center justify-center gap-4 p-6 lg:row-span-2">
          <div className="flex w-full items-center justify-between">
            <h2 className="font-bold">الالتزام اليوم</h2>
            <Pill tone="brand">
              <span className="size-1.5 animate-pulse rounded-full bg-brand" />
              مباشر
            </Pill>
          </div>
          <RadialRing value={rate} size={220} label="ملتزمون اليوم" sublabel={`${attended} من ${scheduled.length} — ${onTime} في الموعد`} />
          <div className="grid w-full grid-cols-3 gap-2 text-center">
            {(['present', 'late', 'absent'] as const).map((s) => (
              <div key={s} className="rounded-xl border border-border bg-secondary p-2">
                <div className="text-lg font-extrabold tabular-nums">{state.employees.filter((e) => e.status === s).length}</div>
                <div className="text-xs text-muted-foreground">{STATUS_META[s].label}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          <KpiCard label="الموظفون النشطون الآن" value={`${active}/${state.employees.length}`} trend={4.2} data={[5, 6, 5, 7, 6, 7, active]} icon={Users} color="var(--brand)" />
          <KpiCard label="طلبات بانتظار القرار" value={String(pending.length)} trend={-12} data={[8, 7, 9, 6, 7, 5, pending.length]} icon={ClipboardList} color="var(--gold)" invertTrend />
          <KpiCard label="دقائق التأخير اليوم" value="49 د" trend={-8.5} data={WEEKLY_LATE} icon={AlarmClock} color="var(--danger)" invertTrend />
          <KpiCard label="ساعات إضافية هذا الأسبوع" value="71 س" trend={11.3} data={WEEKLY_OVERTIME} icon={Timer} color="var(--info)" />
        </div>

        <GlassCard className="p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">منحنى الحضور والتأخير الأسبوعي</h2>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-brand" />الحضور %</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-gold" />الإضافي (س)</span>
            </div>
          </div>
          <AreaChart
            labels={WEEK_DAYS}
            min={0}
            max={100}
            series={[
              { name: 'الحضور', data: WEEKLY_ATTENDANCE, color: 'var(--brand)', suffix: '%' },
              { name: 'الإضافي', data: WEEKLY_OVERTIME.map((v) => v * 3), color: 'var(--gold)', suffix: '' },
            ]}
          />
        </GlassCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-5">
          <h2 className="mb-1 font-bold">ذروة تسجيل الحضور</h2>
          <p className="mb-4 text-xs text-muted-foreground">عدد الحركات لكل نصف ساعة</p>
          <BarsMini data={PEAK_HOURS.map((p) => p.v)} labels={PEAK_HOURS.map((p) => p.h)} />
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">الطلبات العاجلة</h2>
            <Link href="/employer/requests" className="flex items-center gap-1 text-xs font-semibold text-info hover:underline">
              عرض الكل <ArrowLeft className="size-3" />
            </Link>
          </div>
          <ul className="flex flex-col divide-y divide-border">
            {pending.slice(0, 4).map((r) => {
              const emp = state.employees.find((e) => e.id === r.employeeId)!
              return (
                <li key={r.id} className="flex items-center gap-3 py-3">
                  <Avatar name={emp.name} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{emp.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{r.details}</div>
                  </div>
                  {r.leaveKind === 'emergency' && <Pill tone="danger">طارئ</Pill>}
                  <Link href={`/employer/requests?open=${r.id}`} className={btnVariants({ size: 'sm', variant: 'outline' })}>
                    مراجعة
                  </Link>
                </li>
              )
            })}
            {!pending.length && <li className="py-6 text-center text-sm text-muted-foreground">لا توجد طلبات معلقة — عمل رائع!</li>}
          </ul>
        </GlassCard>
      </div>

      <AnnouncementModal open={announce} onClose={() => setAnnounce(false)} count={state.employees.length} />
    </>
  )
}

function AnnouncementModal({ open, onClose, count }: { open: boolean; onClose: () => void; count: number }) {
  const router = useRouter()
  const { sendAnnouncement } = useAnnouncementSender()
  return (
    <Modal open={open} onClose={onClose} title="إرسال إعلان للفريق" description={`سيصل الإشعار إلى ${count} موظفين عبر التطبيق`}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          const data = new FormData(e.currentTarget)
          const text = String(data.get('text') ?? '').trim()
          if (!text) return
          sendAnnouncement(text, data.get('important') === 'on')
          toast.success('تم إرسال الإعلان للفريق', {
            action: { label: 'متابعة التفاعل', onClick: () => router.push('/employer/announcements') },
          })
          onClose()
        }}
      >
        <textarea name="text" required rows={4} className="field" placeholder="مثال: اجتماع الفريق غداً الساعة 9 صباحاً في الفرع الرئيسي" aria-label="نص الإعلان" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="important" className="size-4 accent-[var(--brand)]" />
          إعلان مهم (يتطلب تأكيد اطلاع من الموظف)
        </label>
        <Btn type="submit" size="lg">
          <Megaphone />
          إرسال
        </Btn>
      </form>
    </Modal>
  )
}
