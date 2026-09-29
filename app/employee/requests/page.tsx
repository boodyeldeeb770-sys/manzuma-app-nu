'use client'

import { useMemo, useState } from 'react'
import { ArrowLeftRight, Banknote, CalendarDays, LogOut, Plus, ShieldCheck, Trash2, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { uid, useStore } from '@/components/providers/store-provider'
import { Btn, GlassCard, Modal, PageHeader, Pill, Tabs } from '@/components/ui-kit'
import { egp } from '@/lib/mock-data'
import { formatDateTime, REQUEST_STATUS_META, REQUEST_TYPE_LABEL } from '@/lib/status'
import type { RequestType, StaffRequest } from '@/lib/types'

const TYPE_ICON = { swap: ArrowLeftRight, leave: CalendarDays, advance: Banknote, early: LogOut }

const today = () => new Date().toISOString().slice(0, 10)

export default function MyRequestsPage() {
  const { state, update } = useStore()
  const me = state.employees.find((e) => e.id === state.me.employeeId) ?? state.employees[0]
  const [open, setOpen] = useState(false)
  const [cancelId, setCancelId] = useState<string | null>(null)

  const withdraw = () => {
    if (!cancelId) return
    update((s) => ({ ...s, requests: s.requests.filter((r) => !(r.id === cancelId && r.status === 'pending')) }))
    toast.success('تم سحب الطلب')
    setCancelId(null)
  }

  // Cash advances are strictly capped at 50% of accrued (monthly) wages,
  // minus whatever advance the employee has already drawn this cycle.
  const advanceCap = Math.max(0, Math.floor(me.baseSalary * 0.5) - me.advances)

  const mine = state.requests
    .filter((r) => r.employeeId === me.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const pendingCount = mine.filter((r) => r.status === 'pending').length

  return (
    <>
      <PageHeader
        title="طلباتي"
        description="قدّم طلبات الإجازات والسلف وتابع قرارات الإدارة في مكان واحد"
        actions={
          <Btn onClick={() => setOpen(true)}>
            <Plus />
            طلب جديد
          </Btn>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <GlassCard className="flex items-center gap-3 p-4">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-gold/12 text-gold">
            <CalendarDays className="size-5" />
          </span>
          <div>
            <div className="text-lg font-extrabold tabular-nums">{pendingCount}</div>
            <div className="text-xs text-muted-foreground">قيد المراجعة</div>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-3 p-4">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand/12 text-brand">
            <Wallet className="size-5" />
          </span>
          <div>
            <div className="text-lg font-extrabold tabular-nums">{egp(advanceCap)}</div>
            <div className="text-xs text-muted-foreground">الحد المتاح للسلفة</div>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-3 p-4">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-info/12 text-info">
            <Banknote className="size-5" />
          </span>
          <div>
            <div className="text-lg font-extrabold tabular-nums">{egp(me.advances)}</div>
            <div className="text-xs text-muted-foreground">سلف مسحوبة هذا الشهر</div>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {mine.map((r) => {
          const Icon = TYPE_ICON[r.type]
          return (
            <GlassCard key={r.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <Pill tone="info">
                  <Icon className="size-3.5" />
                  {REQUEST_TYPE_LABEL[r.type]}
                </Pill>
                <Pill tone={REQUEST_STATUS_META[r.status].tone}>{REQUEST_STATUS_META[r.status].label}</Pill>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {r.leaveKind && <Pill tone={r.leaveKind === 'emergency' ? 'danger' : 'muted'}>{r.leaveKind === 'emergency' ? 'طارئة' : 'اعتيادية'}</Pill>}
                {r.amount && <Pill tone="gold">{egp(r.amount)}</Pill>}
                <span>بتاريخ {new Date(r.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}</span>
              </div>
              <p className="text-sm leading-relaxed">{r.details}</p>
              <div className="mt-auto flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>قُدّم {formatDateTime(r.createdAt)}</span>
                {r.status === 'pending' && (
                  <Btn size="sm" variant="ghost" className="text-danger" onClick={() => setCancelId(r.id)}>
                    <Trash2 />
                    سحب الطلب
                  </Btn>
                )}
              </div>
              {r.status !== 'pending' && r.managerNote && (
                <div className="rounded-xl border border-border bg-secondary p-3 text-xs">
                  <div className="mb-1 flex items-center gap-1.5 font-semibold text-brand">
                    <ShieldCheck className="size-3.5" />
                    رد الإدارة{r.actionBy ? ` · ${r.actionBy}` : ''}
                  </div>
                  <div className="text-muted-foreground">{r.managerNote}</div>
                </div>
              )}
            </GlassCard>
          )
        })}
        {!mine.length && (
          <GlassCard className="col-span-full p-12 text-center text-muted-foreground">لم تقدّم أي طلبات بعد</GlassCard>
        )}
      </div>

      <NewRequestModal
        open={open}
        onClose={() => setOpen(false)}
        advanceCap={advanceCap}
        onSubmit={(req) => {
          update((s) => ({ ...s, requests: [{ ...req, id: uid(), employeeId: me.id, status: 'pending', createdAt: new Date().toISOString() }, ...s.requests] }))
          toast.success('تم إرسال الطلب إلى الإدارة')
          setOpen(false)
        }}
      />

      <Modal open={!!cancelId} onClose={() => setCancelId(null)} title="سحب الطلب؟" description="سيُحذف الطلب نهائيًا من قائمة الإدارة ولن يمكن استرجاعه.">
        <div className="grid grid-cols-2 gap-2">
          <Btn variant="danger" onClick={withdraw}>
            <Trash2 />
            تأكيد السحب
          </Btn>
          <Btn variant="outline" onClick={() => setCancelId(null)}>تراجع</Btn>
        </div>
      </Modal>
    </>
  )
}

type Draft = Omit<StaffRequest, 'id' | 'employeeId' | 'status' | 'createdAt'>

function NewRequestModal({
  open,
  onClose,
  advanceCap,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  advanceCap: number
  onSubmit: (draft: Draft) => void
}) {
  const [type, setType] = useState<RequestType>('leave')
  const [leaveKind, setLeaveKind] = useState<'standard' | 'emergency'>('standard')
  const [date, setDate] = useState(today())
  const [amount, setAmount] = useState('')
  const [details, setDetails] = useState('')

  const amountNum = Number(amount)
  const amountInvalid = type === 'advance' && (!amountNum || amountNum <= 0 || amountNum > advanceCap)
  const detailsInvalid = details.trim().length < 5

  const submit = () => {
    if (amountInvalid || detailsInvalid) return
    onSubmit({
      type,
      leaveKind: type === 'leave' ? leaveKind : undefined,
      date,
      details: details.trim(),
      amount: type === 'advance' ? amountNum : undefined,
    })
    setType('leave')
    setLeaveKind('standard')
    setDate(today())
    setAmount('')
    setDetails('')
  }

  return (
    <Modal open={open} onClose={onClose} title="طلب جديد" description="اختر نوع الطلب واملأ التفاصيل المطلوبة">
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 text-sm font-semibold">نوع الطلب</div>
          <Tabs<RequestType>
            value={type}
            onChange={setType}
            items={[
              { value: 'leave', label: 'إجازة' },
              { value: 'advance', label: 'سلفة' },
              { value: 'early', label: 'انصراف مبكر' },
              { value: 'swap', label: 'تبديل وردية' },
            ]}
          />
        </div>

        {type === 'leave' && (
          <div>
            <div className="mb-1.5 text-sm font-semibold">نوع الإجازة</div>
            <Tabs
              value={leaveKind}
              onChange={(v) => setLeaveKind(v as 'standard' | 'emergency')}
              items={[
                { value: 'standard', label: 'اعتيادية (شهرية)' },
                { value: 'emergency', label: 'طارئة' },
              ]}
            />
          </div>
        )}

        {type === 'advance' && (
          <div>
            <label htmlFor="req-amount" className="text-sm font-semibold">
              قيمة السلفة (ج.م)
            </label>
            <input
              id="req-amount"
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="field mt-1.5"
              placeholder={`بحد أقصى ${advanceCap}`}
              aria-invalid={amountInvalid}
            />
            <p className={amountInvalid ? 'mt-1 text-xs text-danger' : 'mt-1 text-xs text-muted-foreground'}>
              {advanceCap === 0
                ? 'لا يوجد رصيد متاح للسلف — وصلت للحد الأقصى (50% من الراتب)'
                : `الحد الأقصى ${egp(advanceCap)} — لا يتجاوز 50% من أجرك المستحق`}
            </p>
          </div>
        )}

        <div>
          <label htmlFor="req-date" className="text-sm font-semibold">
            التاريخ
          </label>
          <input id="req-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field mt-1.5" dir="ltr" />
        </div>

        <div>
          <label htmlFor="req-details" className="text-sm font-semibold">
            التفاصيل <span className="text-danger">*</span>
          </label>
          <textarea
            id="req-details"
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="field mt-1.5"
            placeholder="اشرح سبب الطلب بإيجاز"
            aria-invalid={detailsInvalid && details.length > 0}
          />
        </div>

        <Btn size="lg" onClick={submit} disabled={amountInvalid || detailsInvalid}>
          <Plus />
          إرسال الطلب
        </Btn>
      </div>
    </Modal>
  )
}
