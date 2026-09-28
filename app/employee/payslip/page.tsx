'use client'

import { useState } from 'react'
import { AlarmClock, ArrowDownCircle, ArrowUpCircle, CheckCircle2, PenLine, Receipt, ShieldCheck, Timer } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/components/providers/store-provider'
import { Btn, GlassCard, Modal, PageHeader, Pill } from '@/components/ui-kit'
import { computePayroll, egp } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const MONTH = new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })

export default function PayslipPage() {
  const { state, update } = useStore()
  const me = state.employees.find((e) => e.id === state.me.employeeId) ?? state.employees[0]
  const p = computePayroll(me)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const confirmedAt = state.me.payslipConfirmedAt

  const rows = (
    [
      { label: 'الراتب الأساسي', value: me.baseSalary, kind: 'base' },
      { label: `ساعات إضافية (${me.overtime15} س × 1.5)`, value: p.ot15, kind: 'add' },
      { label: `عطلات رسمية (${me.overtime20} س × 2.0)`, value: p.ot20, kind: 'add' },
      { label: 'مكافأة الالتزام', value: me.bonus, kind: 'add' },
      { label: `خصم التأخير (${me.lateMinutesMonth} د)`, value: p.lateDeduction, kind: 'sub' },
      { label: 'استقطاع السلف', value: me.advances, kind: 'sub' },
    ] as { label: string; value: number; kind: 'add' | 'sub' | 'base' }[]
  ).filter((r) => r.value > 0 || r.kind === 'base')

  const confirm = () => {
    update((s) => ({ ...s, me: { ...s.me, payslipConfirmedAt: new Date().toISOString() } }))
    toast.success('تم توثيق استلام الراتب بتوقيعك الرقمي')
    setConfirmOpen(false)
  }

  return (
    <>
      <PageHeader
        title="كشف راتبي"
        description={`تفصيل شفّاف لكل بند في راتب ${MONTH} — بدون أي خصومات خفية`}
        actions={
          confirmedAt ? (
            <Pill tone="brand">
              <CheckCircle2 className="size-3.5" />
              مُوثّق
            </Pill>
          ) : (
            <Btn onClick={() => setConfirmOpen(true)}>
              <PenLine />
              تأكيد استلام الراتب
            </Btn>
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <GlassCard className="flex flex-col gap-4 p-6 lg:col-span-3">
          <div className="flex items-center gap-2">
            <Receipt className="size-5 text-brand" />
            <h2 className="font-bold">تفصيل البنود</h2>
          </div>

          <ul className="flex flex-col divide-y divide-border">
            {rows.map((r) => (
              <li key={r.label} className="flex items-center gap-3 py-3">
                <span
                  className={cn(
                    'inline-flex size-8 items-center justify-center rounded-lg',
                    r.kind === 'sub' ? 'bg-danger/12 text-danger' : 'bg-brand/12 text-brand',
                  )}
                >
                  {r.kind === 'sub' ? <ArrowDownCircle className="size-4" /> : <ArrowUpCircle className="size-4" />}
                </span>
                <span className="flex-1 text-sm">{r.label}</span>
                <span className={cn('font-semibold tabular-nums', r.kind === 'sub' && 'text-danger')} dir="ltr">
                  {r.kind === 'sub' ? '-' : ''}
                  {egp(r.value)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-2 flex items-center justify-between rounded-2xl border border-brand/25 bg-brand/10 p-4">
            <span className="font-bold">صافي المستحق</span>
            <span className="font-heading text-2xl font-extrabold tabular-nums text-brand" dir="ltr">
              {egp(p.net)}
            </span>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <GlassCard className="flex flex-col gap-3 p-5">
            <h3 className="font-bold">ملاحظات الحساب</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {p.notes.length ? (
                p.notes.map((n) => (
                  <li key={n} className="flex items-start gap-2 rounded-xl bg-secondary px-3 py-2 text-muted-foreground">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
                    {n}
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">لا توجد تعديلات على الراتب الأساسي هذا الشهر</li>
              )}
            </ul>
          </GlassCard>

          <div className="grid grid-cols-2 gap-3">
            <GlassCard className="flex flex-col items-center gap-1 p-4 text-center">
              <AlarmClock className="size-5 text-danger" />
              <div className="text-lg font-extrabold tabular-nums">{me.lateMinutesMonth} د</div>
              <div className="text-xs text-muted-foreground">تأخير الشهر</div>
            </GlassCard>
            <GlassCard className="flex flex-col items-center gap-1 p-4 text-center">
              <Timer className="size-5 text-info" />
              <div className="text-lg font-extrabold tabular-nums">{me.overtime15 + me.overtime20} س</div>
              <div className="text-xs text-muted-foreground">ساعات إضافية</div>
            </GlassCard>
          </div>

          <GlassCard className={cn('flex flex-col gap-2 p-5', confirmedAt ? 'border-brand/25' : '')}>
            {confirmedAt ? (
              <>
                <div className="flex items-center gap-2 text-brand">
                  <CheckCircle2 className="size-5" />
                  <h3 className="font-bold">تم توثيق الاستلام</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  وثّقت استلام راتب {MONTH} بتاريخ{' '}
                  {new Date(confirmedAt).toLocaleString('ar-EG', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}. هذا التوقيع الرقمي مُسجّل لدى الإدارة.
                </p>
              </>
            ) : (
              <>
                <h3 className="font-bold">التوقيع القانوني</h3>
                <p className="text-xs text-muted-foreground">
                  بالضغط على «تأكيد استلام الراتب» فأنت تُقرّ رقمياً باطّلاعك على البنود واستلامك صافي المستحق.
                </p>
                <Btn className="mt-1" onClick={() => setConfirmOpen(true)}>
                  <PenLine />
                  تأكيد استلام الراتب
                </Btn>
              </>
            )}
          </GlassCard>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="تأكيد استلام الراتب"
        description={`راتب ${MONTH} — صافي ${egp(p.net)}`}
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2 rounded-xl border border-border bg-secondary p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
            سيُسجّل توقيعك الرقمي باسم {me.name} مع الوقت والتاريخ كإقرار باستلام الراتب.
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Btn variant="outline" onClick={() => setConfirmOpen(false)}>
              إلغاء
            </Btn>
            <Btn variant="success" onClick={confirm}>
              <CheckCircle2 />
              أقرّ بالاستلام
            </Btn>
          </div>
        </div>
      </Modal>
    </>
  )
}
