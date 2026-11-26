'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

declare global {
  interface Window {
    snap?: { pay: (token: string, callbacks: { onSuccess: (result: unknown) => void; onPending: (result: unknown) => void; onError: (result: unknown) => void; onClose: () => void }) => void }
  }
}

type Business = { id: string; name: string; is_pro: boolean; pro_until: string | null }
const plans = [
  { id: 'pro_1_bulan', title: '1 bulan', price: 'Rp 25.000', detail: 'Paket bulanan' },
  { id: 'pro_6_bulan', title: '6 bulan', price: 'Rp 125.000', detail: '+ 1 bulan bonus · total 7 bulan', tag: 'Hemat' },
  { id: 'pro_1_tahun', title: '1 tahun', price: 'Rp 199.000', detail: '+ 3 bulan bonus · total 15 bulan', tag: 'Paling hemat' },
] as const

type PlanId = typeof plans[number]['id']
export default function UpgradeProPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [businessId, setBusinessId] = useState('')
  const [planId, setPlanId] = useState<PlanId>('pro_1_bulan')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try { const id = localStorage.getItem('lapakumkm-business-id'); if (id) setBusinessId(id) } catch {}
    try {
      const supabase = createSupabaseBrowser()
      supabase.auth.getSession().then(async ({ data }) => {
        if (!data.session) return
        const response = await fetch('/api/businesses/mine', { headers: { Authorization: `Bearer ${data.session.access_token}` } })
        if (response.ok) {
          const result = await response.json()
          setBusinesses(result.businesses ?? [])
          try { if (result.businesses?.length && !localStorage.getItem('lapakumkm-business-id')) setBusinessId(result.businesses[0].id) } catch {}
        }
      }).catch(() => undefined)
    } catch { /* Supabase env may be set after local development starts. */ }
  }, [])

  async function pay() {
    setMessage('')
    if (!businessId) { setMessage('Daftarkan lapak dan masuk ke akun pemilik terlebih dahulu.'); return }
    if (!window.snap) { setMessage('Form pembayaran belum siap. Periksa Client Key Midtrans dan coba muat ulang halaman.'); return }
    setLoading(true)
    try {
      const supabase = createSupabaseBrowser()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sesi login tidak ditemukan. Daftar lapak atau masuk kembali.')
      const response = await fetch('/api/payment/create-pro-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ business_id: businessId, paketId: planId }),
      })
      const result = await response.json()
      if (!response.ok || !result.token) throw new Error(result.error || 'Tidak dapat membuat pembayaran.')
      window.snap.pay(result.token, {
        onSuccess: () => setMessage('Pembayaran berhasil diterima. Paket Pro akan aktif setelah server mengonfirmasi notifikasi Midtrans.'),
        onPending: () => setMessage('Menunggu pembayaran. Selesaikan pembayaran sesuai instruksi Midtrans.'),
        onError: () => setMessage('Pembayaran gagal diproses. Silakan coba kembali.'),
        onClose: () => setMessage('Jendela pembayaran ditutup. Transaksi yang belum dibayar dapat dilanjutkan sesuai statusnya.'),
      })
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Gagal membuat pembayaran.') }
    finally { setLoading(false) }
  }

  return <main className="form-page"><Link className="back-link" href="/">← Kembali ke beranda</Link><section className="form-card pro-page-card"><span className="eyebrow">✦ Lebih menonjol di direktori</span><h1>Lapak Pro</h1><p className="form-intro">Pilih paket Pro untuk menonjolkan lapak Anda. Status dan masa aktif akan diperbarui setelah pembayaran terkonfirmasi Midtrans.</p><div className="plan-grid plan-grid-three">{plans.map((plan) => <button type="button" className={`plan-option ${planId === plan.id ? 'plan-selected' : ''}`} onClick={() => setPlanId(plan.id)} key={plan.id}>{'tag' in plan && <span className="plan-tag">{plan.tag}</span>}<strong>{plan.title}</strong><span>{plan.price}</span><small>{plan.detail}</small></button>)}</div><ul className="feature-list"><li>Badge Pro pada profil usaha</li><li>Prioritas tampil di direktori</li><li>Hingga 30 produk dan 30 foto</li><li>Hingga 5 video promosi</li></ul>{businesses.length > 0 ? <label>Pilih lapak<select value={businessId} onChange={(e) => setBusinessId(e.target.value)}>{businesses.map((business) => <option value={business.id} key={business.id}>{business.name}{business.is_pro ? ' · Pro aktif' : ''}</option>)}</select></label> : <label>ID lapak<input value={businessId} onChange={(e) => setBusinessId(e.target.value)} placeholder="ID otomatis tersimpan setelah mendaftar di perangkat ini"/></label>}{message && <p className="form-message" role="status">{message}</p>}<button className="button button-orange submit-button" onClick={pay} disabled={loading}>{loading ? 'Membuat transaksi...' : `Lanjut bayar ${plans.find((plan) => plan.id === planId)?.price} →`}</button><p className="fine-print">Pembayaran aman melalui jendela Midtrans. Aktivasi Pro hanya dilakukan setelah webhook tervalidasi.</p></section></main>
}
