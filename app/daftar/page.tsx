'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

const draftKey = 'lapakumkm-registration-draft'
export default function DaftarPage() {
  const [form, setForm] = useState({ name: '', city: '', whatsapp: '', category: 'Kuliner', description: '', price: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [createdId, setCreatedId] = useState('')
  useEffect(() => { try { const saved = localStorage.getItem(draftKey); if (saved) setForm((current) => ({ ...current, ...JSON.parse(saved) })) } catch {} }, [])
  function update(key: keyof typeof form, value: string) {
    const next = { ...form, [key]: value }; setForm(next)
    try { localStorage.setItem(draftKey, JSON.stringify(next)) } catch {}
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(''); setLoading(true)
    try {
      const supabase = createSupabaseBrowser()
      let { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        const { data, error } = await supabase.auth.signUp({ email: form.email.trim(), password: form.password })
        if (error) throw error
        session = data.session
        if (!session) { setMessage('Akun dibuat. Buka email untuk verifikasi, lalu masuk dan kirim pendaftaran kembali.'); setLoading(false); return }
      }
      const response = await fetch('/api/businesses', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ name: form.name, city: form.city, whatsapp: form.whatsapp, category: form.category, description: form.description, price: form.price }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Pendaftaran gagal.')
      setCreatedId(data.business.id)
      localStorage.setItem('lapakumkm-business-id', data.business.id)
      localStorage.removeItem(draftKey)
      setMessage('Lapak berhasil disimpan dan sudah tampil di direktori.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Terjadi kesalahan. Coba lagi.') }
    finally { setLoading(false) }
  }
  if (createdId) return <main className="form-page"><div className="form-card success-card"><span className="success-icon">✓</span><span className="eyebrow">Pendaftaran tersimpan</span><h1>Lapak Anda siap ditemukan.</h1><p>{message}</p><div className="form-actions"><Link className="button button-orange" href="/">Lihat direktori</Link><Link className="button button-light" href="/upgrade-pro">Lihat Paket Pro</Link></div></div></main>
  return <main className="form-page"><Link className="back-link" href="/">← Kembali ke beranda</Link><div className="form-card"><span className="eyebrow">Bergabung bersama LapakUMKM</span><h1>Daftarkan usaha Anda</h1><p className="form-intro">Buat akun dan profil usaha gratis. Data tersimpan aman di database, draft formulir tersimpan di browser ini.</p><form onSubmit={submit} className="form-grid"><label>Nama usaha<input required minLength={2} maxLength={100} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Contoh: Soto Bu Rahayu"/></label><div className="two-fields"><label>Kota<input required minLength={2} value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Ponorogo"/></label><label>Kategori<select value={form.category} onChange={(e) => update('category', e.target.value)}><option>Kuliner</option><option>Jasa</option><option>Fashion</option><option>Kerajinan</option><option>Lainnya</option></select></label></div><label>Nomor WhatsApp<input required type="tel" inputMode="tel" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} placeholder="081234567890"/><small>Nomor hanya dipakai untuk tombol chat pembeli.</small></label><div className="two-fields"><label>Harga mulai<input value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="Contoh: Rp 15.000"/></label><label>Deskripsi singkat<input value={form.description} maxLength={1000} onChange={(e) => update('description', e.target.value)} placeholder="Apa yang membuat usaha Anda istimewa?"/></label></div><div className="form-divider"><span>Login atau buat akun pemilik</span></div><label>Email<input required type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="nama@email.com"/></label><label>Kata sandi<input required type="password" minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Minimal 8 karakter"/></label>{message && <p className="form-message" role="status">{message}</p>}<button className="button button-orange submit-button" disabled={loading}>{loading ? 'Menyimpan...' : 'Buat lapak gratis →'}</button><p className="fine-print">Dengan mendaftar, Anda setuju menampilkan informasi usaha di direktori publik.</p></form></div></main>
}
