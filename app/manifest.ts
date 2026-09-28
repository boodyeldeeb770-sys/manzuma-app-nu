import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'منظومة — إدارة القوى العاملة',
    short_name: 'منظومة',
    description: 'حضور ذكي، رواتب آلية، وتوظيف جغرافي للمنشآت.',
    start_url: '/',
    display: 'standalone',
    dir: 'rtl',
    lang: 'ar',
    background_color: '#0B0F17',
    theme_color: '#0B0F17',
    icons: [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }],
  }
}
