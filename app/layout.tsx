import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LapakUMKM — Direktori Usaha Lokal',
  description: 'Temukan dan promosikan produk, jasa, serta usaha lokal Indonesia. Hubungi pemilik usaha langsung lewat WhatsApp.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>
}
