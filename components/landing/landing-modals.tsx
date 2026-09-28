'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, KeyRound, Loader2, Send, ShieldCheck, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { usePreferences } from '../providers/preferences-provider'
import { Btn, Field, Modal } from '../ui-kit'
import { POLICIES } from './content'
import { cn } from '@/lib/utils'

export function PoliciesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = usePreferences()
  return (
    <Modal open={open} onClose={onClose} title={t('policiesTitle')} size="lg">
      <div className="flex flex-col gap-3">
        {POLICIES.map((p, i) => (
          <details key={p.title.en} open={i === 0} className="group rounded-2xl border border-border bg-secondary p-4">
            <summary className="cursor-pointer list-none font-bold marker:hidden">
              <span className="me-2 text-brand">{String(i + 1).padStart(2, '0')}</span>
              {p.title[lang]}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body[lang]}</p>
          </details>
        ))}
      </div>
    </Modal>
  )
}

type Msg = { from: 'me' | 'agent'; text: string }

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = usePreferences()
  const [messages, setMessages] = useState<Msg[]>([
    { from: 'agent', text: lang === 'ar' ? 'أهلاً بك في دعم منظومة! أنا مريم، كيف أقدر أساعدك النهارده؟' : 'Welcome to Manzuma support! I am Mariam, how can I help?' },
  ])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, typing])

  const quick = lang === 'ar' ? ['كيف أفعّل الحضور بالـ QR؟', 'طرق الدفع المتاحة', 'نسيت كلمة المرور'] : ['How to enable QR attendance?', 'Payment methods', 'Forgot password']

  const send = (value: string) => {
    if (!value.trim()) return
    setMessages((m) => [...m, { from: 'me', text: value }])
    setText('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((m) => [
        ...m,
        {
          from: 'agent',
          text:
            lang === 'ar'
              ? 'شكراً لتواصلك! تم فتح تذكرة رقم #' + Math.floor(1000 + Math.random() * 9000) + ' وسيتواصل معك أحد المختصين خلال دقائق. يمكنك أيضاً مراجعة مركز المساعدة.'
              : 'Thanks! Ticket #' + Math.floor(1000 + Math.random() * 9000) + ' is open, a specialist will reply within minutes.',
        },
      ])
    }, 1200)
  }

  return (
    <Modal open={open} onClose={onClose} title={t('helpTitle')} description={lang === 'ar' ? 'متوسط وقت الرد: أقل من دقيقتين' : 'Avg. reply time: under 2 min'}>
      <div className="flex h-80 flex-col gap-2 overflow-y-auto rounded-2xl border border-border bg-secondary p-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
              m.from === 'me' ? 'self-start bg-brand text-primary-foreground' : 'self-end border border-border bg-popover',
            )}
          >
            {m.text}
          </div>
        ))}
        {typing && (
          <div className="flex items-center gap-2 self-end rounded-2xl border border-border bg-popover px-3.5 py-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            {lang === 'ar' ? 'مريم تكتب...' : 'Mariam is typing...'}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {quick.map((q) => (
          <button key={q} onClick={() => send(q)} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs hover:bg-accent">
            {q}
          </button>
        ))}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          send(text)
        }}
      >
        <input className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder={lang === 'ar' ? 'اكتب رسالتك...' : 'Type a message...'} aria-label="رسالة" />
        <Btn type="submit" size="icon" aria-label="إرسال">
          <Send className="rtl:-scale-x-100" />
        </Btn>
      </form>
    </Modal>
  )
}

type AuthStep = 'login' | 'forgot' | 'otp' | 'reset'

export function AuthModal({
  open,
  onClose,
  initialRole = 'employer',
}: {
  open: boolean
  onClose: () => void
  initialRole?: 'employer' | 'employee'
}) {
  const router = useRouter()
  const { lang } = usePreferences()
  const ar = lang === 'ar'
  const [role, setRole] = useState(initialRole)
  const [step, setStep] = useState<AuthStep>('login')
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [seconds, setSeconds] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => setRole(initialRole), [initialRole])
  useEffect(() => {
    if (!open) {
      setStep('login')
      setOtp(['', '', '', '', '', ''])
    }
  }, [open])
  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const wait = (fn: () => void) => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      fn()
    }, 700)
  }

  const titles: Record<AuthStep, string> = {
    login: ar ? 'تسجيل الدخول' : 'Sign in',
    forgot: ar ? 'نسيت كلمة المرور' : 'Forgot password',
    otp: ar ? 'رمز التحقق' : 'Verification code',
    reset: ar ? 'كلمة مرور جديدة' : 'New password',
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={titles[step]}
      size="sm"
      description={step === 'otp' ? (ar ? 'أرسلنا رمزاً من 6 أرقام إلى هاتفك (رمز العرض: 123456)' : 'We sent a 6-digit code (demo: 123456)') : undefined}
    >
      {step === 'login' && (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            wait(() => {
              toast.success(ar ? 'تم تسجيل الدخول بنجاح' : 'Signed in')
              router.push(role === 'employer' ? '/employer' : '/employee')
            })
          }}
        >
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="نوع الحساب">
            {(
              [
                { id: 'employer', icon: Briefcase, l: ar ? 'صاحب عمل' : 'Employer' },
                { id: 'employee', icon: UserRound, l: ar ? 'موظف / باحث' : 'Employee' },
              ] as const
            ).map((r) => (
              <button
                type="button"
                key={r.id}
                role="radio"
                aria-checked={role === r.id}
                onClick={() => setRole(r.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-sm font-semibold transition',
                  role === r.id ? 'border-brand bg-brand/10 text-brand' : 'border-border bg-secondary text-muted-foreground',
                )}
              >
                <r.icon className="size-5" />
                {r.l}
              </button>
            ))}
          </div>
          <Field label={ar ? 'رقم الهاتف أو البريد' : 'Phone or email'}>
            {(id) => <input id={id} className="field" defaultValue={role === 'employer' ? 'karim@elite.eg' : '01012345678'} required dir="ltr" />}
          </Field>
          <Field label={ar ? 'كلمة المرور' : 'Password'}>
            {(id) => <input id={id} type="password" className="field" defaultValue="demo-password" required dir="ltr" />}
          </Field>
          <button type="button" onClick={() => setStep('forgot')} className="-mt-2 self-end text-xs font-semibold text-info hover:underline">
            {ar ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
          </button>
          <Btn type="submit" size="lg" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {ar ? 'دخول' : 'Sign in'}
          </Btn>
          <p className="text-center text-xs text-muted-foreground">{ar ? 'حساب تجريبي — البيانات معبأة مسبقاً' : 'Demo account — prefilled credentials'}</p>
        </form>
      )}

      {step === 'forgot' && (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            wait(() => {
              setStep('otp')
              setSeconds(60)
              setTimeout(() => otpRefs.current[0]?.focus(), 50)
            })
          }}
        >
          <Field label={ar ? 'رقم الهاتف المسجل' : 'Registered phone'}>
            {(id) => <input id={id} className="field" placeholder="01XXXXXXXXX" required dir="ltr" inputMode="tel" pattern="01[0-9]{9}" />}
          </Field>
          <Btn type="submit" size="lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <KeyRound />}
            {ar ? 'إرسال رمز التحقق' : 'Send code'}
          </Btn>
          <Btn type="button" variant="ghost" onClick={() => setStep('login')}>
            {ar ? 'العودة لتسجيل الدخول' : 'Back to sign in'}
          </Btn>
        </form>
      )}

      {step === 'otp' && (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (otp.join('') !== '123456') {
              toast.error(ar ? 'رمز غير صحيح، حاول مجدداً' : 'Invalid code')
              return
            }
            wait(() => setStep('reset'))
          }}
        >
          <div className="flex justify-center gap-2" dir="ltr">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  otpRefs.current[i] = el
                }}
                value={d}
                inputMode="numeric"
                maxLength={1}
                aria-label={`الرقم ${i + 1}`}
                className="field size-12 p-0 text-center text-lg font-bold"
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '')
                  const next = [...otp]
                  next[i] = v
                  setOtp(next)
                  if (v && i < 5) otpRefs.current[i + 1]?.focus()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
                }}
                onPaste={(e) => {
                  const v = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
                  if (v.length === 6) {
                    e.preventDefault()
                    setOtp(v.split(''))
                  }
                }}
              />
            ))}
          </div>
          <Btn type="submit" size="lg" disabled={loading || otp.some((d) => !d)}>
            {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
            {ar ? 'تحقق' : 'Verify'}
          </Btn>
          <button
            type="button"
            disabled={seconds > 0}
            onClick={() => {
              setSeconds(60)
              toast.info(ar ? 'تم إعادة إرسال الرمز' : 'Code resent')
            }}
            className="text-center text-xs font-semibold text-info disabled:text-muted-foreground"
          >
            {seconds > 0 ? (ar ? `إعادة الإرسال بعد ${seconds} ث` : `Resend in ${seconds}s`) : ar ? 'إعادة إرسال الرمز' : 'Resend code'}
          </button>
        </form>
      )}

      {step === 'reset' && (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            if (fd.get('p1') !== fd.get('p2')) {
              toast.error(ar ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match')
              return
            }
            wait(() => {
              toast.success(ar ? 'تم تحديث كلمة المرور' : 'Password updated')
              setStep('login')
            })
          }}
        >
          <Field label={ar ? 'كلمة المرور الجديدة' : 'New password'} hint={ar ? '8 أحرف على الأقل' : 'At least 8 characters'}>
            {(id) => <input id={id} name="p1" type="password" minLength={8} required className="field" dir="ltr" />}
          </Field>
          <Field label={ar ? 'تأكيد كلمة المرور' : 'Confirm password'}>
            {(id) => <input id={id} name="p2" type="password" minLength={8} required className="field" dir="ltr" />}
          </Field>
          <Btn type="submit" size="lg" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {ar ? 'حفظ كلمة المرور' : 'Save password'}
          </Btn>
        </form>
      )}
    </Modal>
  )
}
