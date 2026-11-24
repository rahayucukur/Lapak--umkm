import { sortLapak } from '@/lib/pro'

type Lapak = {
  nama: string
  kategori: string
  kota: string
  harga: string
  wa: string
  emoji: string
  desc: string
  is_pro: boolean
  pro_until: string | null
  created_at: string
  status: string
}

const mentah: Lapak[] = [
  {
    nama: 'Soto Ayam Cak Har',
    kategori: 'Kuliner',
    kota: 'Surabaya',
    harga: 'Rp 15.000',
    wa: '6281234567890',
    emoji: '🍲',
    desc: 'Soto ayam kampung kuah bening, buka jam 06.00 - 21.00',
    is_pro: true,
    pro_until: '2026-12-31T00:00:00Z',
    created_at: '2026-11-01T00:00:00Z',
    status: 'approved'
  },
  {
    nama: 'Rahayu Cukur Ponorogo',
    kategori: 'Jasa',
    kota: 'Ponorogo',
    harga: 'Rp 13.000',
    wa: '6281234567890',
    emoji: '💈',
    desc: 'Potong rambut anak Rp 8.000, dewasa Rp 13.000',
    is_pro: false,
    pro_until: null,
    created_at: '2026-11-20T00:00:00Z',
    status: 'approved'
  },
  {
    nama: 'Batik Tulis Bu Ani',
    kategori: 'Fashion',
    kota: 'Solo',
    harga: 'Rp 120.000',
    wa: '6281234567890',
    emoji: '👘',
    desc: 'Batik tulis asli Solo, bisa custom motif',
    is_pro: false,
    pro_until: null,
    created_at: '2026-11-19T00:00:00Z',
    status: 'approved'
  },
  {
    nama: 'Keripik Singkong Mak Ijah',
    kategori: 'Kuliner',
    kota: 'Bandung',
    harga: 'Rp 10.000',
    wa: '6281234567890',
    emoji: '🍟',
    desc: 'Keripik singkong pedas manis, kirim se-Indonesia',
    is_pro: true,
    pro_until: '2026-12-15T00:00:00Z',
    created_at: '2026-11-18T00:00:00Z',
    status: 'approved'
  }
]

const usaha = sortLapak(mentah)

export default function Home() {
  return (
    <div>
      <header style={{ background: '#16A34A', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>
          🛒 Lapak<span style={{ color: '#F97316' }}>UMKM</span>
        </div>
        <a href="/daftar" style={{ background: '#F97316', color: '#fff', padding: '8px 14px', borderRadius: 20, fontWeight: 700, fontSize: 13 }}>
          + Daftar Gratis
        </a>
      </header>

      <section style={{ background: '#16A34A', color: '#fff', padding: '36px 16px 40px', textAlign: 'center', borderRadius: '0 0 28px 28px' }}>
        <h1 style={{ fontSize: 26, lineHeight: 1.2 }}>
          Punya Usaha Tapi Sepi?<br />Biar Dicari Se-Indonesia!
        </h1>
        <p style={{ marginTop: 10, opacity: 0.9, fontSize: 14 }}>
          Daftar GRATIS. Pembeli langsung chat WA. Tanpa komisi!
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/daftar" style={{ background: '#fff', color: '#16A34A', padding: '12px 18px', borderRadius: 24, fontWeight: 800, fontSize: 13 }}>
            DAFTAR GRATIS
          </a>
          <a href="/upgrade-pro" style={{ background: '#F97316', color: '#fff', padding: '12px 18px', borderRadius: 24, fontWeight: 800, fontSize: 13 }}>
            ⭐ UPGRADE PRO Rp 50rb
          </a>
        </div>
      </section>

      <div style={{ background: '#1A1A1A', color: '#fff', borderRadius: 16, padding: 16, margin: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <div>
          <b>⭐ Paket Pro</b>
          <p style={{ fontSize: 12, opacity: 0.8 }}>30 produk, 30 foto, 5 video, selalu paling atas</p>
        </div>
        <a href="/upgrade-pro" style={{ background: '#F97316', color: '#fff', padding: '10px 14px', borderRadius: 20, fontWeight: 800, fontSize: 12, whiteSpace: 'nowrap' }}>
          UPGRADE
        </a>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '0 16px', overflowX: 'auto' }}>
        <span style={{ background: '#16A34A', color: '#fff', padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>Semua</span>
        <span style={{ background: '#fff', padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>🍲 Kuliner</span>
        <span style={{ background: '#fff', padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>💈 Jasa</span>
        <span style={{ background: '#fff', padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>👘 Fashion</span>
      </div>

      <main style={{ padding: '14px 16px 30px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontSize: 19 }}>🔥 Lapak Teratas - Pro Duluan</h2>
        <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>UMKM Pro selalu muncul paling atas.</p>
        <div style={{ display: 'grid', gap: 14, marginTop: 14 }}>
          {usaha.map((u) => (
            <div key={u.nama} style={{ background: '#fff', borderRadius: 16, padding: 14, display: 'flex', gap: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: u.is_pro ? '2px solid #F97316' : '1px solid #F3F4F6' }}>
              <div style={{ fontSize: 42, background: '#FFF7ED', borderRadius: 12, width: 72, height: 72, minWidth: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {u.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {u.is_pro && <span style={{ background: '#F97316', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 800 }}>⭐ PRO</span>}
                  <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 700 }}>{u.kategori}</span>
                  <span style={{ background: '#FFEDD5', color: '#EA580C', fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 700 }}>📍 {u.kota}</span>
                </div>
                <h3 style={{ fontSize: 16, marginTop: 6 }}>{u.nama}</h3>
                <p style={{ fontSize: 13, color: '#666' }}>{u.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <b style={{ color: '#16A34A' }}>{u.harga}</b>
                  <a href={`https://wa.me/${u.wa}`} target="_blank" rel="noopener noreferrer" style={{ background: '#22C55E', color: '#fff', padding: '8px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    💬 Chat WA
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 16, marginTop: 20 }}>
          <h3>💡 Kenapa Harus Daftar?</h3>
          <p style={{ fontSize: 13, color: '#666', marginTop: 8, lineHeight: 1.7 }}>
            ✅ Promosi gratis<br />
            ✅ Etalase online 24 jam<br />
            ✅ Pembeli langsung chat WA<br />
            ✅ ⭐ Video promosi khusus Pro<br />
            ✅ Pantau hasil promosi
          </p>
        </div>
      </main>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px', fontSize: 11, fontWeight: 700, zIndex: 10 }}>
        <a href="/" style={{ color: '#16A34A', textAlign: 'center' }}>🏠<br />Beranda</a>
        <a href="/" style={{ color: '#666', textAlign: 'center' }}>🔍<br />Jelajah</a>
        <a href="/daftar" style={{ color: '#F97316', textAlign: 'center' }}>➕<br />Tambah</a>
        <a href="/upgrade-pro" style={{ color: '#666', textAlign: 'center' }}>⭐<br />Pro</a>
        <a href="/daftar" style={{ color: '#666', textAlign: 'center' }}>👤<br />Akun</a>
      </nav>
      <div style={{ height: 70 }} />
      <footer style={{ textAlign: 'center', padding: 20, fontSize: 12, color: '#888' }}>
        © 2026 LapakUMKM.id - Bantu UMKM Naik Kelas 🇮🇩
      </footer>
    </div>
  )
}
