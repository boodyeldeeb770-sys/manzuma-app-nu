import type { AppState, Sector } from './types'

export const SECTORS: { id: Sector; label: string; labelEn: string }[] = [
  { id: 'retail', label: 'التجزئة', labelEn: 'Retail' },
  { id: 'cafe', label: 'المطاعم والكافيهات', labelEn: 'Cafes & Restaurants' },
  { id: 'pharmacy', label: 'الصيدليات', labelEn: 'Pharmacies' },
  { id: 'clinic', label: 'العيادات', labelEn: 'Clinics' },
  { id: 'salon', label: 'الصالونات', labelEn: 'Salons' },
  { id: 'education', label: 'المراكز التعليمية', labelEn: 'Education' },
  { id: 'services', label: 'منافذ الخدمات', labelEn: 'Service Outlets' },
]

export const sectorLabel = (s: Sector) => SECTORS.find((x) => x.id === s)?.label ?? s

export const WEEK_DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

export const WEEKLY_ATTENDANCE = [92, 95, 89, 97, 94, 96.4, 88]
export const WEEKLY_LATE = [8, 5, 11, 3, 6, 4, 12]
export const WEEKLY_OVERTIME = [6, 9, 4, 12, 8, 14, 18]
export const PEAK_HOURS = [
  { h: '7:00', v: 4 },
  { h: '7:30', v: 12 },
  { h: '8:00', v: 28 },
  { h: '8:30', v: 19 },
  { h: '9:00', v: 9 },
  { h: '9:30', v: 5 },
  { h: '10:00', v: 3 },
]

const CAIRO = { lat: 30.0561, lng: 31.3301 }

export const initialState: AppState = {
  managerName: 'م. كريم عبد الرحمن',
  employees: [
    { id: 'e1', name: 'أحمد سمير', title: 'كاشير أول', branch: 'فرع مدينة نصر', phone: '01012345678', baseSalary: 7500, pin: '1234', managerRating: 4.5, punctuality: 94, status: 'present', checkIn: '08:02', lateMinutesMonth: 12, overtime15: 6, overtime20: 0, advances: 1000, bonus: 250, joinedAt: '2024-03-01' },
    { id: 'e2', name: 'منى خالد', title: 'صيدلانية', branch: 'فرع مدينة نصر', phone: '01123456789', baseSalary: 11000, pin: '2468', managerRating: 5, punctuality: 99, status: 'present', checkIn: '07:55', lateMinutesMonth: 0, overtime15: 10, overtime20: 4, advances: 0, bonus: 500, joinedAt: '2023-09-15' },
    { id: 'e3', name: 'يوسف عادل', title: 'باريستا', branch: 'فرع التجمع', phone: '01234567890', baseSalary: 6200, pin: '1357', managerRating: 4, punctuality: 81, status: 'late', checkIn: '08:34', lateMinutesMonth: 96, overtime15: 3, overtime20: 0, advances: 500, bonus: 0, joinedAt: '2024-07-10' },
    { id: 'e4', name: 'سارة إبراهيم', title: 'مصففة شعر', branch: 'فرع الزمالك', phone: '01098765432', baseSalary: 8000, pin: '9876', managerRating: 4.5, punctuality: 91, status: 'present', checkIn: '09:58', lateMinutesMonth: 25, overtime15: 8, overtime20: 6, advances: 0, bonus: 300, joinedAt: '2024-01-20' },
    { id: 'e5', name: 'محمود حسن', title: 'مندوب مبيعات', branch: 'فرع مدينة نصر', phone: '01187654321', baseSalary: 6800, pin: '1111', managerRating: 3.5, punctuality: 72, status: 'absent', lateMinutesMonth: 140, overtime15: 0, overtime20: 0, advances: 1500, bonus: 0, joinedAt: '2025-02-01' },
    { id: 'e6', name: 'د. ريم فؤاد', title: 'طبيبة أسنان', branch: 'عيادة المعادي', phone: '01276543210', baseSalary: 18000, pin: '4321', managerRating: 5, punctuality: 97, status: 'present', checkIn: '10:01', lateMinutesMonth: 5, overtime15: 4, overtime20: 8, advances: 0, bonus: 1000, joinedAt: '2023-05-05' },
    { id: 'e7', name: 'عمر طارق', title: 'مدرس رياضيات', branch: 'مركز الشروق', phone: '01065432109', baseSalary: 9000, pin: '5555', managerRating: 4, punctuality: 88, status: 'leave', lateMinutesMonth: 30, overtime15: 2, overtime20: 0, advances: 0, bonus: 0, joinedAt: '2024-09-01' },
    { id: 'e8', name: 'نورهان وليد', title: 'خدمة عملاء', branch: 'فرع التجمع', phone: '01154321098', baseSalary: 6500, pin: '8642', managerRating: 4.5, punctuality: 95, status: 'present', checkIn: '07:59', lateMinutesMonth: 8, overtime15: 5, overtime20: 2, advances: 750, bonus: 150, joinedAt: '2024-04-12' },
  ],
  requests: [
    { id: 'r1', employeeId: 'e3', type: 'swap', date: '2026-10-02', details: 'تبديل وردية الخميس المسائية مع نورهان وليد بسبب ظرف عائلي', status: 'pending', createdAt: '2026-09-27T09:12:00' },
    { id: 'r2', employeeId: 'e7', type: 'leave', leaveKind: 'standard', date: '2026-10-05', details: 'إجازة اعتيادية لمدة 3 أيام (من 5 إلى 7 أكتوبر)', status: 'pending', createdAt: '2026-09-26T14:40:00' },
    { id: 'r3', employeeId: 'e5', type: 'leave', leaveKind: 'emergency', date: '2026-09-28', details: 'إجازة طارئة - حالة مرضية في الأسرة', status: 'pending', createdAt: '2026-09-28T07:05:00' },
    { id: 'r4', employeeId: 'e1', type: 'advance', date: '2026-09-28', details: 'سلفة لسداد مصاريف دراسية', amount: 1500, status: 'pending', createdAt: '2026-09-27T18:22:00' },
    { id: 'r5', employeeId: 'e4', type: 'early', date: '2026-09-28', details: 'انصراف مبكر الساعة 4 مساءً لموعد طبي', status: 'pending', createdAt: '2026-09-28T08:30:00' },
    { id: 'r6', employeeId: 'e8', type: 'advance', date: '2026-09-20', details: 'سلفة شخصية', amount: 750, status: 'approved', managerNote: 'تُخصم على دفعة واحدة من راتب سبتمبر', actionBy: 'م. كريم عبد الرحمن', actionAt: '2026-09-20T12:00:00', createdAt: '2026-09-19T10:00:00' },
    { id: 'r7', employeeId: 'e3', type: 'early', date: '2026-09-18', details: 'انصراف مبكر ساعتين', status: 'approved_deduction', managerNote: 'قبول مع خصم ساعتين من الراتب', actionBy: 'أ. هالة المشرفة', actionAt: '2026-09-18T15:00:00', createdAt: '2026-09-18T11:00:00' },
  ],
  candidates: [
    { id: 'c1', name: 'هشام مصطفى', title: 'كاشير بخبرة سنتين', distanceKm: 1.2, match: 94, skills: ['نقاط البيع POS', 'خدمة العملاء', 'جرد'], expectedSalary: 6500, experienceYears: 2, lat: CAIRO.lat + 0.008, lng: CAIRO.lng + 0.006 },
    { id: 'c2', name: 'ياسمين علي', title: 'صيدلانية حديثة التخرج', distanceKm: 2.4, match: 89, skills: ['صرف الروشتات', 'إدارة المخزون', 'إنجليزي ممتاز'], expectedSalary: 9000, experienceYears: 1, lat: CAIRO.lat - 0.015, lng: CAIRO.lng + 0.012 },
    { id: 'c3', name: 'كريم ناصر', title: 'باريستا محترف', distanceKm: 3.1, match: 86, skills: ['لاتيه آرت', 'تحضير المشروبات', 'نظافة'], expectedSalary: 5800, experienceYears: 3, lat: CAIRO.lat + 0.02, lng: CAIRO.lng - 0.014 },
    { id: 'c4', name: 'دينا شريف', title: 'موظفة استقبال عيادة', distanceKm: 4.6, match: 81, skills: ['حجز المواعيد', 'برامج العيادات', 'تواصل'], expectedSalary: 6000, experienceYears: 4, lat: CAIRO.lat - 0.03, lng: CAIRO.lng - 0.02 },
    { id: 'c5', name: 'مصطفى جمال', title: 'فني صيانة أجهزة', distanceKm: 6.8, match: 74, skills: ['صيانة', 'كهرباء', 'تركيبات'], expectedSalary: 7000, experienceYears: 5, lat: CAIRO.lat + 0.045, lng: CAIRO.lng + 0.04 },
    { id: 'c6', name: 'آية محمود', title: 'مصففة ومكياج', distanceKm: 8.3, match: 69, skills: ['تصفيف', 'مكياج', 'عناية بالبشرة'], expectedSalary: 7500, experienceYears: 3, lat: CAIRO.lat - 0.055, lng: CAIRO.lng + 0.05 },
  ],
  chats: {
    c1: [
      { id: 'm1', from: 'me', text: 'مرحباً هشام، شفنا ملفك ومهتمين بانضمامك لفرع مدينة نصر.', at: '10:02' },
      { id: 'm2', from: 'them', text: 'أهلاً بحضرتك، يشرفني. ممكن أعرف مواعيد الوردية والراتب؟', at: '10:05' },
    ],
    o1: [{ id: 'm1', from: 'them', text: 'أهلاً أحمد، عرضنا لوظيفة مشرف كاشير متاح للتفاوض.', at: '09:40' }],
  },
  offers: [
    { id: 'o1', business: 'هايبر ماركت النخبة', sector: 'retail', title: 'مشرف كاشير', salary: 9500, distanceKm: 1.8, shift: 'صباحي 8 ص - 4 م', direct: true, status: 'new' },
    { id: 'o2', business: 'كافيه روستري', sector: 'cafe', title: 'كاشير ومسؤول طلبات', salary: 7000, distanceKm: 0.9, shift: 'مسائي 4 م - 12 ص', direct: true, status: 'new' },
    { id: 'o3', business: 'صيدليات الشفاء', sector: 'pharmacy', title: 'مساعد صيدلي', salary: 7800, distanceKm: 2.7, shift: 'متغير', direct: false, status: 'new' },
    { id: 'o4', business: 'مركز التفوق التعليمي', sector: 'education', title: 'منسق حجوزات', salary: 6500, distanceKm: 4.2, shift: 'مسائي 2 م - 10 م', direct: false, status: 'new' },
  ],
  payments: [
    { id: 'p1', method: 'instapay', amount: 1499, reference: 'IPN-778120', receiptName: 'instapay-aug.jpg', status: 'confirmed', at: '2026-08-01' },
  ],
  payrollLocked: false,
  business: {
    name: 'مجموعة النخبة التجارية',
    sector: 'retail',
    address: 'عباس العقاد، مدينة نصر، القاهرة',
    phone: '0222740000',
    lat: CAIRO.lat,
    lng: CAIRO.lng,
    radius: 150,
    plan: 'الباقة الاحترافية',
  },
  permissions: {
    'م. كريم عبد الرحمن': { requests: true, payroll: true, recruitment: true, settings: true, kiosk: true },
    'أ. هالة المشرفة': { requests: true, payroll: false, recruitment: true, settings: false, kiosk: true },
    'أ. سامح (مشرف فرع)': { requests: true, payroll: false, recruitment: false, settings: false, kiosk: true },
  },
  me: {
    employeeId: 'e1',
    pendingPunches: [],
    history: [
      { id: 'h1', kind: 'in', at: '2026-09-27T08:01:00', synced: true },
      { id: 'h2', kind: 'out', at: '2026-09-27T16:07:00', synced: true },
    ],
  },
  cv: {
    fullName: 'أحمد سمير',
    headline: 'كاشير أول | خبرة 4 سنوات في التجزئة',
    phone: '01012345678',
    email: 'ahmed.samir@example.com',
    city: 'مدينة نصر، القاهرة',
    about: 'موظف ملتزم أجيد التعامل مع أنظمة نقاط البيع وإدارة الخزينة، وأسعى للتطور لمنصب إشرافي.',
    skills: ['نقاط البيع POS', 'إدارة الخزينة', 'خدمة العملاء', 'Excel'],
    experience: [
      { id: 'x1', role: 'كاشير أول', company: 'مجموعة النخبة التجارية', period: '2024 - الآن', summary: 'إدارة خزينة الفرع وتدريب الكاشيرات الجدد.' },
      { id: 'x2', role: 'كاشير', company: 'سوبر ماركت الأمل', period: '2022 - 2024', summary: 'تشغيل نقاط البيع وتسوية الورديات اليومية.' },
    ],
  },
}

export const LATE_RATE_PER_MIN = (base: number) => base / 30 / 8 / 60
export const HOURLY = (base: number) => base / 30 / 8

export function computePayroll(e: AppState['employees'][number]) {
  const hourly = HOURLY(e.baseSalary)
  const lateDeduction = Math.round(e.lateMinutesMonth * LATE_RATE_PER_MIN(e.baseSalary))
  const ot15 = Math.round(e.overtime15 * hourly * 1.5)
  const ot20 = Math.round(e.overtime20 * hourly * 2)
  const net = e.baseSalary - lateDeduction + ot15 + ot20 - e.advances + e.bonus
  const notes: string[] = []
  if (e.lateMinutesMonth) notes.push(`تأخير ${e.lateMinutesMonth} دقيقة × ${LATE_RATE_PER_MIN(e.baseSalary).toFixed(2)} ج/د`)
  if (e.overtime15) notes.push(`إضافي ${e.overtime15} س × 1.5`)
  if (e.overtime20) notes.push(`عطلة رسمية ${e.overtime20} س × 2.0`)
  if (e.advances) notes.push(`استقطاع سلفة ${e.advances} ج`)
  if (e.bonus) notes.push(`مكافأة التزام ${e.bonus} ج`)
  return { lateDeduction, ot15, ot20, net, notes }
}

export const egp = (n: number) => `${Math.round(n).toLocaleString('ar-EG')} ج.م`
