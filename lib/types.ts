export type Sector = 'retail' | 'cafe' | 'pharmacy' | 'clinic' | 'salon' | 'education' | 'services'

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave' | 'off'

export interface Employee {
  id: string
  name: string
  title: string
  branch: string
  phone: string
  baseSalary: number
  pin: string
  managerRating: number
  punctuality: number
  status: AttendanceStatus
  checkIn?: string
  lateMinutesMonth: number
  overtime15: number
  overtime20: number
  advances: number
  bonus: number
  joinedAt: string
  graceMinutes?: number
}

export type RequestType = 'swap' | 'leave' | 'advance' | 'early'
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'approved_deduction'

export interface StaffRequest {
  id: string
  employeeId: string
  type: RequestType
  leaveKind?: 'standard' | 'emergency'
  date: string
  details: string
  amount?: number
  status: RequestStatus
  managerNote?: string
  actionBy?: string
  actionAt?: string
  createdAt: string
}

export interface Candidate {
  id: string
  name: string
  title: string
  distanceKm: number
  match: number
  skills: string[]
  expectedSalary: number
  experienceYears: number
  lat: number
  lng: number
  hired?: boolean
}

export interface ChatMessage {
  id: string
  from: 'me' | 'them'
  text: string
  at: string
}

export interface JobOffer {
  id: string
  business: string
  sector: Sector
  title: string
  salary: number
  distanceKm: number
  shift: string
  direct: boolean
  status: 'new' | 'accepted' | 'rejected' | 'negotiating'
}

export interface PaymentSubmission {
  id: string
  method: 'vodafone' | 'instapay' | 'fawry' | 'bank'
  amount: number
  reference: string
  receiptName: string
  status: 'review' | 'confirmed'
  at: string
}

export interface PendingPunch {
  id: string
  kind: 'in' | 'out'
  at: string
  method: 'qr' | 'pin'
}

export interface CV {
  fullName: string
  headline: string
  phone: string
  email: string
  city: string
  about: string
  skills: string[]
  experience: { id: string; role: string; company: string; period: string; summary: string }[]
}

export interface AppState {
  employees: Employee[]
  requests: StaffRequest[]
  candidates: Candidate[]
  chats: Record<string, ChatMessage[]>
  offers: JobOffer[]
  payments: PaymentSubmission[]
  payrollLocked: boolean
  payrollLockedBy?: string
  business: {
    name: string
    sector: Sector
    address: string
    phone: string
    lat: number
    lng: number
    radius: number
    plan: string
  }
  permissions: Record<string, Record<string, boolean>>
  approvalRights: Record<string, Record<RequestType, boolean>>
  managerRoles: Record<string, string>
  defaultGraceMinutes: number
  shiftStart: string
  notifications: AppNotification[]
  announcements: Announcement[]
  managerName: string
  me: {
    employeeId: string
    shiftStart?: string
    pendingPunches: PendingPunch[]
    payslipConfirmedAt?: string
    history: { id: string; kind: 'in' | 'out'; at: string; synced: boolean }[]
  }
  cv: CV
}

export type Audience = 'employer' | 'employee'

export interface AppNotification {
  id: string
  audience: Audience
  title: string
  body: string
  at: string
  read: boolean
  href?: string
}

export interface AnnouncementReply {
  id: string
  employeeId: string
  text: string
  at: string
}

export interface Announcement {
  id: string
  text: string
  by: string
  at: string
  important?: boolean
  readBy: string[]
  ackBy: string[]
  replies: AnnouncementReply[]
}
