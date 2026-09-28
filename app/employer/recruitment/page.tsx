'use client'

import { useMemo, useState } from 'react'
import { BadgeCheck, Briefcase, MapPin, MessageCircle, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { GeoMap, type MapMarker } from '@/components/geo-map'
import { NegotiationChat } from '@/components/negotiation-chat'
import { uid, useStore } from '@/components/providers/store-provider'
import { Avatar, Btn, GlassCard, Modal, PageHeader, Pill } from '@/components/ui-kit'
import { egp } from '@/lib/mock-data'
import type { Candidate } from '@/lib/types'
import { cn } from '@/lib/utils'

const RADII = [2, 5, 10]

export default function RecruitmentPage() {
  const { state, update } = useStore()
  const [radiusKm, setRadiusKm] = useState(5)
  const [selected, setSelected] = useState<string | null>(null)
  const [chatWith, setChatWith] = useState<Candidate | null>(null)

  const nearby = state.candidates.filter((c) => c.distanceKm <= radiusKm).sort((a, b) => b.match - a.match)
  const markers: MapMarker[] = useMemo(
    () => nearby.map((c) => ({ id: c.id, lat: c.lat, lng: c.lng, label: `${c.name} — ${c.title}`, score: c.match, active: c.id === selected })),
    [nearby, selected],
  )

  const hire = (c: Candidate) => {
    update((s) => ({
      ...s,
      candidates: s.candidates.map((x) => (x.id === c.id ? { ...x, hired: true } : x)),
      employees: [
        ...s.employees,
        {
          id: uid(),
          name: c.name,
          title: c.title.split(' ')[0] + ' ' + (c.title.split(' ')[1] ?? ''),
          branch: 'فرع مدينة نصر',
          phone: '010' + Math.floor(10000000 + Math.random() * 89999999),
          baseSalary: c.expectedSalary,
          pin: String(Math.floor(1000 + Math.random() * 9000)),
          managerRating: 4,
          punctuality: 100,
          status: 'off',
          lateMinutesMonth: 0,
          overtime15: 0,
          overtime20: 0,
          advances: 0,
          bonus: 0,
          joinedAt: new Date().toISOString().slice(0, 10),
        },
      ],
    }))
    toast.success(`تمت إضافة ${c.name} كموظف رسمي — تم إخفاء سيرته الذاتية عن المنشآت الأخرى`)
    setChatWith(null)
  }

  return (
    <>
      <PageHeader title="مركز التوظيف الجغرافي" description="مرشحون مؤهلون يسكنون بالقرب من فرعك — أقل غياب وتأخير" />

      <div className="grid gap-4 lg:grid-cols-5">
        <GlassCard className="flex flex-col gap-3 p-3 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-1">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="size-4 text-brand" />
              نطاق البحث
            </div>
            <div className="flex gap-1 rounded-xl border border-border bg-secondary p-1" role="radiogroup" aria-label="نطاق البحث">
              {RADII.map((r) => (
                <button
                  key={r}
                  role="radio"
                  aria-checked={radiusKm === r}
                  onClick={() => setRadiusKm(r)}
                  className={cn('rounded-lg px-3 py-1 text-xs font-semibold transition', radiusKm === r ? 'bg-brand text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
                >
                  {r} كم
                </button>
              ))}
            </div>
          </div>
          <GeoMap
            className="h-[420px] w-full overflow-hidden rounded-2xl lg:h-[560px]"
            center={{ lat: state.business.lat, lng: state.business.lng }}
            radiusMeters={radiusKm * 1000}
            markers={markers}
            onMarkerClick={(id) => {
              setSelected(id)
              document.getElementById(`cand-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }}
          />
        </GlassCard>

        <div className="flex max-h-[640px] flex-col gap-3 overflow-y-auto lg:col-span-2">
          <div className="flex items-center justify-between px-1 text-sm">
            <span className="font-bold">{nearby.length} مرشحين ضمن {radiusKm} كم</span>
            <span className="text-xs text-muted-foreground">مرتبون حسب نسبة التطابق</span>
          </div>
          {nearby.map((c) => (
            <GlassCard
              key={c.id}
              id={`cand-${c.id}`}
              onMouseEnter={() => setSelected(c.id)}
              className={cn('flex flex-col gap-3 p-4 transition', selected === c.id && 'ring-2 ring-gold/60')}
            >
              <div className="flex items-start gap-3">
                <Avatar name={c.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    {c.name}
                    {c.hired && <BadgeCheck className="size-4 text-brand" aria-label="تم التعيين" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{c.title}</div>
                </div>
                <div className="text-center">
                  <div className={cn('text-xl font-extrabold tabular-nums', c.match >= 85 ? 'text-brand' : c.match >= 75 ? 'text-gold' : 'text-info')}>{c.match}%</div>
                  <div className="text-[10px] text-muted-foreground">تطابق</div>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-gradient-to-l from-brand to-info" style={{ width: `${c.match}%` }} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {c.skills.map((s) => (
                  <Pill key={s} tone="muted">{s}</Pill>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="size-3" />{c.distanceKm} كم</span>
                <span className="flex items-center gap-1"><Briefcase className="size-3" />{c.experienceYears} سنوات</span>
                <span>يتوقع {egp(c.expectedSalary)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Btn size="sm" variant="outline" onClick={() => setChatWith(c)}>
                  <MessageCircle />
                  تفاوض
                </Btn>
                <Btn size="sm" disabled={c.hired} onClick={() => hire(c)}>
                  <UserPlus />
                  {c.hired ? 'موظف رسمي' : 'إضافة كموظف رسمي'}
                </Btn>
              </div>
            </GlassCard>
          ))}
          {!nearby.length && <GlassCard className="p-8 text-center text-sm text-muted-foreground">لا يوجد مرشحون في هذا النطاق، جرّب توسيعه</GlassCard>}
        </div>
      </div>

      <Modal open={!!chatWith} onClose={() => setChatWith(null)} title={chatWith ? `التفاوض مع ${chatWith.name}` : ''} description={chatWith ? `${chatWith.title} · يتوقع ${egp(chatWith.expectedSalary)}` : ''} size="lg">
        {chatWith && (
          <>
            <NegotiationChat
              threadId={chatWith.id}
              className="h-[420px]"
              quick={['نعرض عليك راتب ' + (chatWith.expectedSalary + 500) + ' ج', 'الوردية صباحية 8 ص - 4 م', 'متى تقدر تبدأ؟', 'نحتاج مقابلة قصيرة في الفرع']}
              replies={['تمام جداً، العرض مناسب ليا.', 'ممكن نتفق على 500 جنيه زيادة؟', 'أقدر أبدأ من أول الأسبوع الجاي.', 'موافق، هكون في الفرع بكرة الساعة 11.']}
            />
            <Btn className="mt-3 w-full" size="lg" disabled={chatWith.hired} onClick={() => hire(chatWith)}>
              <UserPlus />
              إضافة كموظف رسمي
            </Btn>
          </>
        )}
      </Modal>
    </>
  )
}
