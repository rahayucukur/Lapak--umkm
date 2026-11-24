import { NextResponse } from 'next/server'
import { timingSafeEqual, createHash } from 'crypto'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey || typeof order_id !== 'string' || typeof status_code !== 'string' || typeof gross_amount !== 'string' || typeof signature_key !== 'string') {
      return NextResponse.json({ error: 'Invalid notification' }, { status: 400 })
    }
    const expected = createHash('sha512').update(`${order_id}${status_code}${gross_amount}${serverKey}`).digest('hex')
    const received = Buffer.from(signature_key, 'utf8')
    const expectedBuffer = Buffer.from(expected, 'utf8')
    if (received.length !== expectedBuffer.length || !timingSafeEqual(received, expectedBuffer)) return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })

    const supabase = createSupabaseAdmin()
    const { data: payment, error } = await supabase.from('pro_payments').select('id,business_id,amount,plan_months,status').eq('order_id', order_id).single()
    if (error || !payment || Number(gross_amount) !== payment.amount) return NextResponse.json({ error: 'Unknown or mismatched order' }, { status: 404 })
    const isPaid = transaction_status === 'settlement' || (transaction_status === 'capture' && (!fraud_status || fraud_status === 'accept'))
    const nextStatus = isPaid ? 'paid' : transaction_status === 'expire' ? 'expired' : transaction_status === 'cancel' || transaction_status === 'deny' ? 'failed' : 'pending'
    if (payment.status !== 'paid' && isPaid) {
      const { data: business, error: businessError } = await supabase.from('businesses').select('pro_until').eq('id', payment.business_id).single()
      if (businessError || !business) throw businessError ?? new Error('Business not found')
      const currentExpiry = business.pro_until ? new Date(business.pro_until).getTime() : 0
      const start = Math.max(Date.now(), Number.isFinite(currentExpiry) ? currentExpiry : 0)
      const expiry = new Date(start)
      expiry.setUTCMonth(expiry.getUTCMonth() + payment.plan_months)
      const { error: updateBusinessError } = await supabase.from('businesses').update({ is_pro: true, pro_until: expiry.toISOString() }).eq('id', payment.business_id)
      if (updateBusinessError) throw updateBusinessError
    }
    const { error: updatePaymentError } = await supabase.from('pro_payments').update({ status: nextStatus, transaction_status, updated_at: new Date().toISOString() }).eq('id', payment.id)
    if (updatePaymentError) throw updatePaymentError
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Midtrans webhook error:', error)
    return NextResponse.json({ error: 'Notification could not be processed' }, { status: 500 })
  }
}
