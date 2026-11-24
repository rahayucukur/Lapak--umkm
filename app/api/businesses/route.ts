import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

async function getOwner(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return null
  const supabase = createSupabaseAdmin()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  return error ? null : user
}

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase.from('businesses').select('id,name,category,city,description,price,whatsapp,emoji,is_pro,pro_until,created_at').eq('status', 'approved').order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ businesses: data ?? [] })
  } catch (error) {
    console.error('Business list error:', error)
    return NextResponse.json({ error: 'Belum dapat memuat lapak. Periksa konfigurasi database.' }, { status: 503 })
  }
}

export async function POST(request: Request) {
  try {
    const owner = await getOwner(request)
    if (!owner) return NextResponse.json({ error: 'Silakan daftar atau masuk terlebih dahulu.' }, { status: 401 })
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const city = typeof body.city === 'string' ? body.city.trim() : ''
    const whatsapp = typeof body.whatsapp === 'string' ? body.whatsapp.replace(/\D/g, '') : ''
    const category = typeof body.category === 'string' ? body.category : ''
    const allowed = ['Kuliner', 'Jasa', 'Fashion', 'Kerajinan', 'Lainnya']
    if (name.length < 2 || name.length > 100 || city.length < 2 || city.length > 100 || !/^\d{9,15}$/.test(whatsapp) || !allowed.includes(category)) {
      return NextResponse.json({ error: 'Periksa nama, kota, kategori, dan nomor WhatsApp (9–15 digit).' }, { status: 400 })
    }
    const supabase = createSupabaseAdmin()
    const { count, error: countError } = await supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('owner_id', owner.id)
    if (countError) throw countError
    if ((count ?? 0) >= 5) return NextResponse.json({ error: 'Maksimal 5 lapak untuk satu akun.' }, { status: 400 })
    const { data, error } = await supabase.from('businesses').insert({ owner_id: owner.id, name, city, whatsapp, category, description: String(body.description ?? '').trim().slice(0, 1000), price: String(body.price ?? '').trim().slice(0, 80), emoji: String(body.emoji ?? '🏪').slice(0, 8), status: 'approved', is_pro: false }).select('id,name,city,category').single()
    if (error) throw error
    return NextResponse.json({ business: data }, { status: 201 })
  } catch (error) {
    console.error('Business create error:', error)
    return NextResponse.json({ error: 'Lapak belum tersimpan. Periksa konfigurasi database lalu coba lagi.' }, { status: 503 })
  }
}
