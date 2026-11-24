import './globals.css'

export const metadata = {
  title: 'LapakUMKM - Cari Usaha Lokal',
  description: 'Direktori UMKM Indonesia, langsung chat WA tanpa komisi.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
