'use client'

import { useState } from 'react'
import { CheckCircle2, Eye, Megaphone, MessageSquareReply, Send } from 'lucide-react'
import { toast } from 'sonner'
import { uid, useStore, withNotification } from './providers/store-provider'
import { Btn, GlassCard, Pill } from './ui-kit'
import { formatDateTime } from '@/lib/status'
import type { Announcement } from '@/lib/types'
import { cn } from '@/lib/utils'

const SIMULATED_REPLIES = ['تمام، تم العلم.', 'شكراً على التنبيه.', 'هل يمكن توضيح التفاصيل أكثر؟', 'سأكون موجوداً إن شاء الله.']

export function useAnnouncementSender() {
  const { state, update } = useStore()

  const sendAnnouncement = (text: string, important: boolean) => {
    const id = uid()
    update((s) =>
      withNotification(
        {
          ...s,
          announcements: [{ id, text, by: s.managerName, at: new Date().toISOString(), important, readBy: [], ackBy: [], replies: [] }, ...(s.announcements ?? [])],
        },
        { audience: 'employee', title: important ? 'إعلان مهم من الإدارة' : 'إعلان جديد من الإدارة', body: text.slice(0, 90), href: '/employee#announcements' },
      ),
    )

    // Demo only: simulate teammates opening and reacting to the announcement over time.
    const others = state.employees.filter((e) => e.id !== state.me.employeeId).map((e) => e.id)
    others.slice(0, 5).forEach((empId, i) => {
      setTimeout(() => {
        update((s) => ({
          ...s,
          announcements: s.announcements.map((a) =>
            a.id !== id
              ? a
              : {
                  ...a,
                  readBy: a.readBy.includes(empId) ? a.readBy : [...a.readBy, empId],
                  ackBy: important && i % 2 === 0 && !a.ackBy.includes(empId) ? [...a.ackBy, empId] : a.ackBy,
                  replies:
                    i === 1
                      ? [...a.replies, { id: uid(), employeeId: empId, text: SIMULATED_REPLIES[Math.floor(Math.random() * SIMULATED_REPLIES.length)], at: new Date().toISOString() }]
                      : a.replies,
                },
          ),
        }))
      }, 2500 + i * 2200)
    })
  }

  return { sendAnnouncement }
}

export function EmployeeAnnouncements() {
  const { state, update } = useStore()
  const meId = state.me.employeeId
  const me = state.employees.find((e) => e.id === meId)
  const [replyFor, setReplyFor] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const list = state.announcements ?? []

  const patch = (id: string, fn: (a: Announcement) => Announcement) =>
    update((s) => ({ ...s, announcements: s.announcements.map((a) => (a.id === id ? fn(a) : a)) }))

  const markRead = (a: Announcement) => {
    if (!a.readBy.includes(meId)) patch(a.id, (x) => ({ ...x, readBy: [...x.readBy, meId] }))
  }

  const ack = (a: Announcement) => {
    patch(a.id, (x) => ({ ...x, readBy: x.readBy.includes(meId) ? x.readBy : [...x.readBy, meId], ackBy: [...x.ackBy, meId] }))
    toast.success('تم تأكيد الاطلاع على الإعلان')
  }

  const sendReply = (a: Announcement) => {
    const text = reply.trim()
    if (!text) return
    update((s) =>
      withNotification(
        {
          ...s,
          announcements: s.announcements.map((x) =>
            x.id === a.id
              ? { ...x, readBy: x.readBy.includes(meId) ? x.readBy : [...x.readBy, meId], replies: [...x.replies, { id: uid(), employeeId: meId, text, at: new Date().toISOString() }] }
              : x,
          ),
        },
        { audience: 'employer', title: 'رد على إعلان', body: `${me?.name ?? 'موظف'}: ${text.slice(0, 80)}`, href: '/employer/announcements' },
      ),
    )
    setReply('')
    setReplyFor(null)
    toast.success('تم إرسال ردك للإدارة')
  }

  if (!list.length) return null

  return (
    <GlassCard id="announcements" className="scroll-mt-24 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Megaphone className="size-5 text-gold" />
        <h2 className="font-bold">إعلانات الإدارة</h2>
        <Pill tone="gold" className="ms-auto">
          {list.filter((a) => !a.readBy.includes(meId)).length} غير مقروءة
        </Pill>
      </div>
      <ul className="flex flex-col gap-3">
        {list.slice(0, 4).map((a) => {
          const read = a.readBy.includes(meId)
          const acked = a.ackBy.includes(meId)
          return (
            <li
              key={a.id}
              onMouseEnter={() => markRead(a)}
              onFocus={() => markRead(a)}
              className={cn('rounded-2xl border p-4', read ? 'border-border bg-secondary/50' : 'border-gold/30 bg-gold/5')}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{a.by}</span>
                <span>{formatDateTime(a.at)}</span>
                {a.important && <Pill tone="danger">مهم</Pill>}
              </div>
              <p className="mt-2 text-sm leading-relaxed">{a.text}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {a.important &&
                  (acked ? (
                    <Pill tone="brand">
                      <CheckCircle2 className="size-3.5" /> تم تأكيد الاطلاع
                    </Pill>
                  ) : (
                    <Btn size="sm" onClick={() => ack(a)}>
                      <CheckCircle2 /> تأكيد الاطلاع
                    </Btn>
                  ))}
                <Btn size="sm" variant="outline" onClick={() => setReplyFor(replyFor === a.id ? null : a.id)}>
                  <MessageSquareReply /> رد
                </Btn>
              </div>
              {replyFor === a.id && (
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendReply(a)
                  }}
                >
                  <input autoFocus value={reply} onChange={(e) => setReply(e.target.value)} className="field" placeholder="اكتب ردك للإدارة..." aria-label="الرد على الإعلان" />
                  <Btn type="submit" size="icon" aria-label="إرسال الرد">
                    <Send className="rtl:-scale-x-100" />
                  </Btn>
                </form>
              )}
            </li>
          )
        })}
      </ul>
    </GlassCard>
  )
}

export function AnnouncementStats({ a, total }: { a: Announcement; total: number }) {
  const readPct = total ? Math.round((a.readBy.length / total) * 100) : 0
  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <Stat icon={<Eye className="size-4" />} label="قرأ الإعلان" value={`${a.readBy.length}/${total}`} sub={`${readPct}%`} />
      <Stat icon={<CheckCircle2 className="size-4" />} label="أكّد الاطلاع" value={a.important ? `${a.ackBy.length}/${total}` : '—'} />
      <Stat icon={<MessageSquareReply className="size-4" />} label="الردود" value={String(a.replies.length)} />
    </div>
  )
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/60 p-3">
      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-lg font-extrabold tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground tabular-nums">{sub}</div>}
    </div>
  )
}
