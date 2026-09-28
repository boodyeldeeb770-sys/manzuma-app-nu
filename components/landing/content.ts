import { Banknote, ClipboardCheck, MapPinned, QrCode, ShieldCheck, WifiOff } from 'lucide-react'
import type { Sector } from '@/lib/types'

type L = { ar: string; en: string }

export const FEATURES: { icon: typeof QrCode; title: L; desc: L; color: string }[] = [
  {
    icon: QrCode,
    title: { ar: 'حضور QR متجدد', en: 'Rotating QR attendance' },
    desc: { ar: 'رمز يتجدد كل 10 ثوانٍ مع التحقق من الموقع الجغرافي — لا مجال للتلاعب.', en: 'A code that refreshes every 10s with GPS verification — no buddy punching.' },
    color: 'var(--brand)',
  },
  {
    icon: Banknote,
    title: { ar: 'رواتب آلية بالدقيقة', en: 'Minute-accurate payroll' },
    desc: { ar: 'خصم التأخير بالدقيقة، إضافي 1.5x و2.0x للعطلات، واستقطاع السلف تلقائياً.', en: 'Per-minute lateness, 1.5x/2.0x holiday overtime and advance deductions — automatic.' },
    color: 'var(--gold)',
  },
  {
    icon: ClipboardCheck,
    title: { ar: 'مركز طلبات بسجل تدقيق', en: 'Requests with audit trail' },
    desc: { ar: 'إجازات، سلف، تبديل ورديات، وانصراف مبكر — كل قرار موثّق باسم متخذه.', en: 'Leaves, advances, swaps and early checkouts — every decision signed by its owner.' },
    color: 'var(--info)',
  },
  {
    icon: MapPinned,
    title: { ar: 'توظيف من محيطك', en: 'Hire from your neighborhood' },
    desc: { ar: 'اعثر على مرشحين في نطاق كيلومترات من منشأتك مع نسبة تطابق ومحادثة تفاوض.', en: 'Find candidates within kilometers of your business, with match scores and negotiation chat.' },
    color: 'var(--brand)',
  },
  {
    icon: WifiOff,
    title: { ar: 'يعمل بدون إنترنت', en: 'Offline-first' },
    desc: { ar: 'تُحفظ حركات الحضور محلياً وتُزامن تلقائياً فور عودة الاتصال.', en: 'Punches are stored locally and synced automatically once back online.' },
    color: 'var(--info)',
  },
  {
    icon: ShieldCheck,
    title: { ar: 'دفع محلي آمن', en: 'Local payments' },
    desc: { ar: 'فودافون كاش، إنستاباي، فوري، أو تحويل بنكي مع رفع إيصال الدفع.', en: 'Vodafone Cash, InstaPay, Fawry or bank transfer with receipt upload.' },
    color: 'var(--gold)',
  },
]

export const COMPARISON: { feature: L; us: boolean | L; old: boolean | L }[] = [
  { feature: { ar: 'التحقق من الموقع عند الحضور', en: 'GPS-verified check-in' }, us: true, old: false },
  { feature: { ar: 'حساب التأخير بالدقيقة', en: 'Per-minute lateness' }, us: true, old: { ar: 'يدوي', en: 'Manual' } },
  { feature: { ar: 'سجل تدقيق للقرارات', en: 'Decision audit trail' }, us: true, old: false },
  { feature: { ar: 'تصدير كشوف الرواتب', en: 'Payroll export' }, us: { ar: 'بنقرة', en: 'One click' }, old: { ar: 'ساعات عمل', en: 'Hours of work' } },
  { feature: { ar: 'توظيف جغرافي', en: 'Geo-recruitment' }, us: true, old: false },
  { feature: { ar: 'العمل بدون إنترنت', en: 'Works offline' }, us: true, old: true },
]

export const SECTOR_PREVIEW: Record<
  Sector,
  { staff: number; attendance: number; branch: L; roles: L[] }
> = {
  retail: { staff: 42, attendance: 96.4, branch: { ar: 'هايبر النخبة — مدينة نصر', en: 'Elite Hyper — Nasr City' }, roles: [{ ar: 'كاشير', en: 'Cashier' }, { ar: 'مشرف صالة', en: 'Floor lead' }, { ar: 'أمين مخزن', en: 'Stock keeper' }] },
  cafe: { staff: 18, attendance: 93.1, branch: { ar: 'روستري — التجمع', en: 'Roastery — New Cairo' }, roles: [{ ar: 'باريستا', en: 'Barista' }, { ar: 'شيف', en: 'Chef' }, { ar: 'ويتر', en: 'Waiter' }] },
  pharmacy: { staff: 12, attendance: 98.2, branch: { ar: 'صيدليات الشفاء — المعادي', en: 'Al-Shifa — Maadi' }, roles: [{ ar: 'صيدلي', en: 'Pharmacist' }, { ar: 'مساعد', en: 'Assistant' }, { ar: 'دليفري', en: 'Delivery' }] },
  clinic: { staff: 9, attendance: 97.5, branch: { ar: 'عيادات سمايل — الزمالك', en: 'Smile Clinics — Zamalek' }, roles: [{ ar: 'طبيب', en: 'Doctor' }, { ar: 'تمريض', en: 'Nurse' }, { ar: 'استقبال', en: 'Reception' }] },
  salon: { staff: 7, attendance: 91.8, branch: { ar: 'صالون لمسة — الشيخ زايد', en: 'Lamsa Salon — Zayed' }, roles: [{ ar: 'مصفف', en: 'Stylist' }, { ar: 'خبيرة تجميل', en: 'Beautician' }] },
  education: { staff: 24, attendance: 94.6, branch: { ar: 'مركز التفوق — الشروق', en: 'Tafawoq Center — Shorouk' }, roles: [{ ar: 'مدرس', en: 'Teacher' }, { ar: 'منسق', en: 'Coordinator' }] },
  services: { staff: 15, attendance: 95.0, branch: { ar: 'منفذ خدمات — المهندسين', en: 'Service outlet — Mohandessin' }, roles: [{ ar: 'فني', en: 'Technician' }, { ar: 'خدمة عملاء', en: 'Support' }] },
}

export const POLICIES: { title: L; body: L }[] = [
  {
    title: { ar: 'خصوصية البيانات', en: 'Data privacy' },
    body: {
      ar: 'تُشفَّر بيانات الموظفين ومواقعهم الجغرافية، ولا يُسجَّل الموقع إلا لحظة تسجيل الحضور والانصراف فقط، ولا تُشارك مع أي طرف ثالث.',
      en: 'Employee data and locations are encrypted. Location is captured only at check-in/out and never shared with third parties.',
    },
  },
  {
    title: { ar: 'سياسة السلف', en: 'Advance policy' },
    body: {
      ar: 'لا يجوز أن تتجاوز السلفة 50% من الأجر المستحق حتى تاريخ الطلب، وتُستقطع تلقائياً من كشف الراتب التالي.',
      en: 'Advances may not exceed 50% of wages accrued to date and are deducted automatically from the next payroll.',
    },
  },
  {
    title: { ar: 'سرية السيرة الذاتية', en: 'C.V confidentiality' },
    body: {
      ar: 'تُخفى السيرة الذاتية للموظف تلقائياً عن المنشآت الأخرى طوال فترة عمله الرسمية داخل المنظومة.',
      en: "An employee's C.V is automatically hidden from other businesses while they are officially employed.",
    },
  },
  {
    title: { ar: 'الاعتماد النهائي للرواتب', en: 'Final payroll sign-off' },
    body: {
      ar: 'بعد اعتماد وترحيل الرواتب يُقفل الكشف ولا يمكن تعديله، ويتم توثيق اسم المعتمد والتاريخ في سجل التدقيق.',
      en: 'Once payroll is signed off it is locked; the approver and timestamp are recorded in the audit log.',
    },
  },
  {
    title: { ar: 'الاشتراك والدفع', en: 'Subscription & payment' },
    body: {
      ar: 'يتم تفعيل الاشتراك خلال 24 ساعة من مراجعة إيصال الدفع عبر فودافون كاش أو إنستاباي أو فوري أو التحويل البنكي.',
      en: 'Subscriptions activate within 24h of receipt review via Vodafone Cash, InstaPay, Fawry or bank transfer.',
    },
  },
]
