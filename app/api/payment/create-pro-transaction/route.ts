import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

const PLANS = {
  pro_1_bulan: { name: 'LapakUMKM Pro - 1 Bulan', amount: 25000, months: 1 },
  pro_6_bulan: { name: 'LapakUMKM Pro - 6 Bulan (+1 Bulan Bonus)', amount: 125000, months: 7 },
  pro_1_tahun: { name: 'LapakUMKM Pro - 1 Tahun (+3 Bulan Bonus)', amount: 199000, months: 15 },
} as const

type PlanId = keyof typeof PLANS

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (!token) return NextResponse.json({ error: 'Masuk terlebih dahulu untuk melanjutkan.' }, { status: 401 })
    const supabase = createSupabaseAdmin()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Sesi tidak valid. Silakan masuk kembali.' }, { status: 401 })

    const body = await request.json()
    const businessId = typeof body.business_id === 'string' ? body.business_id : ''
    const planId = body.paketId as PlanId
    if (!/^[0-9a-f-]{36}$/i.test(businessId) || !Object.hasOwn(PLANS, planId)) {
      return NextResponse.json({ error: 'Lapak atau pilihan paket tidak valid.' }, { status: 400 })
    }
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) return NextResponse.json({ error: 'Pembayaran belum dikonfigurasi oleh pengelola.' }, { status: 503 })

    const { data: business, error: businessError } = await supabase.from('businesses')
      .select('id,name,whatsapp,owner_id').eq('id', businessId).eq('owner_id', user.id).single()
    if (businessError || !business) return NextResponse.json({ error: 'Lapak tidak ditemukan atau bukan milik akun Anda.' }, { status: 404 })

    const plan = PLANS[planId]
    const orderId = `LAPAKUMKM-${business.id.slice(0, 8)}-${Date.now()}-${randomUUID().slice(0, 8)}`
    const { error: insertError } = await supabase.from('pro_payments').insert({ order_id: orderId, business_id: business.id, owner_id: user.id, amount: plan.amount, plan_id: planId, plan_months: plan.months, status: 'pending' })
    if (insertError) throw insertError

    const baseUrl = process.env.MIDTRANS_IS_PRODUCTION === 'true' ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com'
    const response = await fetch(`${baseUrl}/snap/v1/transactions`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}` },
      body: JSON.stringify({
        transaction_details: { order_id: orderId, gross_amount: plan.amount },
        item_details: [{ id: planId, price: plan.amount, quantity: 1, name: plan.name }],
        customer_details: { first_name: business.name, email: user.email ?? 'umkm@lapakumkm.id', phone: business.whatsapp },
        enabled_payments: ['gopay', 'other_qris', 'bsi_va', 'bank_transfer'],
        callbacks: { finish: `${process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin}/upgrade-pro?status=return` },
      }),
    })
    const result = await response.json()
    if (!response.ok || !result.token || !result.redirect_url) {
      await supabase.from('pro_payments').update({ status: 'failed' }).eq('order_id', orderId)
      console.error('Midtrans create transaction failed:', result)
      return NextResponse.json({ error: 'Midtrans gagal membuat transaksi. Coba beberapa saat lagi.' }, { status: 502 })
    }
    const { error: updateError } = await supabase.from('pro_payments').update({ snap_token: result.token }).eq('order_id', orderId)
    if (updateError) throw updateError
    return NextResponse.json({ order_id: orderId, token: result.token, snap_token: result.token, redirect_url: result.redirect_url })
  } catch (error) {
    console.error('Create Pro transaction error:', error)
    return NextResponse.json({ error: 'Tidak dapat membuat transaksi saat ini.' }, { status: 500 })
  }
}
