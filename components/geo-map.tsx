'use client'

import dynamic from 'next/dynamic'

export type { MapMarker } from './geo-map-inner'

export const GeoMap = dynamic(() => import('./geo-map-inner'), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-2xl bg-secondary" />,
})
