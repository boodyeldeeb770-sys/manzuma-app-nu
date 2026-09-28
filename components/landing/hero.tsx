'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, MapPin, Sparkles, Users } from 'lucide-react'
import { AreaChart, RadialRing } from '../charts'
import { usePreferences } from '../providers/preferences-provider'
import { Btn, GlassCard, Pill } from '../ui-kit'
import { SECTOR_PREVIEW } from './content'
import { SECTORS, WEEKLY_ATTENDANCE } from '@/lib/mock-data'
import { SECTOR_ICONS } from '@/lib/sector-icons'
import type { Sector } from '@/lib/types'
import { cn } from '@/lib/utils'

const DAYS_EN = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const DAYS_AR = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة']

export function Hero({ onStart }: { onStart: (role: 'employer' | 'employee') => void }) {
  const { t, lang } = usePreferences()
  const [sector, setSector] = useState<Sector>('retail')
  const preview = SECTOR_PREVIEW[sector]
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight

  return (
    <section id="sectors" className="relative overflow-hidden">
      <div className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pt-14 pb-20 md:px-6 lg:grid-cols-2 lg:items-center lg:pt-20">
        <div className="flex flex-col items-start gap-6">
          <Pill tone="brand" className="glass px-3 py-1 text-[13px]">
            <Sparkles />
            {t('heroBadge')}
          </Pill>
          <h1 className="text-balance text-4xl leading-tight font-extrabold tracking-tight md:text-6xl md:leading-[1.15]">
            {t('heroTitle1')}{' '}
            <span className="bg-gradient-to-l from-brand via-info to-brand bg-clip-text text-transparent">{t('heroTitle2')}</span>
          </h1>
          <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">{t('heroDesc')}</p>
          <div className="flex flex-wrap gap-3">
            <Btn size="lg" onClick={() => onStart('employer')}>
              {t('ctaEmployer')}
              <Arrow />
            </Btn>
            <Btn size="lg" variant="outline" onClick={() => onStart('employee')}>
              {t('ctaEmployee')}
            </Btn>
          </div>

          <div className="w-full">
            <div className="mb-3 text-sm font-semibold text-muted-foreground">{t('chooseSector')}</div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('chooseSector')}>
              {SECTORS.map((s) => {
                const Icon = SECTOR_ICONS[s.id]
                const active = sector === s.id
                return (
                  <button
                    key={s.id}
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSector(s.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
                      active ? 'border-brand bg-brand/12 text-brand' : 'glass text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4" />
                    {lang === 'ar' ? s.label : s.labelEn}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-brand/25 via-transparent to-info/25 blur-3xl" aria-hidden />
          <GlassCard className="relative rounded-3xl p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand/12 text-brand ring-1 ring-brand/25">
                  {(() => {
                    const Icon = SECTOR_ICONS[sector]
                    return <Icon className="size-5" />
                  })()}
                </span>
                <div>
                  <div className="font-bold">{preview.branch[lang]}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {lang === 'ar' ? 'نطاق جغرافي 150 متر' : '150m geofence'}
                  </div>
                </div>
              </div>
              <Pill tone="brand">
                <span className="size-1.5 animate-pulse rounded-full bg-brand" />
                {lang === 'ar' ? 'مباشر' : 'Live'}
              </Pill>
            </div>

            <div className="mt-6 grid items-center gap-6 sm:grid-cols-[auto_1fr]">
              <div className="mx-auto">
                <RadialRing key={sector} value={preview.attendance} size={170} stroke={14} label={lang === 'ar' ? 'ملتزمون اليوم' : 'on time today'} />
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { icon: Users, l: lang === 'ar' ? 'موظفون نشطون' : 'Active staff', v: preview.staff, c: 'text-info' },
                  { icon: Clock, l: lang === 'ar' ? 'متوسط التأخير' : 'Avg. lateness', v: lang === 'ar' ? '3.2 د' : '3.2m', c: 'text-gold' },
                  { icon: CheckCircle2, l: lang === 'ar' ? 'طلبات معتمدة' : 'Approved requests', v: 27, c: 'text-brand' },
                ].map((r) => (
                  <div key={r.l} className="flex items-center justify-between rounded-xl border border-border bg-secondary px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <r.icon className={cn('size-4', r.c)} />
                      {r.l}
                    </span>
                    <span className="font-bold tabular-nums">{r.v}</span>
                  </div>
                ))}
                <div className="flex flex-wrap gap-1.5">
                  {preview.roles.map((r) => (
                    <Pill key={r.en}>{r[lang]}</Pill>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <AreaChart
                key={sector}
                labels={lang === 'ar' ? DAYS_AR : DAYS_EN}
                height={170}
                min={80}
                max={100}
                series={[
                  { name: lang === 'ar' ? 'الحضور' : 'Attendance', data: WEEKLY_ATTENDANCE.map((v) => +(v - (100 - preview.attendance) / 3).toFixed(1)), color: 'var(--brand)', suffix: '%' },
                ]}
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  )
}
