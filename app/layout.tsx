import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cairo, IBM_Plex_Sans_Arabic } from 'next/font/google'
import { PreferencesProvider } from '@/components/providers/preferences-provider'
import { StoreProvider } from '@/components/providers/store-provider'
import { AppToaster } from '@/components/app-toaster'
import './globals.css'

const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo', weight: ['500', '600', '700', '800'] })
const plex = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  variable: '--font-plex',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'منظومة | إدارة القوى العاملة والتوظيف المحلي',
  description:
    'منظومة — منصة متكاملة للحضور بالـ QR والموقع الجغرافي، الرواتب الآلية، طلبات الموظفين، والتوظيف الجغرافي للمنشآت في مصر.',
  generator: 'v0.app',
  applicationName: 'منظومة',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'منظومة', statusBarStyle: 'black-translucent' },
  icons: { icon: '/icon-512.png', apple: '/icon-512.png' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0F17' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

const bootScript = `(function(){try{var t=localStorage.getItem('manzuma-theme');var l=localStorage.getItem('manzuma-lang');var d=document.documentElement;if(t==='light')d.classList.remove('dark');if(l==='en'){d.lang='en';d.dir='ltr';}}catch(e){}})();`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`dark ${cairo.variable} ${plex.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="app-bg min-h-dvh antialiased">
        <PreferencesProvider>
          <StoreProvider>
            {children}
            <AppToaster />
          </StoreProvider>
        </PreferencesProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
