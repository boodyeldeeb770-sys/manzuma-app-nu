'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { initialState } from '@/lib/mock-data'
import type { AppNotification, AppState } from '@/lib/types'

const STORAGE_KEY = 'manzuma-state-v1'

interface StoreValue {
  state: AppState
  update: (fn: (s: AppState) => AppState) => void
  reset: () => void
  hydrated: boolean
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)
  const [hydrated, setHydrated] = useState(false)
  const skipFirstSave = useRef(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setState({ ...initialState, ...JSON.parse(raw) })
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (skipFirstSave.current) {
      skipFirstSave.current = false
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, hydrated])

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), [])
  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState(initialState)
  }, [])

  return <StoreContext.Provider value={{ state, update, reset, hydrated }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export const uid = () => Math.random().toString(36).slice(2, 10)

export function withNotification(
  s: AppState,
  n: Omit<AppNotification, 'id' | 'at' | 'read'>,
): AppState {
  return { ...s, notifications: [{ ...n, id: uid(), at: new Date().toISOString(), read: false }, ...(s.notifications ?? [])].slice(0, 50) }
}
