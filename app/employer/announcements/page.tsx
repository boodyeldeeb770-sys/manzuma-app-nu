'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, Megaphone, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AnnouncementStats, useAnnouncementSender } from '@/components/announcements'
import { useStore } from '@/components/providers/store-provider'
import { Avatar, Btn, GlassCard, PageHeader, Pill } from '@/components/ui-kit'
import { formatDateTime } from '@/lib/status'
import { cn } from '@/lib/utils'

export default function AnnouncementsPage() {
  const { state, update } = useStore()
  const { sendAnnouncement } = useAnnouncementSender()
  const [text, setText] = useState('')
  const [important, setImportant] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const list = state.announcements ?? []
  const total = state.employees.length
  const active = list.find((a) => a.id === selected) ?? list[0]
  const name = (id: string) => state.employees.find((e) => e.id === id)?.name ?? 'موظف'

  return (
    <>
      <PageHeader title="الإعلانات وتفاعل الفريق" description="كل الإعلانات المرسلة مع حالة القراءة والتأكيد وردود الموظفين" />

      <GlassCard className="mb-6 p-5">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!text.trim()) return
            sendAnnouncement(text.trim(), important)
            setText('')
            setImportant(false)
            setSelected(null)
            toast.success(`تم إرسال الإعلان إلى ${total} موظفين`)
          }}
        >
          <label htmlFor="new-announcement" className="text-sm font-semibold">
            إعلان جديد
          </label>
          <textarea id="new-announcement" rows={3} className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب رسالتك للفريق..." />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} className="size-4 accent-[var(--brand)]" />
              إعلان مهم (يتطلب تأكيد اطلاع)
            </label>
            <Btn type="submit" disabled={!text.trim()}>
              <Megaphone />
              إرسال للفريق
            </Btn>
          </div>
        </form>
      </GlassCard>

      {!list.length ? (
        <GlassCard className="p-10 text-center text-sm text-muted-foreground">لم يتم إرسال أي إعلانات بعد</GlassCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <ul className="flex flex-col gap-3" aria-label="الإعلانات المرسلة">
            {list.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => setSelected(a.id)}
                  aria-pressed={active?.id === a.id}
                  className={cn(
                    'glass w-full rounded-2xl p-4 text-start transition hover:ring-1 hover:ring-brand/30',
                    active?.id === a.id && 'ring-1 ring-brand/50',
                  )}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDateTime(a.at)}</span>
                    {a.important && <Pill tone="danger">مهم</Pill>}
                    <span className="ms-auto tabular-nums">
                      {a.readBy.length}/{total} قراءة · {a.replies.length} رد
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed">{a.text}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${total ? (a.readBy.length / total) * 100 : 0}%` }} />
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {active && (
            <GlassCard className="flex flex-col gap-5 p-5">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground">
                    أرسله {active.by} · {formatDateTime(active.at)}
                  </div>
                  <p className="mt-2 leading-relaxed">{active.text}</p>
                </div>
                <Btn
                  variant="ghost"
                  size="icon"
                  aria-label="حذف الإعلان"
                  onClick={() => {
                    update((s) => ({ ...s, announcements: s.announcements.filter((a) => a.id !== active.id) }))
                    setSelected(null)
                    toast.success('تم حذف الإعلان')
                  }}
                >
                  <Trash2 className="text-danger" />
                </Btn>
              </div>

              <AnnouncementStats a={active} total={total} />

              <div>
                <h3 className="mb-2 text-sm font-bold">ردود الموظفين</h3>
                {active.replies.length ? (
                  <ul className="flex flex-col gap-2">
                    {active.replies.map((r) => (
                      <li key={r.id} className="flex gap-3 rounded-xl border border-border bg-secondary/50 p-3">
                        <Avatar name={name(r.employeeId)} className="size-8" />
                        <div className="min-w-0">
                          <div className="text-xs">
                            <span className="font-semibold">{name(r.employeeId)}</span>
                            <span className="ms-2 text-muted-foreground">{formatDateTime(r.at)}</span>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed">{r.text}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">لا توجد ردود حتى الآن</p>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-bold">حالة كل موظف</h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {state.employees.map((e) => {
                    const read = active.readBy.includes(e.id)
                    const acked = active.ackBy.includes(e.id)
                    return (
                      <li key={e.id} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm">
                        <Avatar name={e.name} className="size-7" />
                        <span className="min-w-0 flex-1 truncate">{e.name}</span>
                        {acked ? (
                          <Pill tone="brand">
                            <CheckCircle2 className="size-3" /> أكّد
                          </Pill>
                        ) : read ? (
                          <Pill tone="info">قرأ</Pill>
                        ) : (
                          <Pill tone="muted">
                            <Clock className="size-3" /> لم يقرأ
                          </Pill>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </>
  )
}
