import { Coffee, GraduationCap, Pill, Scissors, ShoppingCart, Stethoscope, Wrench, type LucideIcon } from 'lucide-react'
import type { Sector } from './types'

export const SECTOR_ICONS: Record<Sector, LucideIcon> = {
  retail: ShoppingCart,
  cafe: Coffee,
  pharmacy: Pill,
  clinic: Stethoscope,
  salon: Scissors,
  education: GraduationCap,
  services: Wrench,
}
