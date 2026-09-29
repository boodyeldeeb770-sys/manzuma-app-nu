'use client'

import { useState } from 'react'
import { Building2, CreditCard, KeyRound, MapPinned, Timer, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { GeoMap } from '@/components/geo-map'
import { uid, useStore } from '@/components/providers/store-provider'
import { Btn, Field, GlassCard, PageHeader, Pill } from '@/components/ui-kit'
import { SECTORS, egp } from '@/lib/mock-data'
import { REQUEST_TYPE_LABEL, formatDateTime } from '@/lib/status'
import type { PaymentSubmission, RequestType, Sector } from '@/lib/types'
import { cn } from '@/lib/utils'

const MIN_R = 50
const MAX_R = 600_000
const PRESETS = [
  { label: 'مبنى واحد', m: 100 },
  { label: 'حي', m: 2_000 },
  { label: 'مدينة', m: 15_000 },
  { label: 'محافظة كاملة', m: 60_000 },
  { label: 'الجمهورية كلها', m: 600_000 },
]
const toSlider = (m: number) => Math.round((Math.log(m / MIN_R) / Math.log(MAX_R / MIN_R)) * 1000)
const fromSlider = (v: number) => {
  const m = MIN_R * Math.pow(MAX_R / MIN_R, v / 1000)
  return m < 1000 ? Math.round(m / 10) * 10 : Math.round(m / 500) * 500
}
const fmtRadius = (m: number) => (m < 1000 ? `${m} متر` : `${(m / 1000).toLocaleString('ar-EG', { maximumFractionDigits: 1 })} كم`)

const MODULES = [
  { key: 'requests', label: 'الطلبات' },
  { key: 'payroll', label: 'الرواتب' },
  { key: 'recruitment', label: 'التوظيف' },
  { key: 'kiosk', label: 'الكشك' },
  { key: 'settings', label: 'الإعدادات' },
]
const REQUEST_TYPES = Object.keys(REQUEST_TYPE_LABEL) as RequestType[]

const METHODS: { id: PaymentSubmission['method']; label: string; hint: string }[] = [
  { id: 'vodafone', label: 'فودافون كاش', hint: 'حوّل على 01000000000' },
  { id: 'instapay', label: 'إنستاباي', hint: 'manzuma@instapay' },
  { id: 'fawry', label: 'فوري', hint: 'كود الخدمة 7788' },
  { id: 'bank', label: 'تحويل بنكي', hint: 'CIB — 1000 2000 3000 4000' },
]

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="إعدادات المنشأة" description="بروفايل الشركة، نطاق الحضور الجغرافي، الصلاحيات، ووسائل الدفع" />
      <div className="flex flex-col gap-6">
        <BusinessProfile />
        <Geofence />
        <GracePeriods />
        <PermissionMatrix />
        <ManualPayments />
      </div>
    </>
  )
}

function Section({ icon: Icon, title, description, children }: { icon: typeof Building2; title: string; description?: string; children: React.ReactNode }) {
  return (
    <GlassCard className="p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Icon className="size-5" />
        </span>
        <div>
          <h2 className="font-bold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </GlassCard>
  )
}

function BusinessProfile() {
  const { state, update } = useStore()
  const b = state.business
  return (
    <Section icon={Building2} title="بروفايل الشركة" description={`الباقة الحالية: ${b.plan}`}>
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          const d = new FormData(e.currentTarget)
          const name = String(d.get('name')).trim()
          if (!name) return toast.error('اسم المنشأة مطلوب')
          update((s) => ({
            ...s,
            business: { ...s.business, name, sector: d.get('sector') as Sector, address: String(d.get('address')).trim(), phone: String(d.get('phone')).trim() },
          }))
          toast.success('تم حفظ بيانات المنشأة')
        }}
      >
        <Field label="اسم المنشأة">{(id) => <input id={id} name="name" defaultValue={b.name} className="field" required />}</Field>
        <Field label="القطاع">
          {(id) => (
            <select id={id} name="sector" defaultValue={b.sector} className="field">
              {SECTORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="العنوان">{(id) => <input id={id} name="address" defaultValue={b.address} className="field" />}</Field>
        <Field label="هاتف المنشأة">{(id) => <input id={id} name="phone" dir="ltr" defaultValue={b.phone} className="field" inputMode="tel" />}</Field>
        <div className="sm:col-span-2">
          <Btn type="submit">حفظ البيانات</Btn>
        </div>
      </form>
    </Section>
  )
}

function Geofence() {
  const { state, update } = useStore()
  const [center, setCenter] = useState({ lat: state.business.lat, lng: state.business.lng })
  const [radius, setRadius] = useState(state.business.radius)
  const dirty = radius !== state.business.radius || center.lat !== state.business.lat || center.lng !== state.business.lng

  return (
    <Section icon={MapPinned} title="نطاق الحضور الجغرافي (GPS Geofencing)" description="اضغط على الخريطة لتحديد مركز النطاق، وحرّك المؤشر لتوسيع النطاق من مبنى واحد حتى الجمهورية كلها">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="h-80 overflow-hidden rounded-2xl border border-border">
          <GeoMap center={center} radiusMeters={radius} onPick={(lat, lng) => setCenter({ lat, lng })} className="size-full" />
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="radius" className="text-sm font-semibold">
                نصف قطر النطاق
              </label>
              <span className="text-lg font-extrabold text-brand tabular-nums">{fmtRadius(radius)}</span>
            </div>
            <input
              id="radius"
              type="range"
              min={0}
              max={1000}
              value={toSlider(radius)}
              onChange={(e) => setRadius(fromSlider(Number(e.target.value)))}
              className="mt-3 w-full accent-[var(--brand)]"
            />
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span>50 متر</span>
              <span>600 كم</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.m}
                type="button"
                onClick={() => setRadius(p.m)}
                aria-pressed={radius === p.m}
                className={cn('rounded-full border px-3 py-1 text-xs font-semibold transition', radius === p.m ? 'border-brand bg-brand/10 text-brand' : 'border-border bg-secondary hover:bg-accent')}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Field label="أو أدخل النطاق بالمتر">
            {(id) => (
              <input
                id={id}
                type="number"
                min={MIN_R}
                max={MAX_R}
                className="field tabular-nums"
                dir="ltr"
                value={radius}
                onChange={(e) => setRadius(Math.min(MAX_R, Math.max(MIN_R, Number(e.target.value) || MIN_R)))}
              />
            )}
          </Field>
          <p className="text-xs text-muted-foreground tabular-nums" dir="ltr">
            {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
          </p>
          <Btn
            disabled={!dirty}
            onClick={() => {
              update((s) => ({ ...s, business: { ...s.business, ...center, radius } }))
              toast.success(`تم اعتماد نطاق ${fmtRadius(radius)}`)
            }}
          >
            حفظ النطاق
          </Btn>
        </div>
      </div>
    </Section>
  )
}

function GracePeriods() {
  const { state, update } = useStore()
  const def = state.defaultGraceMinutes ?? 10
  const setEmp = (id: string, v: number | undefined) =>
    update((s) => ({ ...s, employees: s.employees.map((e) => (e.id === id ? { ...e, graceMinutes: v } : e)) }))

  return (
    <Section icon={Timer} title="وقت التأخير المسموح به (Grace Period)" description="عدد الدقائق المسموح بها بعد بداية الوردية قبل احتساب التأخير والخصم">
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <Field label="القيمة الافتراضية لكل الموظفين (دقيقة)" className="w-56">
          {(id) => (
            <input
              id={id}
              type="number"
              min={0}
              max={120}
              className="field tabular-nums"
              value={def}
              onChange={(e) => update((s) => ({ ...s, defaultGraceMinutes: Math.min(120, Math.max(0, Number(e.target.value) || 0)) }))}
            />
          )}
        </Field>
        <p className="pb-2 text-xs text-muted-foreground">اترك خانة الموظف فارغة لاستخدام القيمة الافتراضية.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border text-start text-xs text-muted-foreground">
              <th className="py-2 text-start font-medium">الموظف</th>
              <th className="py-2 text-start font-medium">الفرع</th>
              <th className="py-2 text-start font-medium">السماح (دقيقة)</th>
              <th className="py-2 text-start font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {state.employees.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0">
                <td className="py-2.5 font-semibold">{e.name}</td>
                <td className="py-2.5 text-muted-foreground">{e.branch}</td>
                <td className="py-2.5">
                  <input
                    type="number"
                    min={0}
                    max={120}
                    aria-label={`دقائق السماح لـ ${e.name}`}
                    placeholder={String(def)}
                    className="field h-9 w-24 tabular-nums"
                    value={e.graceMinutes ?? ''}
                    onChange={(ev) => setEmp(e.id, ev.target.value === '' ? undefined : Math.min(120, Math.max(0, Number(ev.target.value))))}
                  />
                </td>
                <td className="py-2.5">{e.graceMinutes === undefined ? <Pill tone="muted">افتراضي</Pill> : <Pill tone="info">مخصص</Pill>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

function PermissionMatrix() {
  const { state, update } = useStore()
  const managers = Object.keys(state.permissions)
  const [newName, setNewName] = useState('')

  const toggle = (m: string, key: string) =>
    update((s) => ({ ...s, permissions: { ...s.permissions, [m]: { ...s.permissions[m], [key]: !s.permissions[m]?.[key] } } }))
  const toggleApproval = (m: string, t: RequestType) =>
    update((s) => {
      const cur = s.approvalRights?.[m] ?? { swap: false, leave: false, advance: false, early: false }
      return { ...s, approvalRights: { ...s.approvalRights, [m]: { ...cur, [t]: !cur[t] } } }
    })

  const isOwner = (m: string) => m === state.managerName

  return (
    <Section icon={KeyRound} title="مصفوفة صلاحيات المديرين" description="حدد الأقسام المتاحة لكل مدير أو كاشير، ونوع الطلبات التي يحق له قبولها أو رفضها">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th rowSpan={2} className="border-b border-border py-2 text-start font-medium">
                المستخدم
              </th>
              <th colSpan={MODULES.length} className="border-b border-border py-1.5 font-medium">
                الوصول للأقسام
              </th>
              <th colSpan={REQUEST_TYPES.length} className="border-b border-s border-border py-1.5 font-medium text-gold">
                حق الموافقة / الرفض على الطلبات
              </th>
            </tr>
            <tr className="border-b border-border text-xs text-muted-foreground">
              {MODULES.map((m) => (
                <th key={m.key} className="py-2 font-medium">
                  {m.label}
                </th>
              ))}
              {REQUEST_TYPES.map((t, i) => (
                <th key={t} className={cn('py-2 font-medium', i === 0 && 'border-s border-border')}>
                  {REQUEST_TYPE_LABEL[t]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {managers.map((m) => (
              <tr key={m} className="border-b border-border last:border-0">
                <td className="py-3">
                  <div className="font-semibold">{m}</div>
                  <div className="text-xs text-muted-foreground">{state.managerRoles?.[m] ?? 'مدير'}</div>
                </td>
                {MODULES.map((mod) => (
                  <td key={mod.key} className="py-3 text-center">
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--brand)]"
                      checked={!!state.permissions[m]?.[mod.key]}
                      disabled={isOwner(m)}
                      onChange={() => toggle(m, mod.key)}
                      aria-label={`${m} — ${mod.label}`}
                    />
                  </td>
                ))}
                {REQUEST_TYPES.map((t, i) => (
                  <td key={t} className={cn('py-3 text-center', i === 0 && 'border-s border-border')}>
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--gold)]"
                      checked={!!state.approvalRights?.[m]?.[t]}
                      disabled={isOwner(m)}
                      onChange={() => toggleApproval(m, t)}
                      aria-label={`${m} — الموافقة على ${REQUEST_TYPE_LABEL[t]}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form
        className="mt-4 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const n = newName.trim()
          if (!n || state.permissions[n]) return
          update((s) => ({
            ...s,
            permissions: { ...s.permissions, [n]: { requests: true, payroll: false, recruitment: false, settings: false, kiosk: true } },
            approvalRights: { ...s.approvalRights, [n]: { swap: true, leave: false, advance: false, early: false } },
            managerRoles: { ...s.managerRoles, [n]: 'كاشير / مشرف' },
          }))
          setNewName('')
          toast.success(`تمت إضافة ${n} بصلاحيات محدودة`)
        }}
      >
        <input value={newName} onChange={(e) => setNewName(e.target.value)} className="field max-w-xs" placeholder="اسم مدير أو كاشير جديد" aria-label="اسم المستخدم الجديد" />
        <Btn type="submit" variant="outline" disabled={!newName.trim()}>
          إضافة مستخدم
        </Btn>
      </form>
      <p className="mt-3 text-xs text-muted-foreground">صلاحيات المالك ثابتة ولا يمكن تعديلها.</p>
    </Section>
  )
}

function ManualPayments() {
  const { state, update } = useStore()
  const [method, setMethod] = useState<PaymentSubmission['method']>('vodafone')
  const [file, setFile] = useState<File | null>(null)

  return (
    <Section icon={CreditCard} title="بوابة الدفع اليدوي" description="ادفع اشتراك الباقة بإحدى الوسائل المحلية وارفع صورة الإيصال للمراجعة">
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            const d = new FormData(e.currentTarget)
            const amount = Number(d.get('amount'))
            const reference = String(d.get('reference')).trim()
            if (!amount || amount <= 0 || !reference) return toast.error('أدخل المبلغ ورقم العملية')
            if (!file) return toast.error('ارفع صورة الإيصال')
            update((s) => ({
              ...s,
              payments: [{ id: uid(), method, amount, reference, receiptName: file.name, status: 'review', at: new Date().toISOString() }, ...s.payments],
            }))
            e.currentTarget.reset()
            setFile(null)
            toast.success('تم إرسال الإيصال — سيتم التأكيد خلال 24 ساعة')
          }}
        >
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="وسيلة الدفع">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={method === m.id}
                onClick={() => setMethod(m.id)}
                className={cn('rounded-xl border p-3 text-start transition', method === m.id ? 'border-brand bg-brand/10' : 'border-border bg-secondary hover:bg-accent')}
              >
                <div className="text-sm font-bold">{m.label}</div>
                <div className="text-[11px] text-muted-foreground" dir="ltr">
                  {m.hint}
                </div>
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="المبلغ (ج.م)">{(id) => <input id={id} name="amount" type="number" min={1} className="field tabular-nums" placeholder="1499" />}</Field>
            <Field label="رقم العملية / المرجع">{(id) => <input id={id} name="reference" className="field" dir="ltr" placeholder="TX-000000" />}</Field>
          </div>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/50 p-6 text-center text-sm transition hover:border-brand">
            <Upload className="size-6 text-brand" />
            {file ? <span className="font-semibold">{file.name}</span> : <span>اضغط لرفع صورة الإيصال (PNG, JPG, PDF)</span>}
            <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <Btn type="submit">إرسال للمراجعة</Btn>
        </form>

        <div>
          <h3 className="mb-3 text-sm font-bold">سجل المدفوعات</h3>
          <ul className="flex flex-col gap-2">
            {state.payments.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-3 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">
                    {METHODS.find((m) => m.id === p.method)?.label} · {egp(p.amount)}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {p.reference} · {p.receiptName} · {formatDateTime(p.at)}
                  </div>
                </div>
                <Pill tone={p.status === 'confirmed' ? 'brand' : 'gold'}>{p.status === 'confirmed' ? 'مؤكد' : 'قيد المراجعة'}</Pill>
              </li>
            ))}
            {!state.payments.length && <li className="text-sm text-muted-foreground">لا توجد مدفوعات بعد</li>}
          </ul>
        </div>
      </div>
    </Section>
  )
}
