import { NextResponse } from 'next/server'
import { timingSafeEqual, createHash } from 'crypto'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey || typeof order_id !== 'string' || typeof status_code !== 'string' || typeof gross_amount !== 'string' || typeof signature_key !== 'string' || typeof transaction_status !== 'string') {
      return NextResponse.json({ error: 'Invalid notification' }, { status: 400 })
    }
    const expected = createHash('sha512').update(`${order_id}${status_code}${gross_amount}${serverKey}`).digest('hex')
    const received = Buffer.from(signature_key, 'utf8')
    const expectedBuffer = Buffer.from(expected, 'utf8')
    if (received.length !== expectedBuffer.length || !timingSafeEqual(received, expectedBuffer)) return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })

    const supabase = createSupabaseAdmin()
    const { data: payment, error } = await supabase.from('pro_payments').select('order_id,amount').eq('order_id', order_id).single()
    if (error || !payment || Number(gross_amount) !== payment.amount) return NextResponse.json({ error: 'Unknown or mismatched order' }, { status: 404 })
    const isPaid = transaction_status === 'settlement' || (transaction_status === 'capture' && (!fraud_status || fraud_status === 'accept'))
    const nextStatus = isPaid ? 'paid' : transaction_status === 'expire' ? 'expired' : transaction_status === 'cancel' || transaction_status === 'deny' ? 'failed' : 'pending'

    const { error: applyError } = await supabase.rpc('apply_midtrans_notification', {
      p_order_id: order_id,
      p_amount: payment.amount,
      p_status: nextStatus,
      p_transaction_status: transaction_status,
    })
    if (applyError) {
      console.error('Could not apply Midtrans notification:', applyError)
      return NextResponse.json({ error: 'Notification could not be processed' }, { status: 500 })
    }
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Midtrans webhook error:', error)
    return NextResponse.json({ error: 'Notification could not be processed' }, { status: 500 })
  }
}
