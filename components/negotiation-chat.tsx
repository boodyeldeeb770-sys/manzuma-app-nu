'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { uid, useStore } from './providers/store-provider'
import { Btn } from './ui-kit'
import { cn } from '@/lib/utils'

export function NegotiationChat({ threadId, replies, quick, className }: { threadId: string; replies: string[]; quick: string[]; className?: string }) {
  const { state, update } = useStore()
  const messages = state.chats[threadId] ?? []
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // scrollIntoView returns a Promise in recent browsers; an effect must not return it.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages.length, typing])

  const push = (from: 'me' | 'them', value: string) =>
    update((s) => ({
      ...s,
      chats: {
        ...s.chats,
        [threadId]: [...(s.chats[threadId] ?? []), { id: uid(), from, text: value, at: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }],
      },
    }))

  const send = (value: string) => {
    if (!value.trim()) return
    push('me', value.trim())
    setText('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      push('them', replies[Math.floor(Math.random() * replies.length)])
    }, 1300)
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex min-h-64 flex-1 flex-col gap-2 overflow-y-auto rounded-2xl border border-border bg-secondary p-3" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={cn('flex max-w-[82%] flex-col', m.from === 'me' ? 'self-start items-start' : 'self-end items-end')}>
            <div
              className={cn(
                'rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                m.from === 'me' ? 'rounded-ss-sm bg-brand text-primary-foreground' : 'rounded-se-sm border border-border bg-popover',
              )}
            >
              {m.text}
            </div>
            <span className="mt-0.5 px-1 text-[10px] tabular-nums text-muted-foreground">{m.at}</span>
          </div>
        ))}
        {typing && (
          <div className="flex gap-1 self-end rounded-2xl border border-border bg-popover px-3.5 py-3" aria-label="يكتب الآن">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}
        {!messages.length && !typing && <p className="m-auto text-xs text-muted-foreground">ابدأ المحادثة — الرسائل خاصة ومشفرة</p>}
        <div ref={endRef} />
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {quick.map((q) => (
          <button key={q} onClick={() => send(q)} className="shrink-0 rounded-full border border-border bg-secondary px-3 py-1 text-xs hover:bg-accent">
            {q}
          </button>
        ))}
      </div>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          send(text)
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} className="field" placeholder="اكتب رسالة..." aria-label="رسالة" />
        <Btn type="submit" size="icon" aria-label="إرسال">
          <Send className="rtl:-scale-x-100" />
        </Btn>
      </form>
    </div>
  )
}
