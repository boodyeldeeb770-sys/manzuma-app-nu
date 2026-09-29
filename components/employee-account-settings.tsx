'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Save } from 'lucide-react'
import { toast } from 'sonner'
import { usePreferences } from './providers/preferences-provider'
import { useStore } from './providers/store-provider'
import { Btn, Field } from './ui-kit'

export function EmployeeAccountSettings() {
  const { state, update } = useStore()
  const { t } = usePreferences()
  const router = useRouter()
  const me = state.employees.find((e) => e.id === state.me.employeeId) ?? state.employees[0]
  const [name, setName] = useState(me.name)
  const [phone, setPhone] = useState(me.phone)
  const [email, setEmail] = useState(state.cv.email)

  const save = () => {
    if (!name.trim() || !/^01\d{9}$/.test(phone.replace(/\s/g, ''))) {
      toast.error('تأكد من الاسم ورقم موبايل مصري صحيح (11 رقم)')
      return
    }
    update((s) => ({
      ...s,
      employees: s.employees.map((e) => (e.id === me.id ? { ...e, name: name.trim(), phone: phone.replace(/\s/g, '') } : e)),
      cv: { ...s.cv, fullName: name.trim(), phone: phone.replace(/\s/g, ''), email: email.trim() },
    }))
    toast.success('تم حفظ بيانات الحساب')
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <div className="text-sm font-semibold">{t('account')}</div>
      <Field label="الاسم بالكامل">{(id) => <input id={id} className="field" value={name} onChange={(e) => setName(e.target.value)} />}</Field>
      <Field label="رقم الموبايل">
        {(id) => <input id={id} className="field" dir="ltr" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />}
      </Field>
      <Field label="البريد الإلكتروني">
        {(id) => <input id={id} type="email" className="field" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />}
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Btn variant="outline" onClick={save}>
          <Save />
          حفظ البيانات
        </Btn>
        <Btn
          variant="outline"
          className="text-danger"
          onClick={() => {
            toast.success('تم تسجيل الخروج')
            router.push('/')
          }}
        >
          <LogOut />
          {t('logout')}
        </Btn>
      </div>
    </div>
  )
}
