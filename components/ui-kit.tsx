'use client'

import { useEffect, useId, useRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function GlassCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('glass rounded-2xl', className)} {...props} />
}

export const btnVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-brand text-primary-foreground shadow-lg shadow-brand/25 hover:brightness-110',
        info: 'bg-info text-white shadow-lg shadow-info/25 hover:brightness-110',
        outline: 'border border-border bg-secondary text-foreground hover:bg-accent',
        ghost: 'text-foreground hover:bg-accent',
        danger: 'bg-danger/12 text-danger border border-danger/25 hover:bg-danger/20',
        success: 'bg-brand/12 text-brand border border-brand/25 hover:bg-brand/20',
        gold: 'bg-gold/12 text-gold border border-gold/30 hover:bg-gold/20',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'size-10',
        'icon-sm': 'size-8',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export function Btn({
  className,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof btnVariants>) {
  return <button className={cn(btnVariants({ variant, size }), className)} {...props} />
}

const pillTones = {
  brand: 'bg-brand/12 text-brand border-brand/25',
  info: 'bg-info/12 text-info border-info/25',
  gold: 'bg-gold/12 text-gold border-gold/30',
  danger: 'bg-danger/12 text-danger border-danger/25',
  muted: 'bg-secondary text-muted-foreground border-border',
}

export function Pill({
  tone = 'muted',
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof pillTones }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold [&_svg]:size-3',
        pillTones[tone],
        className,
      )}
      {...props}
    />
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-balance text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-pretty text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: (id: string) => React.ReactNode
  className?: string
}) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children(id)}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-border bg-popover p-5 shadow-2xl outline-none animate-in fade-in slide-in-from-bottom-4 sm:rounded-3xl sm:p-6',
          widths[size],
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-bold">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          <Btn variant="ghost" size="icon-sm" onClick={onClose} aria-label="إغلاق">
            <X />
          </Btn>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: {
  value: T
  onChange: (v: T) => void
  items: { value: T; label: string; count?: number }[]
  className?: string
}) {
  return (
    <div role="tablist" className={cn('flex gap-1 overflow-x-auto rounded-2xl border border-border bg-secondary p-1', className)}>
      {items.map((it) => (
        <button
          key={it.value}
          role="tab"
          aria-selected={value === it.value}
          onClick={() => onChange(it.value)}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition',
            value === it.value ? 'bg-brand text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {it.label}
          {typeof it.count === 'number' && (
            <span
              className={cn(
                'rounded-full px-1.5 text-[11px]',
                value === it.value ? 'bg-black/15' : 'bg-accent text-foreground',
              )}
            >
              {it.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .replace(/^(د\.|م\.|أ\.)\s*/, '')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/25 to-info/25 text-sm font-bold text-foreground ring-1 ring-border',
        className,
      )}
    >
      {initials}
    </span>
  )
}

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`تقييم ${value} من 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)))
        return (
          <svg key={i} viewBox="0 0 20 20" className="size-3.5" aria-hidden>
            <defs>
              <linearGradient id={`s${i}-${value}`} x1="1" x2="0">
                <stop offset={`${fill * 100}%`} stopColor="var(--gold)" />
                <stop offset={`${fill * 100}%`} stopColor="var(--border)" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#s${i}-${value})`}
              d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z"
            />
          </svg>
        )
      })}
    </span>
  )
}
