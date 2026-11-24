import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
const pricePerMonth = 50000

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (!token) return NextResponse.json({ error: 'Masuk terlebih dahulu untuk melanjutkan.' }, { status: 401 })
    const supabase = createSupabaseAdmin()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Sesi tidak valid. Silakan masuk kembali.' }, { status: 401 })
    const { business_id, plan_months } = await request.json()
    const months = Number(plan_months)
    if (typeof business_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(business_id) || ![1, 12].includes(months)) {
      return NextResponse.json({ error: 'Data usaha atau pilihan paket tidak valid.' }, { status: 400 })
    }
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) return NextResponse.json({ error: 'Pembayaran belum dikonfigurasi oleh pengelola.' }, { status: 503 })
    const { data: business, error: businessError } = await supabase.from('businesses').select('id,name,whatsapp,owner_id').eq('id', business_id).eq('owner_id', user.id).single()
    if (businessError || !business) return NextResponse.json({ error: 'Lapak tidak ditemukan atau bukan milik akun Anda.' }, { status: 404 })

    const orderId = `LPRO-${business.id.slice(0, 8)}-${Date.now()}`
    const amount = pricePerMonth * months
    const base = process.env.MIDTRANS_IS_PRODUCTION === 'true' ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com'
    const response = await fetch(`${base}/snap/v1/transactions`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}` },
      body: JSON.stringify({ transaction_details: { order_id: orderId, gross_amount: amount }, item_details: [{ id: `PRO-${months}M`, price: amount, quantity: 1, name: `LapakUMKM Pro ${months} bulan` }], customer_details: { first_name: business.name, email: user.email ?? '', phone: business.whatsapp }, custom_field1: business.id, custom_field2: String(months), callbacks: { finish: `${process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin}/upgrade-pro?status=return` } })
    })
    const result = await response.json()
    if (!response.ok || !result.token || !result.redirect_url) {
      console.error('Midtrans create transaction failed:', result)
      return NextResponse.json({ error: 'Midtrans gagal membuat transaksi. Coba beberapa saat lagi.' }, { status: 502 })
    }
    const { error: saveError } = await supabase.from('pro_payments').insert({ order_id: orderId, business_id: business.id, owner_id: user.id, amount, plan_months: months, status: 'pending', snap_token: result.token })
    if (saveError) throw saveError
    return NextResponse.json({ order_id: orderId, snap_token: result.token, redirect_url: result.redirect_url })
  } catch (error) {
    console.error('Create Pro transaction error:', error)
    return NextResponse.json({ error: 'Tidak dapat membuat transaksi saat ini.' }, { status: 500 })
  }
}
