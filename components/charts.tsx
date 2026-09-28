'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from './ui-kit'

export function useCountUp(target: number, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Number((target * eased).toFixed(decimals)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, decimals])
  return value
}

export function RadialRing({
  value,
  size = 200,
  stroke = 16,
  label,
  sublabel,
  from = 'var(--brand)',
  to = 'var(--info)',
  decimals = 1,
}: {
  value: number
  size?: number
  stroke?: number
  label?: string
  sublabel?: string
  from?: string
  to?: string
  decimals?: number
}) {
  const id = useId().replace(/:/g, '')
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const shown = useCountUp(value, 1400, decimals)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])
  const offset = c - (mounted ? value / 100 : 0) * c

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img" aria-label={`${value}%`}>
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#g-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          filter={`url(#glow-${id})`}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-heading text-4xl font-extrabold tabular-nums tracking-tight" dir="ltr">
          {shown.toFixed(decimals)}%
        </span>
        {label && <span className="mt-1 text-sm font-semibold text-brand">{label}</span>}
        {sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  )
}

function splinePath(pts: [number, number][]) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const t = 0.18
    const c1x = p1[0] + (p2[0] - p0[0]) * t
    const c1y = p1[1] + (p2[1] - p0[1]) * t
    const c2x = p2[0] - (p3[0] - p1[0]) * t
    const c2y = p2[1] - (p3[1] - p1[1]) * t
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`
  }
  return d
}

export interface Series {
  name: string
  data: number[]
  color: string
  suffix?: string
}

export function AreaChart({
  labels,
  series,
  height = 240,
  min,
  max,
}: {
  labels: string[]
  series: Series[]
  height?: number
  min?: number
  max?: number
}) {
  const id = useId().replace(/:/g, '')
  const [hover, setHover] = useState<number | null>(null)
  const W = 600
  const H = height
  const pad = { t: 16, r: 12, b: 28, l: 12 }
  const all = series.flatMap((s) => s.data)
  const lo = min ?? Math.min(...all) * 0.9
  const hi = max ?? Math.max(...all) * 1.05
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / (labels.length - 1)
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b)

  const paths = useMemo(
    () =>
      series.map((s) => {
        const pts = s.data.map((v, i) => [x(i), y(v)] as [number, number])
        const line = splinePath(pts)
        const area = `${line} L ${x(s.data.length - 1)} ${H - pad.b} L ${x(0)} ${H - pad.b} Z`
        return { line, area }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, lo, hi, labels.length, H],
  )

  return (
    <div className="relative w-full" dir="ltr">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={series.map((s) => s.name).join('، ')}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
          const px = ((e.clientX - rect.left) / rect.width) * W
          const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (labels.length - 1))
          setHover(Math.max(0, Math.min(labels.length - 1, i)))
        }}
      >
        <defs>
          {series.map((s, i) => (
            <linearGradient key={i} id={`a-${id}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={pad.l}
            x2={W - pad.r}
            y1={pad.t + f * (H - pad.t - pad.b)}
            y2={pad.t + f * (H - pad.t - pad.b)}
            stroke="var(--border)"
            strokeDasharray="4 6"
          />
        ))}
        {paths.map((p, i) => (
          <g key={i}>
            <path d={p.area} fill={`url(#a-${id}-${i})`} />
            <path
              d={p.line}
              fill="none"
              stroke={series[i].color}
              strokeWidth="3"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              className="[animation:draw_1.6s_ease-out_forwards]"
              style={{ strokeDashoffset: 1 }}
            />
          </g>
        ))}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="var(--muted-foreground)" strokeOpacity="0.4" />
            {series.map((s, i) => (
              <circle key={i} cx={x(hover)} cy={y(s.data[hover])} r="5" fill="var(--background)" stroke={s.color} strokeWidth="3" />
            ))}
          </g>
        )}
        {labels.map((l, i) => (
          <text key={l + i} x={x(i)} y={H - 6} textAnchor="middle" className="fill-muted-foreground text-[12px]">
            {l}
          </text>
        ))}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-xl"
          style={{ left: `clamp(0px, calc(${(x(hover) / W) * 100}% - 70px), calc(100% - 150px))` }}
          dir="rtl"
        >
          <div className="mb-1 font-bold">{labels[hover]}</div>
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ background: s.color }} />
              <span className="text-muted-foreground">{s.name}:</span>
              <span className="font-semibold tabular-nums">
                {s.data[hover]}
                {s.suffix}
              </span>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes draw{to{stroke-dashoffset:0}}`}</style>
    </div>
  )
}

export function Sparkline({ data, color = 'var(--brand)', className }: { data: number[]; color?: string; className?: string }) {
  const id = useId().replace(/:/g, '')
  const W = 100
  const H = 32
  const lo = Math.min(...data)
  const hi = Math.max(...data)
  const pts = data.map((v, i) => [(i / (data.length - 1)) * W, H - 2 - ((v - lo) / (hi - lo || 1)) * (H - 4)] as [number, number])
  const line = splinePath(pts)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn('h-8 w-24', className)} preserveAspectRatio="none" aria-hidden dir="ltr">
      <defs>
        <linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L ${W} ${H} L 0 ${H} Z`} fill={`url(#sp-${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export function KpiCard({
  label,
  value,
  trend,
  trendLabel = 'هذا الأسبوع',
  data,
  color = 'var(--brand)',
  icon: Icon,
  invertTrend,
}: {
  label: string
  value: string
  trend: number
  trendLabel?: string
  data: number[]
  color?: string
  icon: React.ComponentType<{ className?: string }>
  invertTrend?: boolean
}) {
  const good = invertTrend ? trend <= 0 : trend >= 0
  return (
    <GlassCard className="group relative overflow-hidden p-4 transition hover:-translate-y-0.5">
      <div
        className="absolute -top-10 -left-10 size-28 rounded-full opacity-20 blur-2xl transition group-hover:opacity-40"
        style={{ background: color }}
        aria-hidden
      />
      <div className="relative flex items-start justify-between">
        <span className="inline-flex size-9 items-center justify-center rounded-xl ring-1 ring-border" style={{ color, background: `color-mix(in oklab, ${color} 14%, transparent)` }}>
          <Icon className="size-4.5" />
        </span>
        <Sparkline data={data} color={color} />
      </div>
      <div className="relative mt-3 text-sm text-muted-foreground">{label}</div>
      <div className="relative mt-0.5 flex items-end justify-between gap-2">
        <span className="font-heading text-2xl font-extrabold tabular-nums">{value}</span>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold',
            good ? 'bg-brand/12 text-brand' : 'bg-danger/12 text-danger',
          )}
        >
          {trend >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          <span dir="ltr">
            {trend >= 0 ? '+' : ''}
            {trend}%
          </span>
          <span className="font-medium">{trendLabel}</span>
        </span>
      </div>
    </GlassCard>
  )
}

export function BarsMini({ data, labels, color = 'var(--info)' }: { data: number[]; labels: string[]; color?: string }) {
  const hi = Math.max(...data)
  return (
    <div className="flex h-36 items-end gap-2" dir="ltr">
      {data.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="relative w-full flex-1 overflow-hidden rounded-lg bg-secondary">
            <div
              className="absolute inset-x-0 bottom-0 rounded-lg transition-all duration-1000"
              style={{ height: `${(v / hi) * 100}%`, background: `linear-gradient(to top, ${color}, color-mix(in oklab, ${color} 40%, transparent))` }}
              title={`${labels[i]}: ${v}`}
            />
          </div>
          <span className="text-[10px] text-muted-foreground tabular-nums">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}
