'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { cn } from '@/lib/utils'

export function QrImage({ value, size = 240, className, label }: { value: string; size?: number; className?: string; label: string }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    let alive = true
    QRCode.toDataURL(value, { width: size * 2, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0B0F17', light: '#FFFFFF' } }).then(
      (url) => alive && setSrc(url),
    )
    return () => {
      alive = false
    }
  }, [value, size])
  return (
    <div className={cn('overflow-hidden rounded-2xl bg-white p-3', className)} style={{ width: size, height: size }}>
      {src ? <img src={src} alt={label} className="size-full" /> : <div className="size-full animate-pulse rounded-lg bg-slate-200" />}
    </div>
  )
}
