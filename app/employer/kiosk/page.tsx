'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Delete, Maximize2, RefreshCw, ShieldCheck, XCircle } from 'lucide-react'
import { QrImage } from '@/components/qr-image'
import { useStore } from '@/components/providers/store-provider'
import { Avatar, Btn, GlassCard, PageHeader, Pill } from '@/components/ui-kit'
import { cn } from '@/lib/utils'

const PERIOD = 10

function useNow() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 250)
    return () => clearInterval(t)
  }, [])
  return now
}

export default function KioskPage() {
  const { state, update } = useStore()
  const now = useNow()
  const [pin, setPin] = useState('')
  const [result, setResult] = useState<{ ok: boolean; text: string; name?: string } | null>(null)
  const [log, setLog] = useState<{ name: string; at: string; kind: string }[]>([])

  const epoch = now ? Math.floor(now.getTime() / 1000) : 0
  const slot = Math.floor(epoch / PERIOD)
  const remaining = now ? PERIOD - ((now.getTime() / 1000) % PERIOD) : PERIOD
  const token = `MANZUMA|${state.business.name}|${slot.toString(36).toUpperCase()}`

  const r = 158
  const circumference = 2 * Math.PI * r
  const progress = remaining / PERIOD

  useEffect(() => {
    if (!result) return
    const t = setTimeout(() => setResult(null), 2600)
    return () => clearTimeout(t)
  }, [result])

  const submit = (code: string) => {
    const emp = state.employees.find((e) => e.pin === code)
    if (!emp) {
      setResult({ ok: false, text: 'رمز PIN غير صحيح' })
      setPin('')
      return
    }
    const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    const checkingOut = emp.status === 'present' || emp.status === 'late'
    update((s) => ({
      ...s,
      employees: s.employees.map((e) =>
        e.id === emp.id ? (checkingOut ? { ...e, status: 'off' } : { ...e, status: 'present', checkIn: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }) : e,
      ),
    }))
    setLog((l) => [{ name: emp.name, at: time, kind: checkingOut ? 'انصراف' : 'حضور' }, ...l].slice(0, 6))
    setResult({ ok: true, name: emp.name, text: checkingOut ? `تم تسجيل الانصراف ${time}` : `تم تسجيل الحضور ${time}` })
    setPin('')
  }

  const press = (d: string) => {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    if (next.length === 4) setTimeout(() => submit(next), 150)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key)
      if (e.key === 'Backspace') setPin((p) => p.slice(0, -1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <>
      <PageHeader
        title="شاشة الكشك"
        description="ضع هذه الشاشة عند مدخل الفرع — يتجدد رمز QR كل 10 ثوانٍ لمنع المشاركة"
        actions={
          <Btn variant="outline" onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}>
            <Maximize2 />
            ملء الشاشة
          </Btn>
        }
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <GlassCard className="flex flex-col items-center gap-6 p-6 lg:col-span-3">
          <div className="flex w-full items-center justify-between">
            <div>
              <div className="font-heading text-4xl font-extrabold tabular-nums" dir="ltr">
                {now?.toLocaleTimeString('en-GB') ?? '--:--:--'}
              </div>
              <div className="text-sm text-muted-foreground">
                {now?.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>
            <Pill tone="brand">
              <ShieldCheck className="size-3.5" />
              مشفّر ومؤقت
            </Pill>
          </div>

          <div className="relative flex size-[340px] items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 340 340" aria-hidden>
              <defs>
                <linearGradient id="kiosk-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--brand)" />
                  <stop offset="100%" stopColor="var(--info)" />
                </linearGradient>
              </defs>
              <circle cx="170" cy="170" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
              <circle
                cx="170"
                cy="170"
                r={r}
                fill="none"
                stroke={remaining < 3 ? 'var(--gold)' : 'url(#kiosk-ring)'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                style={{ transition: 'stroke-dashoffset 250ms linear', filter: 'drop-shadow(0 0 8px var(--brand))' }}
              />
            </svg>
            <QrImage key={slot} value={token} size={250} label="رمز QR لتسجيل الحضور" className="animate-in fade-in zoom-in-95 duration-300" />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
            <RefreshCw className={cn('size-4', remaining < 1 && 'animate-spin')} />
            يتجدد الرمز خلال <span className="font-bold tabular-nums text-foreground">{Math.ceil(remaining)}</span> ثوانٍ
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col gap-4 p-6 lg:col-span-2">
          <div>
            <h2 className="font-bold">تسجيل بالرمز السري PIN</h2>
            <p className="text-xs text-muted-foreground">للموظفين بدون هاتف — جرّب 1234 أو 2468</p>
          </div>

          <div className="flex justify-center gap-3" dir="ltr" aria-label={`تم إدخال ${pin.length} من 4`}>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn('size-4 rounded-full border-2 transition', i < pin.length ? 'scale-110 border-brand bg-brand' : 'border-border')}
              />
            ))}
          </div>

          <div className="relative">
            <div className="grid grid-cols-3 gap-2" dir="ltr">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <button key={d} onClick={() => press(d)} className="h-16 rounded-2xl border border-border bg-secondary text-2xl font-bold transition hover:border-brand/40 active:scale-95">
                  {d}
                </button>
              ))}
              <button onClick={() => setPin('')} className="h-16 rounded-2xl text-sm font-semibold text-muted-foreground hover:bg-accent">
                مسح
              </button>
              <button onClick={() => press('0')} className="h-16 rounded-2xl border border-border bg-secondary text-2xl font-bold transition hover:border-brand/40 active:scale-95">
                0
              </button>
              <button onClick={() => setPin((p) => p.slice(0, -1))} className="flex h-16 items-center justify-center rounded-2xl text-muted-foreground hover:bg-accent" aria-label="حذف">
                <Delete className="size-6" />
              </button>
            </div>

            {result && (
              <div
                role="status"
                className={cn(
                  'absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border backdrop-blur-xl animate-in fade-in zoom-in-95',
                  result.ok ? 'border-brand/30 bg-brand/15' : 'border-danger/30 bg-danger/15',
                )}
              >
                {result.ok ? <CheckCircle2 className="size-14 text-brand" /> : <XCircle className="size-14 text-danger" />}
                {result.name && <div className="text-xl font-extrabold">{result.name}</div>}
                <div className="text-sm font-semibold">{result.text}</div>
              </div>
            )}
          </div>

          <div className="mt-auto">
            <h3 className="mb-2 text-xs font-semibold text-muted-foreground">آخر الحركات على هذا الكشك</h3>
            <ul className="flex flex-col gap-1.5">
              {log.map((l, i) => (
                <li key={i} className="flex items-center gap-2 rounded-xl bg-secondary px-2.5 py-1.5 text-sm">
                  <Avatar name={l.name} className="size-7 text-[10px]" />
                  <span className="flex-1 font-medium">{l.name}</span>
                  <Pill tone={l.kind === 'حضور' ? 'brand' : 'info'}>{l.kind}</Pill>
                  <span className="text-xs tabular-nums text-muted-foreground">{l.at}</span>
                </li>
              ))}
              {!log.length && <li className="text-xs text-muted-foreground">لا توجد حركات بعد</li>}
            </ul>
          </div>
        </GlassCard>
      </div>
    </>
  )
}
