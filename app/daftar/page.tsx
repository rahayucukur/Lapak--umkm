'use client'
import { useState } from 'react'
import { getMediaLimits } from '@/lib/pro'

export default function Daftar() {
  const [nama, setNama] = useState('')
  const [kota, setKota] = useState('')
  const [wa, setWa] = useState('')
  const [kategori, setKategori] = useState('Kuliner')
  const [isPro, setIsPro] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [videos, setVideos] = useState<string[]>([])
  const [msg, setMsg] = useState('')
  const [sukses, setSukses] = useState(false)

  const limits = getMediaLimits({ is_pro: isPro, pro_until: isPro ? '2026-12-31T00:00:00Z' : null })

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const baru = [...photos, ...Array.from(e.target.files).map((f) => URL.createObjectURL(f))]
    if (baru.length > limits.maxPhotos) {
      setMsg(isPro ? 'Paket Pro maksimal 30 foto.' : 'Paket Gratis maksimal 3 foto. Upgrade ke Paket Pro untuk unggah hingga 30 foto!')
      return
    }
    setPhotos(baru)
    setMsg('')
  }

  const onVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (limits.maxVideos === 0) {
      setMsg('Fitur video hanya tersedia untuk UMKM Paket Pro.')
      return
    }
    if (!e.target.files) return
    const baru = [...videos, ...Array.from(e.target.files).map((f) => URL.createObjectURL(f))]
    if (baru.length > limits.maxVideos) {
      setMsg('Paket Pro maksimal 5 video.')
      return
    }
    setVideos(baru)
    setMsg('')
  }

  const submit = () => {
    if (!nama || !kota || !wa) {
      setMsg('Isi Nama Usaha, Kota, dan No WA dulu!')
      return
    }
    setSukses(true)
  }

  if (sukses) {
    return (
      <div style={{ maxWidth: 480, margin: '40px auto', padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 60 }}>🎉</div>
        <h2>Lapak Berhasil Dibuat!</h2>
        <p style={{ marginTop: 8, color: '#666' }}>{nama} - {kota} - {isPro ? '⭐ PRO' : 'GRATIS'}</p>
        <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Foto: {photos.length}/{limits.maxPhotos} | Video: {videos.length}/{limits.maxVideos}</p>
        <a href="/" style={{ display: 'inline-block', background: '#16A34A', color: '#fff', padding: '12px 22px', borderRadius: 24, fontWeight: 800, marginTop: 20 }}>
          Lihat Halaman Utama →
        </a>
        <br />
        <a href="/upgrade-pro" style={{ display: 'inline-block', marginTop: 12, color: '#F97316', fontWeight: 700, fontSize: 13 }}>
          ⭐ Upgrade ke Pro - Rp 50.000 →
        </a>
      </div>
    )
  }

  const inp: React.CSSProperties = { width: '100%', padding: 12, borderRadius: 12, border: '1px solid #E5E7EB', background: '#fff' }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 16, paddingBottom: 40 }}>
      <a href="/" style={{ color: '#16A34A', fontWeight: 700, fontSize: 13 }}>← Kembali</a>
      <h1 style={{ marginTop: 10 }}>Daftar Lapak Gratis</h1>
      <p style={{ fontSize: 13, color: '#666' }}>Isi data usaha, langsung tampil di halaman utama.</p>

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button onClick={() => setIsPro(false)} style={{ flex: 1, padding: 12, borderRadius: 14, background: !isPro ? '#16A34A' : '#fff', color: !isPro ? '#fff' : '#333', border: '1px solid #E5E7EB', fontWeight: 700 }}>
          GRATIS<br /><span style={{ fontWeight: 400, fontSize: 11 }}>5 Produk • 3 Foto • 0 Video</span>
        </button>
        <button onClick={() => setIsPro(true)} style={{ flex: 1, padding: 12, borderRadius: 14, background: isPro ? '#F97316' : '#fff', color: isPro ? '#fff' : '#333', border: '1px solid #E5E7EB', fontWeight: 700 }}>
          ⭐ PRO<br /><span style={{ fontWeight: 400, fontSize: 11 }}>30 Produk • 30 Foto • 5 Video</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
        <input style={inp} placeholder="Nama Usaha *" value={nama} onChange={(e) => setNama(e.target.value)} />
        <input style={inp} placeholder="Kota *" value={kota} onChange={(e) => setKota(e.target.value)} />
        <input style={inp} placeholder="No WA * contoh 081234567890" value={wa} onChange={(e) => setWa(e.target.value)} />
        <select style={inp} value={kategori} onChange={(e) => setKategori(e.target.value)}>
          <option>Kuliner</option>
          <option>Jasa</option>
          <option>Fashion</option>
          <option>Kerajinan</option>
        </select>

        <div>
          <b style={{ fontSize: 13 }}>📸 Foto ({photos.length}/{limits.maxPhotos})</b>
          <input type="file" accept="image/*" multiple onChange={onPhoto} style={{ display: 'block', marginTop: 6 }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            {photos.map((p, i) => (
              <img key={i} src={p} alt="foto usaha" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
            ))}
          </div>
        </div>

        <div>
          <b style={{ fontSize: 13 }}>🎥 Video ({videos.length}/{limits.maxVideos})</b>
          <input type="file" accept="video/*" multiple onChange={onVideo} style={{ display: 'block', marginTop: 6 }} disabled={limits.maxVideos === 0} />
          {limits.maxVideos === 0 && <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Video hanya untuk Pro. Pilih PRO di atas untuk aktifkan.</p>}
          {videos.length > 0 && <p style={{ fontSize: 12, color: '#16A34A', marginTop: 4 }}>✅ {videos.length} video dipilih</p>}
        </div>

        {msg && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 700 }}>{msg}</div>}

        <button onClick={submit} style={{ background: '#F97316', color: '#fff', padding: 14, borderRadius: 24, fontWeight: 800 }}>
          BUAT LAPAK SAYA →
        </button>

        {isPro && (
          <a href="/upgrade-pro" style={{ textAlign: 'center', color: '#F97316', fontWeight: 700, fontSize: 13 }}>
            Aktifin PRO sekarang - Bayar Rp 50.000 →
          </a>
        )}
      </div>
    </div>
  )
}
