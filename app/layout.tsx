import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'LapakUMKM — Direktori Usaha Lokal',
  description: 'Temukan dan promosikan produk, jasa, serta usaha lokal Indonesia. Hubungi pemilik usaha langsung lewat WhatsApp.',
  icons: { icon: '/favicon.ico' },
}

const midtransScript = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
  return <html lang="id"><body>{children}{clientKey && <Script src={midtransScript} data-client-key={clientKey} strategy="lazyOnload" />}</body></html>
}
