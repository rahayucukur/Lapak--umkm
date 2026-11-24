'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

type Business = { id: string; name: string; is_pro: boolean; pro_until: string | null }
export default function UpgradeProPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [businessId, setBusinessId] = useState('')
  const [months, setMonths] = useState(1)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    try { const id = localStorage.getItem('lapakumkm-business-id'); if (id) setBusinessId(id) } catch {}
    const supabase = createSupabaseBrowser()
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return
      const response = await fetch('/api/businesses/mine', { headers: { Authorization: `Bearer ${data.session.access_token}` } })
      if (response.ok) { const result = await response.json(); setBusinesses(result.businesses ?? []) }
    }).catch(() => undefined)
  }, [])
  async function pay() {
    setMessage('')
    if (!businessId) { setMessage('Masuk dan daftarkan lapak terlebih dahulu.'); return }
    setLoading(true)
    try {
      const supabase = createSupabaseBrowser()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sesi login tidak ditemukan. Daftar lapak atau masuk kembali.')
      const response = await fetch('/api/payment/create-pro-transaction', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ business_id: businessId, plan_months: months }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Tidak dapat membuat pembayaran.')
      window.location.assign(result.redirect_url)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Gagal membuat pembayaran.') }
    finally { setLoading(false) }
  }
  return <main className="form-page"><Link className="back-link" href="/">← Kembali ke beranda</Link><section className="form-card pro-page-card"><span className="eyebrow">✦ Lebih menonjol di direktori</span><h1>Lapak Pro</h1><p className="form-intro">Bantu usaha Anda tampil lebih menonjol dengan masa aktif Pro yang tercatat setelah pembayaran terkonfirmasi.</p><div className="plan-grid">{[{ value: 1, title: '1 bulan', price: 'Rp 50.000' }, { value: 12, title: '12 bulan', price: 'Rp 600.000', tag: 'Praktis' }].map((plan) => <button type="button" className={`plan-option ${months === plan.value ? 'plan-selected' : ''}`} onClick={() => setMonths(plan.value)} key={plan.value}>{plan.tag && <span className="plan-tag">{plan.tag}</span>}<strong>{plan.title}</strong><span>{plan.price}</span></button>)}</div><ul className="feature-list"><li>Badge Pro pada profil usaha</li><li>Prioritas tampil di direktori</li><li>Hingga 30 produk dan 30 foto</li><li>Hingga 5 video promosi</li></ul>{businesses.length > 0 && <label>Pilih lapak<select value={businessId} onChange={(e) => setBusinessId(e.target.value)}>{businesses.map((b) => <option value={b.id} key={b.id}>{b.name}{b.is_pro ? ' · Pro aktif' : ''}</option>)}</select></label>}{businesses.length === 0 && <label>ID lapak<input value={businessId} onChange={(e) => setBusinessId(e.target.value)} placeholder="Otomatis terisi setelah mendaftar di perangkat ini"/></label>}{message && <p className="form-message" role="status">{message}</p>}<button className="button button-orange submit-button" onClick={pay} disabled={loading}>{loading ? 'Membuat transaksi...' : `Lanjut bayar ${months === 1 ? 'Rp 50.000' : 'Rp 600.000'} →`}</button><p className="fine-print">Pembayaran diproses oleh Midtrans. Status Pro diaktifkan otomatis oleh notifikasi pembayaran server.</p></section></main>
}
