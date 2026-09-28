'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { usePreferences } from './providers/preferences-provider'

export interface MapMarker {
  id: string
  lat: number
  lng: number
  label: string
  score?: number
  active?: boolean
}

export interface GeoMapProps {
  center: { lat: number; lng: number }
  radiusMeters: number
  markers?: MapMarker[]
  onMarkerClick?: (id: string) => void
  onPick?: (lat: number, lng: number) => void
  className?: string
}

function pinIcon(color: string, text?: string, active?: boolean) {
  return L.divIcon({
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `<div style="width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;font:700 11px var(--font-plex),sans-serif;color:#fff;background:${color};box-shadow:0 0 0 ${active ? 5 : 3}px color-mix(in oklab, ${color} 35%, transparent),0 8px 20px rgba(0,0,0,.35)">${text ?? ''}</div>`,
  })
}

export default function GeoMapInner({ center, radiusMeters, markers = [], onMarkerClick, onPick, className }: GeoMapProps) {
  const { theme } = usePreferences()
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const tiles = useRef<L.TileLayer | null>(null)
  const circle = useRef<L.Circle | null>(null)
  const centerMarker = useRef<L.Marker | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  const pickRef = useRef(onPick)
  const clickRef = useRef(onMarkerClick)
  pickRef.current = onPick
  clickRef.current = onMarkerClick

  useEffect(() => {
    if (!el.current || map.current) return
    const m = L.map(el.current, { zoomControl: true, attributionControl: true }).setView([center.lat, center.lng], 13)
    map.current = m
    layer.current = L.layerGroup().addTo(m)
    m.on('click', (e: L.LeafletMouseEvent) => pickRef.current?.(e.latlng.lat, e.latlng.lng))
    return () => {
      m.remove()
      map.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const m = map.current
    if (!m) return
    tiles.current?.remove()
    tiles.current = L.tileLayer(`https://{s}.basemaps.cartocdn.com/${theme === 'dark' ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`, {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(m)
  }, [theme])

  useEffect(() => {
    const m = map.current
    if (!m) return
    const brand = theme === 'dark' ? '#10B981' : '#059669'
    circle.current?.remove()
    centerMarker.current?.remove()
    circle.current = L.circle([center.lat, center.lng], {
      radius: radiusMeters,
      color: brand,
      weight: 2,
      fillColor: brand,
      fillOpacity: 0.12,
      dashArray: '6 6',
    }).addTo(m)
    centerMarker.current = L.marker([center.lat, center.lng], { icon: pinIcon(brand, 'HQ', true) }).addTo(m)
    m.fitBounds(circle.current.getBounds(), { padding: [30, 30], maxZoom: 17 })
  }, [center.lat, center.lng, radiusMeters, theme])

  useEffect(() => {
    const g = layer.current
    if (!g) return
    g.clearLayers()
    const info = theme === 'dark' ? '#06B6D4' : '#0284C7'
    markers.forEach((mk) => {
      L.marker([mk.lat, mk.lng], { icon: pinIcon(mk.active ? '#F59E0B' : info, mk.score ? `${mk.score}%` : '', mk.active) })
        .bindTooltip(mk.label, { direction: 'top', offset: [0, -16] })
        .on('click', () => clickRef.current?.(mk.id))
        .addTo(g)
    })
  }, [markers, theme])

  return <div ref={el} className={className} role="application" aria-label="خريطة النطاق الجغرافي" />
}
