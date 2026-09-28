'use client'

import { useState } from 'react'
import { Briefcase, EyeOff, Plus, Save, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { uid, useStore } from '@/components/providers/store-provider'
import { Avatar, Btn, GlassCard, PageHeader, Pill } from '@/components/ui-kit'
import type { CV } from '@/lib/types'

export default function CvPage() {
  const { state, update } = useStore()
  const [cv, setCv] = useState<CV>(state.cv)
  const [skill, setSkill] = useState('')

  const set = <K extends keyof CV>(key: K, value: CV[K]) => setCv((c) => ({ ...c, [key]: value }))

  const addSkill = () => {
    const v = skill.trim()
    if (!v || cv.skills.includes(v)) return
    set('skills', [...cv.skills, v])
    setSkill('')
  }

  const save = () => {
    update((s) => ({ ...s, cv }))
    toast.success('تم حفظ سيرتك الذاتية')
  }

  return (
    <>
      <PageHeader
        title="سيرتي الذاتية"
        description="حدّث بياناتك ومهاراتك — تظهر للمنشآت فقط عند بحثك عن فرصة جديدة"
        actions={
          <Btn onClick={save}>
            <Save />
            حفظ التغييرات
          </Btn>
        }
      />

      <div className="mb-4 flex items-start gap-3 rounded-2xl border border-info/25 bg-info/10 p-4 text-sm text-info">
        <EyeOff className="mt-0.5 size-5 shrink-0" />
        <div>
          <div className="font-semibold">سيرتك مخفية حالياً عن المنشآت الأخرى</div>
          <p className="text-info/80">
            بما أنك على رأس عملك، لا تظهر سيرتك في نتائج البحث للحفاظ على خصوصيتك. تُعرض تلقائياً فقط حين تبدأ بالبحث عن وظيفة من صفحة الوظائف.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <GlassCard className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <Avatar name={cv.fullName || 'م'} className="size-14 text-base" />
              <div className="min-w-0 flex-1">
                <div className="font-bold">{cv.fullName || 'اسمك'}</div>
                <div className="truncate text-sm text-muted-foreground">{cv.headline || 'المسمى المهني'}</div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">
                الاسم الكامل
                <input value={cv.fullName} onChange={(e) => set('fullName', e.target.value)} className="field font-normal" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">
                المسمى المهني
                <input value={cv.headline} onChange={(e) => set('headline', e.target.value)} className="field font-normal" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                رقم الهاتف
                <input value={cv.phone} onChange={(e) => set('phone', e.target.value)} className="field font-normal" dir="ltr" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                البريد الإلكتروني
                <input value={cv.email} onChange={(e) => set('email', e.target.value)} className="field font-normal" dir="ltr" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">
                المدينة
                <input value={cv.city} onChange={(e) => set('city', e.target.value)} className="field font-normal" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">
                نبذة عني
                <textarea rows={3} value={cv.about} onChange={(e) => set('about', e.target.value)} className="field font-normal" />
              </label>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="size-5 text-brand" />
                <h2 className="font-bold">الخبرات العملية</h2>
              </div>
              <Btn
                variant="outline"
                size="sm"
                onClick={() => set('experience', [...cv.experience, { id: uid(), role: '', company: '', period: '', summary: '' }])}
              >
                <Plus />
                إضافة خبرة
              </Btn>
            </div>

            <div className="flex flex-col gap-3">
              {cv.experience.map((x) => (
                <div key={x.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-secondary p-4">
                  <div className="flex items-center gap-2">
                    <input
                      value={x.role}
                      onChange={(e) => set('experience', cv.experience.map((it) => (it.id === x.id ? { ...it, role: e.target.value } : it)))}
                      className="field flex-1"
                      placeholder="المسمى الوظيفي"
                    />
                    <Btn
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => set('experience', cv.experience.filter((it) => it.id !== x.id))}
                      aria-label="حذف الخبرة"
                    >
                      <Trash2 className="text-danger" />
                    </Btn>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={x.company}
                      onChange={(e) => set('experience', cv.experience.map((it) => (it.id === x.id ? { ...it, company: e.target.value } : it)))}
                      className="field"
                      placeholder="جهة العمل"
                    />
                    <input
                      value={x.period}
                      onChange={(e) => set('experience', cv.experience.map((it) => (it.id === x.id ? { ...it, period: e.target.value } : it)))}
                      className="field"
                      placeholder="الفترة (مثال: 2022 - 2024)"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={x.summary}
                    onChange={(e) => set('experience', cv.experience.map((it) => (it.id === x.id ? { ...it, summary: e.target.value } : it)))}
                    className="field"
                    placeholder="أبرز المهام والإنجازات"
                  />
                </div>
              ))}
              {!cv.experience.length && <p className="text-sm text-muted-foreground">لم تُضف أي خبرة بعد</p>}
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-2">
          <GlassCard className="flex flex-col gap-4 p-6">
            <h2 className="font-bold">المهارات</h2>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                addSkill()
              }}
            >
              <input value={skill} onChange={(e) => setSkill(e.target.value)} className="field" placeholder="أضف مهارة" aria-label="مهارة جديدة" />
              <Btn type="submit" size="icon" aria-label="إضافة">
                <Plus />
              </Btn>
            </form>
            <div className="flex flex-wrap gap-2">
              {cv.skills.map((s) => (
                <Pill key={s} tone="brand" className="gap-1.5">
                  {s}
                  <button onClick={() => set('skills', cv.skills.filter((x) => x !== s))} aria-label={`حذف ${s}`} className="hover:text-danger">
                    <X className="size-3" />
                  </button>
                </Pill>
              ))}
              {!cv.skills.length && <p className="text-sm text-muted-foreground">لا توجد مهارات بعد</p>}
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  )
}
