import type { AttendanceStatus, RequestStatus, RequestType } from './types'

type Tone = 'brand' | 'gold' | 'danger' | 'info' | 'muted'

export const STATUS_META: Record<AttendanceStatus, { label: string; tone: Tone }> = {
  present: { label: 'حاضر', tone: 'brand' },
  late: { label: 'متأخر', tone: 'gold' },
  absent: { label: 'غائب', tone: 'danger' },
  leave: { label: 'إجازة', tone: 'info' },
  off: { label: 'راحة', tone: 'muted' },
}

export const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
  swap: 'تبديل وردية',
  leave: 'إجازة',
  advance: 'سلفة',
  early: 'انصراف مبكر',
}

export const REQUEST_STATUS_META: Record<RequestStatus, { label: string; tone: Tone }> = {
  pending: { label: 'قيد المراجعة', tone: 'gold' },
  approved: { label: 'مقبول', tone: 'brand' },
  rejected: { label: 'مرفوض', tone: 'danger' },
  approved_deduction: { label: 'مقبول مع الخصم', tone: 'info' },
}

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
