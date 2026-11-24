import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  const body = await req.json()
  const { order_id, status_code, gross_amount, signature_key, transaction_status } = body

  const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
  const expected = crypto.createHash('sha512').update(`${order_id}${status_code}${gross_amount}${serverKey}`).digest('hex')

  if (signature_key !== expected) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  if (transaction_status === 'capture' || transaction_status === 'settlement') {
    const plan_months = parseInt(body.custom_field2 || '1')
    const pro_until = new Date(Date.now() + 30 * plan_months * 24 * 60 * 60 * 1000)
    console.log('BAYAR SUKSES:', body.custom_field1, 'Pro sampai:', pro_until)
  }

  return NextResponse.json({ status: 'ok' })
}
