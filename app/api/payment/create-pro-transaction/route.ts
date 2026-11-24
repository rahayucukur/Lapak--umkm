import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { business_id, business_name, owner_email, owner_phone, plan_months = 1 } = await req.json()

  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) {
    return NextResponse.json({ error: 'MIDTRANS_SERVER_KEY belum diatur di Vercel' }, { status: 500 })
  }

  const isProd = process.env.MIDTRANS_IS_PRODUCTION === 'true'
  const snapUrl = isProd
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

  const gross_amount = 50000 * plan_months
  const order_id = `PRO-${business_id}-${Math.floor(Date.now() / 1000)}`
  const auth = Buffer.from(`${serverKey}:`).toString('base64')

  const res = await fetch(snapUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`
    },
    body: JSON.stringify({
      transaction_details: { order_id, gross_amount },
      item_details: [{ id: `PRO_${plan_months}M`, price: gross_amount, quantity: 1, name: `Paket UMKM Pro (${plan_months} Bulan)` }],
      customer_details: { first_name: business_name, email: owner_email, phone: owner_phone },
      custom_field1: business_id,
      custom_field2: String(plan_months)
    })
  })

  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: 400 })
  }

  const result = await res.json()
  return NextResponse.json({ order_id, snap_token: result.token, redirect_url: result.redirect_url })
}
