'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { sortLapak } from '@/lib/pro'

type Business = { id: string; name: string; category: string; city: string; description: string; price: string; whatsapp: string; emoji: string; is_pro: boolean; pro_until: string | null; created_at: string }
const samples: Business[] = [
  { id: 'demo-1', name: 'Soto Ayam Cak Har', category: 'Kuliner', city: 'Surabaya', description: 'Soto ayam kampung kuah bening, buka setiap hari.', price: 'Rp 15.000', whatsapp: '6281234567890', emoji: '🍲', is_pro: true, pro_until: '2027-12-31', created_at: '2026-11-01' },
  { id: 'demo-2', name: 'Rahayu Cukur Ponorogo', category: 'Jasa', city: 'Ponorogo', description: 'Potong rambut anak dan dewasa, ramah keluarga.', price: 'Mulai Rp 8.000', whatsapp: '6281234567890', emoji: '💈', is_pro: false, pro_until: null, created_at: '2026-11-20' },
  { id: 'demo-3', name: 'Batik Tulis Bu Ani', category: 'Fashion', city: 'Solo', description: 'Batik tulis asli Solo, bisa pesan motif khusus.', price: 'Mulai Rp 120.000', whatsapp: '6281234567890', emoji: '👘', is_pro: false, pro_until: null, created_at: '2026-11-19' },
  { id: 'demo-4', name: 'Keripik Singkong Mak Ijah', category: 'Kuliner', city: 'Bandung', description: 'Keripik singkong pedas manis, tersedia untuk pengiriman.', price: 'Rp 10.000', whatsapp: '6281234567890', emoji: '🍟', is_pro: true, pro_until: '2027-12-15', created_at: '2026-11-18' },
]
const categories = ['Semua', 'Kuliner', 'Jasa', 'Fashion', 'Kerajinan', 'Lainnya']

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>(samples)
  const [category, setCategory] = useState('Semua')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  useEffect(() => {
    fetch('/api/businesses').then(async (res) => { if (!res.ok) throw new Error(); const data = await res.json(); setBusinesses(data.businesses ?? []) }).catch(() => setNotice('Menampilkan contoh lapak. Hubungkan Supabase untuk memuat direktori langsung.'))
  }, [])
  const filtered = useMemo(() => sortLapak(businesses).filter((item) => (category === 'Semua' || item.category === category) && `${item.name} ${item.city} ${item.description}`.toLowerCase().includes(query.toLowerCase())), [businesses, category, query])
  return <div className="site-shell">
    <header className="topbar"><Link className="brand" href="/" aria-label="LapakUMKM beranda"><span className="brand-mark">L</span><span>Lapak<span className="brand-accent">UMKM</span></span></Link><nav className="top-links"><a href="#jelajah">Jelajah</a><a href="#cara-kerja">Cara kerja</a><Link href="/upgrade-pro">Paket Pro</Link></nav><Link className="button button-orange button-small" href="/daftar">+ Daftarkan usaha</Link></header>
    <main>
      <section className="hero"><div className="hero-copy"><span className="eyebrow">🌱 Etalase lokal Indonesia</span><h1>Usaha lokal layak <span>lebih dikenal.</span></h1><p>Temukan produk, jasa, dan tempat jualan di sekitar Anda. Hubungi pemilik usaha langsung lewat WhatsApp—tanpa komisi.</p><div className="hero-actions"><Link className="button button-orange" href="#jelajah">Jelajahi lapak <span>→</span></Link><Link className="button button-light" href="/daftar">Promosikan usaha gratis</Link></div><div className="hero-proof"><span>✓ Gratis untuk mulai</span><span>✓ Chat langsung ke pemilik</span></div></div><div className="hero-art" role="img" aria-label="Ilustrasi belanja usaha lokal"><div className="art-sun"/><div className="art-card"><span className="art-emoji">🧺</span><strong>Belanja dekat,<br/>dukung warga sekitar.</strong><span className="art-chip">Dari Indonesia 🇮🇩</span></div><span className="float float-one">🥬</span><span className="float float-two">🥖</span><span className="float float-three">🌼</span></div></section>
      <section className="benefits" id="cara-kerja"><article><span>📣</span><div><h3>Promosi tanpa biaya</h3><p>Buat etalase digital untuk usaha lokal Anda.</p></div></article><article><span>💬</span><div><h3>Tanpa perantara</h3><p>Pembeli chat langsung ke WhatsApp usaha.</p></div></article><article><span>📱</span><div><h3>Mudah dari ponsel</h3><p>Daftar dan kelola profil dengan praktis.</p></div></article></section>
      <section className="directory section-wrap" id="jelajah"><div className="section-heading"><div><span className="eyebrow">Temukan favorit Anda</span><h2>Jelajah lapak lokal</h2><p>Kenali usaha menarik dari berbagai kota di Indonesia.</p></div><label className="search-box"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari usaha atau kota..." aria-label="Cari usaha atau kota"/></label></div><div className="filter-row" role="group" aria-label="Filter kategori">{categories.map((item) => <button key={item} className={`filter-pill ${category === item ? 'selected' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}</div>{notice && <p className="notice">{notice}</p>}<div className="business-grid">{filtered.map((item) => <article className={`business-card ${item.is_pro ? 'pro-card' : ''}`} key={item.id}><div className="business-art"><span>{item.emoji || '🏪'}</span>{item.is_pro && <span className="pro-badge">✦ PILIHAN PRO</span>}</div><div className="business-content"><div className="business-meta"><span>{item.category}</span><span>📍 {item.city}</span></div><h3>{item.name}</h3><p>{item.description || 'Temukan produk dan layanan usaha lokal ini.'}</p><div className="business-footer"><strong>{item.price || 'Tanya harga'}</strong><a className="whatsapp-link" href={`https://wa.me/${item.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp ↗</a></div></div></article>)}</div>{filtered.length === 0 && <div className="empty-state"><span>🔎</span><h3>Belum ada lapak yang cocok</h3><p>Coba kata kunci atau kategori lain.</p></div>}</section>
      <section className="join-banner"><div><span className="eyebrow">Punya usaha lokal?</span><h2>Mulai dikenal lebih banyak orang.</h2><p>Buat profil usaha gratis dan biarkan pembeli menemukan Anda.</p></div><Link className="button button-dark" href="/daftar">Daftar lapak gratis <span>→</span></Link></section>
    </main><footer className="footer"><Link className="brand" href="/"><span className="brand-mark">L</span><span>Lapak<span className="brand-accent">UMKM</span></span></Link><span>© 2026 LapakUMKM · Dukung usaha lokal Indonesia</span><Link href="/upgrade-pro">Tentang Paket Pro</Link></footer><nav className="mobile-nav"><Link href="/">⌂<span>Beranda</span></Link><a href="#jelajah">⌕<span>Jelajah</span></a><Link href="/daftar">＋<span>Tambah</span></Link><Link href="/upgrade-pro">✦<span>Pro</span></Link></nav>
  </div>
}
