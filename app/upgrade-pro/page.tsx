'use client'
import { useState } from 'react'

export default function Upgrade() {
  const [plan, setPlan] = useState(1)
  const [nama, setNama] = useState('')
  const [wa, setWa] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const harga = 50000 * plan

  const bayar = async () => {
    if (!nama || !wa) {
      setMsg('Isi Nama Usaha & No WA dulu!')
      return
    }
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('/api/payment/create-pro-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: 'BUS-' + Date.now(),
          business_name: nama,
          owner_email: 'owner@email.com',
          owner_phone: wa,
          plan_months: plan
        })
      })
      const data = await res.json()
      setLoading(false)
      if (data.redirect_url) {
        window.open(data.redirect_url, '_blank')
      } else {
        setMsg('Gagal: ' + (data.error || 'Cek MIDTRANS_SERVER_KEY di Vercel'))
      }
    } catch (e) {
      setLoading(false)
      setMsg('Gagal konek ke server. Coba lagi.')
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 16, paddingBottom: 40 }}>
      <a href="/" style={{ color: '#16A34A', fontWeight: 700, fontSize: 13 }}>← Kembali</a>
      <h1 style={{ fontSize: 24, marginTop: 10 }}>⭐ Upgrade ke Paket Pro</h1>
      <p style={{ fontSize: 13, color: '#666' }}>Biar lapakmu selalu paling atas & bisa upload video.</p>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={() => setPlan(1)} style={{ flex: 1, padding: 14, borderRadius: 14, background: plan === 1 ? '#F97316' : '#fff', color: plan === 1 ? '#fff' : '#333', border: '1px solid #E5E7EB', fontWeight: 800 }}>
          1 Bulan<br /><span style={{ fontWeight: 400, fontSize: 12 }}>Rp 50.000</span>
        </button>
        <button onClick={() => setPlan(12)} style={{ flex: 1, padding: 14, borderRadius: 14, background: plan === 12 ? '#F97316' : '#fff', color: plan === 12 ? '#fff' : '#333', border: '1px solid #E5E7EB', fontWeight: 800 }}>
          12 Bulan<br /><span style={{ fontWeight: 400, fontSize: 12 }}>Rp 600.000</span>
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, padding: 14, marginTop: 12, fontSize: 13, lineHeight: 1.8 }}>
        ✅ 30 produk (Gratis cuma 5)<br />
        ✅ 30 foto (Gratis cuma 3)<br />
        ✅ 5 video (Gratis 0)<br />
        ✅ Badge ⭐ PRO + Selalu Paling Atas<br />
        ✅ Pantau hasil promosi
      </div>

      <input placeholder="Nama Usaha" value={nama} onChange={(e) => setNama(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #E5E7EB', background: '#fff', marginTop: 12 }} />
      <input placeholder="No WA - contoh 081234567890" value={wa} onChange={(e) => setWa(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #E5E7EB', background: '#fff', marginTop: 10 }} />

      {msg && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 700, marginTop: 12 }}>{msg}</div>}

      <button onClick={bayar} disabled={loading} style={{ width: '100%', background: '#F97316', color: '#fff', padding: 14, borderRadius: 24, fontWeight: 800, marginTop: 14 }}>
        {loading ? 'MEMBUAT TRANSAKSI...' : `💳 BAYAR PRO Rp ${harga.toLocaleString('id-ID')} - QRIS / VA / E-WALLET`}
      </button>
      <p style={{ fontSize: 11, color: '#888', textAlign: 'center', marginTop: 8 }}>Pembayaran aman via Midtrans. Pro aktif otomatis setelah bayar.</p>
    </div>
  )
}
