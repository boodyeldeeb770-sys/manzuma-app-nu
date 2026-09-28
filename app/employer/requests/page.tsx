'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeftRight, Banknote, CalendarDays, Check, LogOut, MinusCircle, ShieldCheck, X } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/components/providers/store-provider'
import { Avatar, Btn, GlassCard, Modal, PageHeader, Pill, Tabs } from '@/components/ui-kit'
import { egp } from '@/lib/mock-data'
import { formatDateTime, REQUEST_STATUS_META, REQUEST_TYPE_LABEL } from '@/lib/status'
import type { RequestStatus, RequestType, StaffRequest } from '@/lib/types'

type Filter = 'all' | RequestType

const TYPE_ICON = { swap: ArrowLeftRight, leave: CalendarDays, advance: Banknote, early: LogOut }

function RequestsContent() {
  const { state, update } = useStore()
  const params = useSearchParams()
  const [filter, setFilter] = useState<Filter>('all')
  const [leaveKind, setLeaveKind] = useState<'all' | 'standard' | 'emergency'>('all')
  const [showDone, setShowDone] = useState(false)
  const [active, setActive] = useState<StaffRequest | null>(null)

  useEffect(() => {
    const id = params.get('open')
    if (id) setActive(state.requests.find((r) => r.id === id) ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const count = (t: Filter) => state.requests.filter((r) => r.status === 'pending' && (t === 'all' || r.type === t)).length
  const list = state.requests
    .filter((r) => (showDone ? r.status !== 'pending' : r.status === 'pending'))
    .filter((r) => filter === 'all' || r.type === filter)
    .filter((r) => filter !== 'leave' || leaveKind === 'all' || r.leaveKind === leaveKind)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const decide = (req: StaffRequest, status: RequestStatus, note: string) => {
    update((s) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === req.id ? { ...r, status, managerNote: note, actionBy: s.managerName, actionAt: new Date().toISOString() } : r)),
      employees:
        req.type === 'advance' && status !== 'rejected'
          ? s.employees.map((e) => (e.id === req.employeeId ? { ...e, advances: e.advances + (req.amount ?? 0) } : e))
          : s.employees,
    }))
    toast.success(`تم ${REQUEST_STATUS_META[status].label === 'مرفوض' ? 'رفض' : 'اعتماد'} الطلب وتسجيله في سجل التدقيق`)
    setActive(null)
  }

  return (
    <>
      <PageHeader title="مركز الطلبات" description="كل قرار يُسجّل باسم متخذه مع ملاحظة إلزامية لضمان الشفافية" />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs<Filter>
          value={filter}
          onChange={setFilter}
          items={[
            { value: 'all', label: 'الكل', count: count('all') },
            { value: 'swap', label: 'تبديل ورديات', count: count('swap') },
            { value: 'leave', label: 'الإجازات', count: count('leave') },
            { value: 'advance', label: 'السلف', count: count('advance') },
            { value: 'early', label: 'انصراف مبكر', count: count('early') },
          ]}
        />
        <Tabs
          value={showDone ? 'done' : 'pending'}
          onChange={(v) => setShowDone(v === 'done')}
          items={[
            { value: 'pending', label: 'بانتظار القرار' },
            { value: 'done', label: 'سجل القرارات' },
          ]}
        />
      </div>

      {filter === 'leave' && (
        <Tabs
          className="mb-4"
          value={leaveKind}
          onChange={setLeaveKind}
          items={[
            { value: 'all', label: 'كل الإجازات' },
            { value: 'standard', label: 'اعتيادية (شهرية)' },
            { value: 'emergency', label: 'طارئة' },
          ]}
        />
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {list.map((r) => {
          const emp = state.employees.find((e) => e.id === r.employeeId)
          const Icon = TYPE_ICON[r.type]
          return (
            <GlassCard key={r.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-start gap-3">
                <Avatar name={emp?.name ?? '?'} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{emp?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {emp?.title} · {formatDateTime(r.createdAt)}
                  </div>
                </div>
                <Pill tone={REQUEST_STATUS_META[r.status].tone}>{REQUEST_STATUS_META[r.status].label}</Pill>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="info">
                  <Icon className="size-3.5" />
                  {REQUEST_TYPE_LABEL[r.type]}
                </Pill>
                {r.leaveKind && <Pill tone={r.leaveKind === 'emergency' ? 'danger' : 'muted'}>{r.leaveKind === 'emergency' ? 'طارئة' : 'اعتيادية'}</Pill>}
                {r.amount && <Pill tone="gold">{egp(r.amount)}</Pill>}
                <span className="text-xs text-muted-foreground">بتاريخ {new Date(r.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}</span>
              </div>
              <p className="text-sm leading-relaxed">{r.details}</p>
              {r.status === 'pending' ? (
                <Btn variant="outline" onClick={() => setActive(r)}>اتخاذ قرار</Btn>
              ) : (
                <div className="rounded-xl border border-border bg-secondary p-3 text-xs">
                  <div className="mb-1 flex items-center gap-1.5 font-semibold text-brand">
                    <ShieldCheck className="size-3.5" />
                    تم الإجراء بواسطة: {r.actionBy}
                  </div>
                  <div className="text-muted-foreground">{r.managerNote}</div>
                  {r.actionAt && <div className="mt-1 text-muted-foreground/80">{formatDateTime(r.actionAt)}</div>}
                </div>
              )}
            </GlassCard>
          )
        })}
        {!list.length && (
          <GlassCard className="col-span-full p-12 text-center text-muted-foreground">لا توجد طلبات في هذا التصنيف</GlassCard>
        )}
      </div>

      <DecisionModal request={active} onClose={() => setActive(null)} onDecide={decide} />
    </>
  )
}

function DecisionModal({
  request,
  onClose,
  onDecide,
}: {
  request: StaffRequest | null
  onClose: () => void
  onDecide: (r: StaffRequest, s: RequestStatus, note: string) => void
}) {
  const { state } = useStore()
  const [note, setNote] = useState('')
  const [touched, setTouched] = useState(false)
  useEffect(() => {
    setNote('')
    setTouched(false)
  }, [request])
  if (!request) return <Modal open={false} onClose={onClose} title="">{null}</Modal>
  const emp = state.employees.find((e) => e.id === request.employeeId)
  const invalid = note.trim().length < 5

  const act = (s: RequestStatus) => {
    setTouched(true)
    if (invalid) return
    onDecide(request, s, note.trim())
  }

  return (
    <Modal open onClose={onClose} title={`${REQUEST_TYPE_LABEL[request.type]} — ${emp?.name}`} description={request.details}>
      <label htmlFor="mgr-note" className="text-sm font-semibold">
        ملاحظة المدير <span className="text-danger">*</span>
      </label>
      <textarea
        id="mgr-note"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="field mt-1.5"
        placeholder="اكتب سبب القرار أو تفاصيل الخصم (إلزامي)"
        aria-invalid={touched && invalid}
        aria-describedby="mgr-note-err"
      />
      {touched && invalid && (
        <p id="mgr-note-err" className="mt-1 text-xs text-danger">الملاحظة إلزامية (5 أحرف على الأقل) لتوثيق القرار</p>
      )}
      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-brand" />
        سيُسجّل: تم الإجراء بواسطة: {state.managerName}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <Btn variant="success" onClick={() => act('approved')}>
          <Check />
          قبول
        </Btn>
        <Btn variant="danger" onClick={() => act('rejected')}>
          <X />
          رفض
        </Btn>
        <Btn variant="gold" onClick={() => act('approved_deduction')}>
          <MinusCircle />
          قبول مع الخصم
        </Btn>
      </div>
    </Modal>
  )
}

export default function RequestsPage() {
  return (
    <Suspense>
      <RequestsContent />
    </Suspense>
  )
}
