'use client'

import { useState } from 'react'
import { FileSpreadsheet, Info, Lock, LockOpen, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/components/providers/store-provider'
import { Avatar, Btn, GlassCard, Modal, PageHeader, Pill } from '@/components/ui-kit'
import { computePayroll, egp, HOURLY, LATE_RATE_PER_MIN } from '@/lib/mock-data'

function exportExcel(rows: (string | number)[][], filename: string) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const csv = '\uFEFF' + rows.map((r) => r.map(esc).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function PayrollPage() {
  const { state, update } = useStore()
  const [confirming, setConfirming] = useState(false)
  const month = 'سبتمبر 2026'
  const rows = state.employees.map((e) => ({ e, ...computePayroll(e) }))
  const totals = rows.reduce(
    (a, r) => ({
      base: a.base + r.e.baseSalary,
      late: a.late + r.lateDeduction,
      ot: a.ot + r.ot15 + r.ot20,
      adv: a.adv + r.e.advances,
      bonus: a.bonus + r.e.bonus,
      net: a.net + r.net,
    }),
    { base: 0, late: 0, ot: 0, adv: 0, bonus: 0, net: 0 },
  )

  const onExport = () => {
    exportExcel(
      [
        ['الموظف', 'المسمى', 'الأساسي', 'دقائق التأخير', 'خصم التأخير', 'إضافي 1.5x (س)', 'قيمة 1.5x', 'عطلات 2.0x (س)', 'قيمة 2.0x', 'السلف', 'المكافآت', 'الصافي', 'ملاحظات وتفاصيل الاستقطاع والمكافأة'],
        ...rows.map((r) => [r.e.name, r.e.title, r.e.baseSalary, r.e.lateMinutesMonth, r.lateDeduction, r.e.overtime15, r.ot15, r.e.overtime20, r.ot20, r.e.advances, r.e.bonus, r.net, r.notes.join(' | ')]),
        ['الإجمالي', '', totals.base, '', totals.late, '', '', '', totals.ot, totals.adv, totals.bonus, totals.net, ''],
      ],
      `manzuma-payroll-2026-09.csv`,
    )
    toast.success('تم تصدير الشيت المفصل (يفتح مباشرة في Excel)')
  }

  return (
    <>
      <PageHeader
        title="دفتر الرواتب الآلي"
        description={`كشف ${month} — محسوب بالدقيقة من سجلات الحضور الفعلية`}
        actions={
          <>
            <Btn variant="outline" onClick={onExport}>
              <FileSpreadsheet />
              تصدير شيت Excel مفصل
            </Btn>
            {state.payrollLocked ? (
              <Btn variant="success" disabled>
                <Lock />
                تم الاعتماد والترحيل
              </Btn>
            ) : (
              <Btn onClick={() => setConfirming(true)}>
                <Lock />
                اعتماد وترحيل الرواتب نهائياً
              </Btn>
            )}
          </>
        }
      />

      {state.payrollLocked && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-brand/25 bg-brand/10 p-3 text-sm text-brand">
          <ShieldCheck className="size-4" />
          الكشف مقفل ومُرحّل بواسطة: {state.payrollLockedBy} — لا يمكن التعديل. تم إشعار الموظفين بقسائم رواتبهم.
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { l: 'إجمالي الأساسي', v: totals.base, c: 'text-foreground' },
          { l: 'خصومات التأخير', v: -totals.late, c: 'text-danger' },
          { l: 'الإضافي والعطلات', v: totals.ot, c: 'text-info' },
          { l: 'استقطاع السلف', v: -totals.adv, c: 'text-gold' },
          { l: 'صافي المستحق', v: totals.net, c: 'text-brand' },
        ].map((k) => (
          <GlassCard key={k.l} className="p-4">
            <div className="text-xs text-muted-foreground">{k.l}</div>
            <div className={`mt-1 text-xl font-extrabold tabular-nums ${k.c}`}>{egp(k.v)}</div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="p-3 text-start font-medium">الموظف</th>
              <th className="p-3 text-start font-medium">الأساسي</th>
              <th className="p-3 text-start font-medium">خصم التأخير (بالدقيقة)</th>
              <th className="p-3 text-start font-medium">إضافي 1.5x</th>
              <th className="p-3 text-start font-medium">عطلات 2.0x</th>
              <th className="p-3 text-start font-medium">السلف</th>
              <th className="p-3 text-start font-medium">المكافآت</th>
              <th className="p-3 text-start font-medium">الصافي</th>
              <th className="p-3 text-start font-medium">ملاحظات وتفاصيل الاستقطاع والمكافأة</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {rows.map((r) => (
              <tr key={r.e.id} className="border-b border-border align-top last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={r.e.name} className="size-8 text-xs" />
                    <div>
                      <div className="font-semibold">{r.e.name}</div>
                      <div className="text-xs text-muted-foreground">{HOURLY(r.e.baseSalary).toFixed(1)} ج/س</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">{egp(r.e.baseSalary)}</td>
                <td className="p-3">
                  {r.lateDeduction ? (
                    <>
                      <div className="text-danger">- {egp(r.lateDeduction)}</div>
                      <div className="text-xs text-muted-foreground">{r.e.lateMinutesMonth} د × {LATE_RATE_PER_MIN(r.e.baseSalary).toFixed(2)}</div>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="p-3">{r.ot15 ? <span className="text-info">+ {egp(r.ot15)}</span> : <span className="text-muted-foreground">—</span>}</td>
                <td className="p-3">{r.ot20 ? <span className="text-info">+ {egp(r.ot20)}</span> : <span className="text-muted-foreground">—</span>}</td>
                <td className="p-3">{r.e.advances ? <span className="text-gold">- {egp(r.e.advances)}</span> : <span className="text-muted-foreground">—</span>}</td>
                <td className="p-3">{r.e.bonus ? <span className="text-brand">+ {egp(r.e.bonus)}</span> : <span className="text-muted-foreground">—</span>}</td>
                <td className="p-3 text-base font-extrabold text-brand">{egp(r.net)}</td>
                <td className="p-3">
                  <ul className="flex max-w-xs flex-col gap-1 text-xs text-muted-foreground">
                    {r.notes.length ? r.notes.map((n) => <li key={n} className="flex gap-1"><Info className="mt-0.5 size-3 shrink-0" />{n}</li>) : <li>لا توجد استقطاعات</li>}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      <Modal open={confirming} onClose={() => setConfirming(false)} title="اعتماد وترحيل الرواتب نهائياً" size="sm" description="بعد الاعتماد سيُقفل الكشف ولن يمكن تعديله، وستُرسل القسائم للموظفين للتوقيع.">
        <div className="rounded-2xl border border-border bg-secondary p-4 text-center">
          <div className="text-xs text-muted-foreground">إجمالي صافي الرواتب</div>
          <div className="mt-1 text-3xl font-extrabold text-brand tabular-nums">{egp(totals.net)}</div>
          <div className="mt-1 text-xs text-muted-foreground">{rows.length} موظفين · {month}</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Btn variant="outline" onClick={() => setConfirming(false)}>
            <LockOpen />
            إلغاء
          </Btn>
          <Btn
            onClick={() => {
              update((s) => ({ ...s, payrollLocked: true, payrollLockedBy: s.managerName }))
              setConfirming(false)
              toast.success('تم اعتماد وترحيل الرواتب بنجاح')
            }}
          >
            <Lock />
            اعتماد نهائي
          </Btn>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          <Pill tone="muted">سجل تدقيق</Pill> يوقّع باسم {state.managerName}
        </p>
      </Modal>
    </>
  )
}
