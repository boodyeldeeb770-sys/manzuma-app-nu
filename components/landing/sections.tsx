'use client'

import { Check, HeartHandshake, Minus, Target, Trophy } from 'lucide-react'
import { useCountUp } from '../charts'
import { Logo } from '../controls'
import { usePreferences } from '../providers/preferences-provider'
import { GlassCard } from '../ui-kit'
import { COMPARISON, FEATURES } from './content'

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const v = useCountUp(value, 1600, suffix === '%' ? 1 : 0)
  return (
    <div className="text-center">
      <div className="font-heading text-3xl font-extrabold tabular-nums md:text-4xl" dir="ltr">
        {suffix === '%' ? v.toFixed(1) : v.toLocaleString('en-US')}
        {suffix}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

export function StatsStrip() {
  const { t } = usePreferences()
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6">
      <GlassCard className="grid grid-cols-3 gap-4 rounded-3xl px-4 py-8">
        <Stat value={2400} suffix="+" label={t('statBusinesses')} />
        <Stat value={38000} suffix="+" label={t('statEmployees')} />
        <Stat value={99.2} suffix="%" label={t('statAccuracy')} />
      </GlassCard>
    </section>
  )
}

export function Features() {
  const { t, lang } = usePreferences()
  return (
    <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24 md:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-extrabold md:text-4xl">{t('featuresTitle')}</h2>
        <p className="mt-3 text-pretty text-muted-foreground">{t('featuresDesc')}</p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <GlassCard key={f.title.en} className="group p-6 transition hover:-translate-y-1">
            <span
              className="flex size-12 items-center justify-center rounded-2xl ring-1 ring-border transition group-hover:scale-110"
              style={{ color: f.color, background: `color-mix(in oklab, ${f.color} 14%, transparent)` }}
            >
              <f.icon className="size-5" />
            </span>
            <h3 className="mt-5 text-lg font-bold">{f.title[lang]}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc[lang]}</p>
          </GlassCard>
        ))}
      </div>

      <div className="mt-20">
        <h3 className="text-center text-2xl font-extrabold">{t('compareTitle')}</h3>
        <GlassCard className="mx-auto mt-8 max-w-3xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="p-4 text-start font-semibold">{t('compareFeature')}</th>
                <th className="p-4 text-center font-bold text-brand">{t('compareUs')}</th>
                <th className="p-4 text-center font-semibold text-muted-foreground">{t('compareOld')}</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature.en} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium">{row.feature[lang]}</td>
                  {[row.us, row.old].map((v, i) => (
                    <td key={i} className="p-4 text-center">
                      {v === true ? (
                        <Check className={i === 0 ? 'mx-auto size-5 text-brand' : 'mx-auto size-5 text-muted-foreground'} aria-label="نعم" />
                      ) : v === false ? (
                        <Minus className="mx-auto size-5 text-danger/70" aria-label="لا" />
                      ) : (
                        <span className={i === 0 ? 'font-semibold text-brand' : 'text-muted-foreground'}>{v[lang]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </div>
    </section>
  )
}

export function About() {
  const { t, lang } = usePreferences()
  const values = [
    { icon: Target, ar: 'الدقة أولاً', en: 'Precision first' },
    { icon: HeartHandshake, ar: 'عدالة للطرفين', en: 'Fair to both sides' },
    { icon: Trophy, ar: 'تجربة عالمية بروح محلية', en: 'World-class, locally rooted' },
  ]
  return (
    <section id="about" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-24 md:px-6">
      <GlassCard className="relative overflow-hidden rounded-3xl p-8 md:p-12">
        <div className="absolute -top-24 -end-24 size-72 rounded-full bg-brand/20 blur-3xl" aria-hidden />
        <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-extrabold">{t('aboutTitle')}</h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{t('aboutDesc')}</p>
          </div>
          <div className="grid gap-3">
            {values.map((v) => (
              <div key={v.en} className="flex items-center gap-3 rounded-2xl border border-border bg-secondary p-4">
                <v.icon className="size-5 text-brand" />
                <span className="font-semibold">{v[lang]}</span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </section>
  )
}

export function Footer({ onPolicies, onHelp }: { onPolicies: () => void; onHelp: () => void }) {
  const { t } = usePreferences()
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:px-6">
        <Logo />
        <div className="flex gap-4">
          <button onClick={onPolicies} className="hover:text-foreground">
            {t('policiesTitle')}
          </button>
          <button onClick={onHelp} className="hover:text-foreground">
            {t('helpTitle')}
          </button>
        </div>
        <div>
          © 2026 {t('brand')} — {t('footerRights')}
        </div>
      </div>
    </footer>
  )
}
