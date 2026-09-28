'use client'

import { useState } from 'react'
import { Hero } from '@/components/landing/hero'
import { LandingHeader } from '@/components/landing/landing-header'
import { AuthModal, HelpModal, PoliciesModal } from '@/components/landing/landing-modals'
import { About, Features, Footer, StatsStrip } from '@/components/landing/sections'

export default function LandingPage() {
  const [auth, setAuth] = useState<{ open: boolean; role: 'employer' | 'employee' }>({ open: false, role: 'employer' })
  const [policies, setPolicies] = useState(false)
  const [help, setHelp] = useState(false)

  return (
    <>
      <LandingHeader onLogin={() => setAuth({ open: true, role: 'employer' })} onPolicies={() => setPolicies(true)} onHelp={() => setHelp(true)} />
      <main>
        <Hero onStart={(role) => setAuth({ open: true, role })} />
        <StatsStrip />
        <Features />
        <About />
      </main>
      <Footer onPolicies={() => setPolicies(true)} onHelp={() => setHelp(true)} />
      <AuthModal open={auth.open} initialRole={auth.role} onClose={() => setAuth((a) => ({ ...a, open: false }))} />
      <PoliciesModal open={policies} onClose={() => setPolicies(false)} />
      <HelpModal open={help} onClose={() => setHelp(false)} />
    </>
  )
}
