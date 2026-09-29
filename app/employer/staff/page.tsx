'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Printer, QrCode, Search, Star, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { QrImage } from '@/components/qr-image'
import { uid, useStore } from '@/components/providers/store-provider'
import { Avatar, Btn, Field, GlassCard, Modal, PageHeader, Pill, Stars, Tabs } from '@/components/ui-kit'
import { egp } from '@/lib/mock-data'
import { STATUS_META } from '@/lib/status'
import type { Employee } from '@/lib/types'
import { cn } from '@/lib/utils'

function PinCell({ pin, name }: { pin?: string; name: string }) {
  const [shown, setShown] = useState(false)
  if (!pin) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <button
      type="button"
      onClick={() => setShown((v) => !v)}
      className="flex items-center gap-1.5 rounded-lg px-2 py-1 font-mono text-sm tabular-nums hover:bg-accent"
      aria-label={shown ? `إخفاء رمز ${name}` : `إظهار رمز ${name}`}
      dir="ltr"
    >
      {shown ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      {shown ? pin : '••••'}
    </button>
  )
}

function scoreTone(v: number) {
  return v >= 90 ? 'var(--brand)' : v >= 80 ? 'var(--gold)' : 'var(--danger)'
}

function StaffContent() {
  const { state, update } = useStore()
  const params = useSearchParams()
  const [query, setQuery] = useState('')
  const [branch, setBranch] = useState('all')
  const [qrFor, setQrFor] = useState<Employee | null>(null)
  const [rateFor, setRateFor] = useState<Employee | null>(null)
  const [adding, setAdding] = useState(false)
  const focus = params.get('focus')

  useEffect(() => {
    if (focus) document.getElementById(`row-${focus}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focus])

  const branches = useMemo(() => Array.from(new Set(state.employees.map((e) => e.branch))), [state.employees])
  const list = state.employees.filter((e) => (branch === 'all' || e.branch === branch) && (e.name.includes(query) || e.title.includes(query)))
  const avgPunctuality = Math.round(state.employees.reduce((a, e) => a + e.punctuality, 0) / state.employees.length)

  return (
    <>
      <PageHeader
        title="سجل الموظفين والأداء"
        description={`${state.employees.length} موظفين · متوسط الانضباط الآلي ${avgPunctuality}%`}
        actions={
          <Btn onClick={() => setAdding(true)}>
            <UserPlus />
            إضافة موظف
          </Btn>
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث بالاسم أو الوظيفة" aria-label="بحث" className="field ps-9" />
        </div>
        <Tabs
          value={branch}
          onChange={setBranch}
          items={[{ value: 'all', label: 'كل الفروع' }, ...branches.map((b) => ({ value: b, label: b.replace('فرع ', '') }))]}
        />
      </div>

      <GlassCard className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="p-4 text-start font-medium">الموظف</th>
              <th className="p-4 text-start font-medium">الفرع</th>
              <th className="p-4 text-start font-medium">رمز PIN</th>
              <th className="p-4 text-start font-medium">الحالة اليوم</th>
              <th className="p-4 text-start font-medium">تقييم المدير</th>
              <th className="p-4 text-start font-medium">الانضباط الآلي</th>
              <th className="p-4 text-start font-medium">الراتب الأساسي</th>
              <th className="p-4 text-end font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id} id={`row-${e.id}`} className={cn('border-b border-border last:border-0 transition hover:bg-accent/50', focus === e.id && 'bg-brand/8')}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={e.name} />
                    <div>
                      <div className="font-semibold">{e.name}</div>
                      <div className="text-xs text-muted-foreground">{e.title}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{e.branch}</td>
                <td className="p-4">
                  <PinCell pin={e.pin} name={e.name} />
                </td>
                <td className="p-4">
                  <Pill tone={STATUS_META[e.status].tone}>
                    {STATUS_META[e.status].label}
                    {e.checkIn && (e.status === 'present' || e.status === 'late') && <span className="tabular-nums opacity-80">{e.checkIn}</span>}
                  </Pill>
                </td>
                <td className="p-4">
                  <button onClick={() => setRateFor(e)} className="flex items-center gap-2 rounded-lg p-1 hover:bg-accent" aria-label={`تعديل تقييم ${e.name}`}>
                    <Stars value={e.managerRating} />
                    <span className="text-xs tabular-nums text-muted-foreground">{e.managerRating}</span>
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full" style={{ width: `${e.punctuality}%`, background: scoreTone(e.punctuality) }} />
                    </div>
                    <span className="text-xs font-bold tabular-nums" style={{ color: scoreTone(e.punctuality) }}>
                      {e.punctuality}%
                    </span>
                  </div>
                </td>
                <td className="p-4 tabular-nums">{egp(e.baseSalary)}</td>
                <td className="p-4 text-end">
                  <Btn size="sm" variant="outline" onClick={() => setQrFor(e)}>
                    <QrCode />
                    بطاقة QR
                  </Btn>
                </td>
              </tr>
            ))}
            {!list.length && (
              <tr>
                <td colSpan={8} className="p-10 text-center text-muted-foreground">لا توجد نتائج مطابقة</td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>

      <Modal open={!!qrFor} onClose={() => setQrFor(null)} title="بطاقة الموظف الذكية" size="sm">
        {qrFor && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-full overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand/20 via-transparent to-info/20 p-5 text-center">
              <div className="mb-4 flex items-center justify-between text-xs font-bold">
                <span className="text-brand">منظومة</span>
                <span className="text-muted-foreground">{state.business.name}</span>
              </div>
              <QrImage value={`MANZUMA-EMP|${qrFor.id}|${qrFor.phone}`} size={180} label={`رمز QR للموظف ${qrFor.name}`} className="mx-auto" />
              <div className="mt-4 text-lg font-extrabold">{qrFor.name}</div>
              <div className="text-sm text-muted-foreground">{qrFor.title} · {qrFor.branch}</div>
              <div className="mt-2 font-mono text-xs text-muted-foreground" dir="ltr">ID: {qrFor.id.toUpperCase()}-{qrFor.phone.slice(-4)}</div>
            </div>
            <Btn className="w-full" onClick={() => window.print()}>
              <Printer />
              طباعة البطاقة
            </Btn>
          </div>
        )}
      </Modal>

      <RateModal
        employee={rateFor}
        onClose={() => setRateFor(null)}
        onSave={(id, v) => {
          update((s) => ({ ...s, employees: s.employees.map((e) => (e.id === id ? { ...e, managerRating: v } : e)) }))
          toast.success('تم تحديث تقييم المدير')
          setRateFor(null)
        }}
      />

      <Modal open={adding} onClose={() => setAdding(false)} title="إضافة موظف جديد">
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(ev) => {
            ev.preventDefault()
            const fd = new FormData(ev.currentTarget)
            const emp: Employee = {
              id: uid(),
              name: String(fd.get('name')),
              title: String(fd.get('title')),
              branch: String(fd.get('branch')),
              phone: String(fd.get('phone')),
              baseSalary: Number(fd.get('salary')),
              pin: String(Math.floor(1000 + Math.random() * 9000)),
              managerRating: 4,
              punctuality: 100,
              status: 'off',
              lateMinutesMonth: 0,
              overtime15: 0,
              overtime20: 0,
              advances: 0,
              bonus: 0,
              joinedAt: new Date().toISOString().slice(0, 10),
            }
            update((s) => ({ ...s, employees: [...s.employees, emp] }))
            toast.success(`تمت إضافة ${emp.name} — رمز PIN: ${emp.pin}`)
            setAdding(false)
          }}
        >
          <Field label="الاسم الكامل">{(id) => <input id={id} name="name" required className="field" />}</Field>
          <Field label="المسمى الوظيفي">{(id) => <input id={id} name="title" required className="field" />}</Field>
          <Field label="رقم الهاتف">{(id) => <input id={id} name="phone" required pattern="01[0-9]{9}" className="field" dir="ltr" placeholder="01XXXXXXXXX" />}</Field>
          <Field label="الراتب الأساسي (ج.م)">{(id) => <input id={id} name="salary" type="number" min={1000} required className="field" dir="ltr" />}</Field>
          <Field label="الفرع" className="sm:col-span-2">
            {(id) => (
              <select id={id} name="branch" className="field">
                {branches.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            )}
          </Field>
          <Btn type="submit" size="lg" className="sm:col-span-2">حفظ الموظف</Btn>
        </form>
      </Modal>
    </>
  )
}

function RateModal({ employee, onClose, onSave }: { employee: Employee | null; onClose: () => void; onSave: (id: string, v: number) => void }) {
  const [value, setValue] = useState(0)
  useEffect(() => setValue(employee?.managerRating ?? 0), [employee])
  return (
    <Modal open={!!employee} onClose={onClose} title={`تقييم ${employee?.name ?? ''}`} size="sm" description="يُدمج تقييم المدير مع درجة الانضباط الآلي لحساب مؤشر الأداء">
      <div className="flex justify-center gap-1" role="radiogroup" aria-label="التقييم">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} role="radio" aria-checked={value === n} onClick={() => setValue(n)} className="p-1" aria-label={`${n} نجوم`}>
            <Star className={cn('size-9 transition', n <= value ? 'fill-gold text-gold' : 'text-muted-foreground')} />
          </button>
        ))}
      </div>
      <Btn className="mt-6 w-full" onClick={() => employee && onSave(employee.id, value)}>حفظ التقييم</Btn>
    </Modal>
  )
}

export default function StaffPage() {
  return (
    <Suspense>
      <StaffContent />
    </Suspense>
  )
}
