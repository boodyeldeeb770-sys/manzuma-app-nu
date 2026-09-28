'use client'

import { useMemo, useState } from 'react'
import { Check, MapPin, MessagesSquare, Navigation, X } from 'lucide-react'
import { toast } from 'sonner'
import { GeoMap, type MapMarker } from '@/components/geo-map'
import { NegotiationChat } from '@/components/negotiation-chat'
import { useStore } from '@/components/providers/store-provider'
import { Btn, GlassCard, Modal, PageHeader, Pill } from '@/components/ui-kit'
import { egp, sectorLabel } from '@/lib/mock-data'
import type { JobOffer } from '@/lib/types'

const OFFER_STATUS: Record<JobOffer['status'], { label: string; tone: 'brand' | 'gold' | 'danger' | 'info' }> = {
  new: { label: 'عرض جديد', tone: 'info' },
  accepted: { label: 'مقبول', tone: 'brand' },
  rejected: { label: 'مرفوض', tone: 'danger' },
  negotiating: { label: 'قيد التفاوض', tone: 'gold' },
}

const QUICK = ['هل الراتب قابل للزيادة؟', 'ما مواعيد الورديات بالضبط؟', 'هل يوجد تأمين وحوافز؟', 'متى أقرب موعد للمقابلة؟']
const REPLIES = [
  'نقدر اهتمامك، الراتب قابل للتفاوض حسب الخبرة.',
  'الورديات ثابتة مع راحة أسبوعية، ويمكن مناقشة التفاصيل.',
  'نعم يوجد تأمين اجتماعي وحوافز شهرية على الأداء.',
  'يسعدنا تحديد موعد مقابلة هذا الأسبوع.',
]

export default function JobsPage() {
  const { state, update } = useStore()
  const [negotiate, setNegotiate] = useState<JobOffer | null>(null)

  const markers: MapMarker[] = useMemo(
    () =>
      state.offers.map((o, i) => {
        const angle = (i / state.offers.length) * Math.PI * 2
        const dLat = (o.distanceKm / 111) * Math.cos(angle)
        const dLng = (o.distanceKm / (111 * Math.cos((state.business.lat * Math.PI) / 180))) * Math.sin(angle)
        return {
          id: o.id,
          lat: state.business.lat + dLat,
          lng: state.business.lng + dLng,
          label: `${o.business} — ${o.title}`,
          active: o.status === 'accepted' || o.status === 'negotiating',
        }
      }),
    [state.offers, state.business.lat, state.business.lng],
  )

  const decide = (offer: JobOffer, status: JobOffer['status'], msg: string) => {
    update((s) => ({ ...s, offers: s.offers.map((o) => (o.id === offer.id ? { ...o, status } : o)) }))
    toast.success(msg)
  }

  const openNegotiate = (offer: JobOffer) => {
    if (offer.status === 'new') decide(offer, 'negotiating', 'بدأت التفاوض حول العرض')
    setNegotiate(offer)
  }

  const activeOffer = negotiate ? state.offers.find((o) => o.id === negotiate.id) ?? negotiate : null

  return (
    <>
      <PageHeader
        title="وظائف قريبة وعروض"
        description="عروض مباشرة من منشآت حولك — اقبل أو ارفض أو تفاوض داخل التطبيق"
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <GlassCard className="overflow-hidden p-0 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-border p-4">
            <Navigation className="size-4 text-brand" />
            <h2 className="font-bold">خريطة الفرص القريبة</h2>
          </div>
          <GeoMap
            center={{ lat: state.business.lat, lng: state.business.lng }}
            radiusMeters={9000}
            markers={markers}
            onMarkerClick={(id) => {
              const el = document.getElementById(`offer-${id}`)
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              el?.classList.add('ring-2', 'ring-brand')
              setTimeout(() => el?.classList.remove('ring-2', 'ring-brand'), 1600)
            }}
            className="h-[360px] w-full lg:h-[520px]"
          />
        </GlassCard>

        <div className="flex flex-col gap-3 lg:col-span-3">
          {state.offers.map((o) => {
            const meta = OFFER_STATUS[o.status]
            const done = o.status === 'accepted' || o.status === 'rejected'
            return (
              <GlassCard key={o.id} id={`offer-${o.id}`} className="flex flex-col gap-3 p-5 transition">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{o.title}</h3>
                      {o.direct && <Pill tone="brand">عرض مباشر</Pill>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {o.business} · {sectorLabel(o.sector)}
                    </div>
                  </div>
                  <Pill tone={meta.tone}>{meta.label}</Pill>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Pill tone="gold">{egp(o.salary)}</Pill>
                  <Pill tone="muted">
                    <MapPin className="size-3.5" />
                    {o.distanceKm} كم
                  </Pill>
                  <Pill tone="muted">{o.shift}</Pill>
                </div>

                {!done && (
                  <div className="grid grid-cols-3 gap-2">
                    <Btn variant="success" size="sm" onClick={() => decide(o, 'accepted', `تم قبول عرض ${o.business}`)}>
                      <Check />
                      قبول
                    </Btn>
                    <Btn variant="danger" size="sm" onClick={() => decide(o, 'rejected', 'تم رفض العرض')}>
                      <X />
                      رفض
                    </Btn>
                    <Btn variant="gold" size="sm" onClick={() => openNegotiate(o)}>
                      <MessagesSquare />
                      تفاوض
                    </Btn>
                  </div>
                )}
                {o.status === 'negotiating' && (
                  <Btn variant="outline" size="sm" onClick={() => setNegotiate(o)}>
                    <MessagesSquare />
                    متابعة المحادثة
                  </Btn>
                )}
              </GlassCard>
            )
          })}
          {!state.offers.length && (
            <GlassCard className="p-12 text-center text-muted-foreground">لا توجد عروض حالياً</GlassCard>
          )}
        </div>
      </div>

      <Modal
        open={Boolean(activeOffer)}
        onClose={() => setNegotiate(null)}
        title={activeOffer ? `التفاوض — ${activeOffer.business}` : ''}
        description={activeOffer ? `${activeOffer.title} · ${egp(activeOffer.salary)} · ${activeOffer.shift}` : undefined}
      >
        {activeOffer && (
          <div className="flex flex-col gap-4">
            <NegotiationChat threadId={activeOffer.id} replies={REPLIES} quick={QUICK} />
            <div className="grid grid-cols-2 gap-2">
              <Btn
                variant="success"
                onClick={() => {
                  decide(activeOffer, 'accepted', `تم قبول عرض ${activeOffer.business}`)
                  setNegotiate(null)
                }}
              >
                <Check />
                قبول العرض
              </Btn>
              <Btn
                variant="danger"
                onClick={() => {
                  decide(activeOffer, 'rejected', 'تم رفض العرض')
                  setNegotiate(null)
                }}
              >
                <X />
                رفض العرض
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
