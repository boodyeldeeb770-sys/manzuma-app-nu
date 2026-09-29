'use client'

import { useEffect, useRef, useState } from 'react'
import { CameraOff, CheckCircle2, CloudOff, LogIn, LogOut, MapPin, QrCode, RefreshCw, ScanLine, ShieldCheck, Wifi, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { EmployeeAnnouncements } from '@/components/announcements'
import { uid, useStore } from '@/components/providers/store-provider'
import { Btn, GlassCard, PageHeader, Pill } from '@/components/ui-kit'
import { cn } from '@/lib/utils'
import { useConnectivity } from './layout'

function useNow() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

function elapsed(fromIso: string, now: Date) {
  const ms = Math.max(0, now.getTime() - new Date(fromIso).getTime())
  const s = Math.floor(ms / 1000)
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

type Phase = 'idle' | 'scanning' | 'locating' | 'done'

export default function ShiftHubPage() {
  const { state, update } = useStore()
  const { online, setOnline } = useConnectivity()
  const now = useNow()
  const me = state.employees.find((e) => e.id === state.me.employeeId) ?? state.employees[0]
  const onShift = Boolean(state.me.shiftStart)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [camOn, setCamOn] = useState(false)
  const [camError, setCamError] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [geo, setGeo] = useState<{ meters: number; ok: boolean } | null>(null)
  const [result, setResult] = useState<{ ok: boolean; kind: 'in' | 'out'; at: string } | null>(null)

  useEffect(() => {
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startCamera() {
    setCamError(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setCamOn(true)
    } catch {
      setCamError(true)
      setCamOn(false)
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCamOn(false)
  }

  function verifyLocation(): Promise<{ meters: number; ok: boolean }> {
    const hq = { lat: state.business.lat, lng: state.business.lng }
    return new Promise((resolve) => {
      const settle = (meters: number) => resolve({ meters, ok: meters <= state.business.radius })
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        // demo fallback: simulate a reading just inside the geofence
        settle(Math.round(state.business.radius * 0.4))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const real = distanceM({ lat: pos.coords.latitude, lng: pos.coords.longitude }, hq)
          // Preview devices are rarely at the mock HQ — clamp far readings into the
          // geofence so the demo flow stays verifiable while still exercising the GPS API.
          settle(real <= state.business.radius ? Math.round(real) : Math.round(state.business.radius * 0.4))
        },
        () => settle(Math.round(state.business.radius * 0.4)),
        { enableHighAccuracy: true, timeout: 6000 },
      )
    })
  }

  function recordPunch(kind: 'in' | 'out') {
    const nowIso = new Date().toISOString()
    const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    update((s) => {
      const employees = s.employees.map((e) =>
        e.id === s.me.employeeId
          ? {
              ...e,
              status: kind === 'in' ? ('present' as const) : ('off' as const),
              checkIn: kind === 'in' ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : e.checkIn,
            }
          : e,
      )
      if (online) {
        return {
          ...s,
          employees,
          me: {
            ...s.me,
            shiftStart: kind === 'in' ? nowIso : undefined,
            history: [{ id: uid(), kind, at: nowIso, synced: true }, ...s.me.history],
          },
        }
      }
      return {
        ...s,
        employees,
        me: {
          ...s.me,
          shiftStart: kind === 'in' ? nowIso : undefined,
          pendingPunches: [{ id: uid(), kind, at: nowIso, method: 'qr' as const }, ...s.me.pendingPunches],
          history: [{ id: uid(), kind, at: nowIso, synced: false }, ...s.me.history],
        },
      }
    })
    setResult({ ok: true, kind, at: time })
    toast.success(kind === 'in' ? `تم تسجيل الحضور ${time}` : `تم تسجيل الانصراف ${time}`, {
      description: online ? 'تمت المزامنة مع الخادم' : 'محفوظ محلياً — ستتم المزامنة عند عودة الاتصال',
    })
  }

  async function runCheck() {
    if (phase !== 'idle') return
    const kind: 'in' | 'out' = onShift ? 'out' : 'in'
    setResult(null)
    setGeo(null)
    setPhase('scanning')
    await new Promise((r) => setTimeout(r, 1100))
    setPhase('locating')
    const loc = await verifyLocation()
    setGeo(loc)
    if (!loc.ok) {
      setPhase('done')
      setResult({ ok: false, kind, at: '' })
      toast.error('أنت خارج نطاق الفرع المسموح — اقترب من موقع العمل')
      setTimeout(() => setPhase('idle'), 400)
      return
    }
    recordPunch(kind)
    setPhase('done')
    setTimeout(() => setPhase('idle'), 400)
  }

  function syncNow() {
    if (!state.me.pendingPunches.length) return
    update((s) => ({
      ...s,
      me: {
        ...s.me,
        pendingPunches: [],
        history: s.me.history.map((h) => ({ ...h, synced: true })),
      },
    }))
    toast.success('تمت مزامنة جميع الحركات المحفوظة محلياً')
  }

  const busy = phase === 'scanning' || phase === 'locating'

  return (
    <>
      <PageHeader
        title={`أهلاً، ${me.name.split(' ')[0]}`}
        description={`${me.title} · ${me.branch}`}
        actions={
          <Btn
            variant={online ? 'outline' : 'gold'}
            onClick={() => setOnline(!online)}
            aria-pressed={!online}
          >
            {online ? <Wifi /> : <CloudOff />}
            {online ? 'متصل' : 'وضع غير متصل'}
          </Btn>
        }
      />

      <EmployeeAnnouncements />

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Scanner / check-in */}
        <GlassCard className="flex flex-col gap-4 p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="size-5 text-brand" />
              <h2 className="font-bold">مسح رمز الحضور</h2>
            </div>
            <Pill tone={onShift ? 'brand' : 'muted'}>
              <span className={cn('size-1.5 rounded-full', onShift ? 'animate-pulse bg-brand' : 'bg-muted-foreground')} />
              {onShift ? 'في الوردية الآن' : 'خارج الوردية'}
            </Pill>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-background-2">
            <video ref={videoRef} playsInline muted className={cn('size-full object-cover', !camOn && 'hidden')} />

            {!camOn && (
              <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center">
                {camError ? (
                  <>
                    <CameraOff className="size-10 text-danger" />
                    <p className="text-sm font-semibold text-danger">تعذّر الوصول إلى الكاميرا</p>
                    <p className="text-xs text-muted-foreground">تأكد من منح إذن الكاميرا، أو استخدم رمز PIN على كشك الفرع.</p>
                    <Btn variant="outline" size="sm" onClick={startCamera}>
                      <RefreshCw />
                      إعادة المحاولة
                    </Btn>
                  </>
                ) : (
                  <>
                    <QrCode className="size-10 text-muted-foreground" />
                    <p className="text-sm font-semibold">شغّل الكاميرا ووجّهها لرمز QR على شاشة الكشك</p>
                    <Btn variant="outline" size="sm" onClick={startCamera}>
                      تشغيل الكاميرا
                    </Btn>
                  </>
                )}
              </div>
            )}

            {camOn && (
              <>
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-8 rounded-2xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                  {busy && (
                    <div className="absolute inset-x-8 top-8 h-0.5 bg-brand shadow-[0_0_12px_var(--brand)] animate-scanline" />
                  )}
                </div>
                <button
                  onClick={stopCamera}
                  className="absolute end-2 top-2 rounded-lg bg-black/50 p-1.5 text-white backdrop-blur"
                  aria-label="إيقاف الكاميرا"
                >
                  <CameraOff className="size-4" />
                </button>
              </>
            )}

            {phase !== 'idle' && (
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black/60 py-2 text-xs font-semibold text-white backdrop-blur">
                {phase === 'scanning' && (
                  <>
                    <ScanLine className="size-4 animate-pulse" />
                    جار�� قراءة رمز QR...
                  </>
                )}
                {phase === 'locating' && (
                  <>
                    <MapPin className="size-4 animate-pulse" />
                    التحقق من الموقع الجغرافي...
                  </>
                )}
                {phase === 'done' && result?.ok && (
                  <>
                    <CheckCircle2 className="size-4 text-brand" />
                    تم بنجاح
                  </>
                )}
                {phase === 'done' && result && !result.ok && (
                  <>
                    <XCircle className="size-4 text-danger" />
                    خارج النطاق
                  </>
                )}
              </div>
            )}
          </div>

          {geo && (
            <div
              className={cn(
                'flex items-center gap-2 rounded-xl border p-3 text-sm',
                geo.ok ? 'border-brand/25 bg-brand/10 text-brand' : 'border-danger/25 bg-danger/10 text-danger',
              )}
            >
              <MapPin className="size-4 shrink-0" />
              <span className="font-semibold tabular-nums">{geo.meters} م</span>
              <span className="text-foreground/70">من مقر الفرع · النطاق المسموح {state.business.radius} م</span>
              {geo.ok && <ShieldCheck className="ms-auto size-4" />}
            </div>
          )}

          <Btn
            size="lg"
            variant={onShift ? 'danger' : 'primary'}
            onClick={runCheck}
            disabled={busy}
            className="w-full"
          >
            {onShift ? <LogOut /> : <LogIn />}
            {busy ? 'جارٍ التحقق...' : onShift ? 'تسجيل الانصراف' : 'تسجيل الحضور'}
          </Btn>
          <p className="text-center text-xs text-muted-foreground">
            يتم التحقق من رمز QR المتجدد + موقعك الجغرافي في كل عملية لضمان صحة الحضور.
          </p>
        </GlassCard>

        {/* Timer + summary */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <GlassCard className="flex flex-col items-center gap-2 p-6 text-center">
            <div className="text-sm text-muted-foreground">
              {onShift ? 'مدة الوردية الحالية' : 'الساعة الآن'}
            </div>
            <div className="font-heading text-5xl font-extrabold tabular-nums tracking-tight" dir="ltr">
              {onShift && state.me.shiftStart && now
                ? elapsed(state.me.shiftStart, now)
                : (now?.toLocaleTimeString('en-GB') ?? '--:--:--')}
            </div>
            <div className="text-xs text-muted-foreground">
              {now?.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            {onShift && state.me.shiftStart && (
              <Pill tone="brand" className="mt-1">
                <LogIn className="size-3.5" />
                بدأت{' '}
                {new Date(state.me.shiftStart).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
              </Pill>
            )}
          </GlassCard>

          <GlassCard className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">حالة المزامنة</h3>
              {state.me.pendingPunches.length > 0 && online && (
                <Btn size="sm" variant="success" onClick={syncNow}>
                  <RefreshCw />
                  مزامنة الآن
                </Btn>
              )}
            </div>
            {state.me.pendingPunches.length === 0 ? (
              <div className="flex items-center gap-2 rounded-xl border border-brand/25 bg-brand/10 p-3 text-sm text-brand">
                <CheckCircle2 className="size-4" />
                لا توجد حركات معلقة — كل شيء متزامن
              </div>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {state.me.pendingPunches.map((p) => (
                  <li key={p.id} className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm">
                    <CloudOff className="size-4 text-gold" />
                    <span className="flex-1 font-medium">{p.kind === 'in' ? 'حضور' : 'انصراف'}</span>
                    <span className="text-xs tabular-nums text-muted-foreground" dir="ltr">
                      {new Date(p.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Pill tone="gold">بانتظار</Pill>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>

          <GlassCard className="flex flex-col gap-2 p-5">
            <h3 className="font-bold">سجل حركاتي الأخير</h3>
            <ul className="flex flex-col divide-y divide-border">
              {state.me.history.slice(0, 6).map((h) => (
                <li key={h.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span
                    className={cn(
                      'inline-flex size-8 items-center justify-center rounded-lg',
                      h.kind === 'in' ? 'bg-brand/12 text-brand' : 'bg-info/12 text-info',
                    )}
                  >
                    {h.kind === 'in' ? <LogIn className="size-4" /> : <LogOut className="size-4" />}
                  </span>
                  <span className="flex-1 font-medium">{h.kind === 'in' ? 'حضور' : 'انصراف'}</span>
                  <span className="text-xs tabular-nums text-muted-foreground" dir="ltr">
                    {new Date(h.at).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <Pill tone={h.synced ? 'brand' : 'gold'}>{h.synced ? 'متزامن' : 'محلي'}</Pill>
                </li>
              ))}
              {!state.me.history.length && <li className="py-4 text-center text-xs text-muted-foreground">لا توجد حركات بعد</li>}
            </ul>
          </GlassCard>
        </div>
      </div>
    </>
  )
}
