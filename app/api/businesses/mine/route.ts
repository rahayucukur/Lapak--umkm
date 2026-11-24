import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const supabase = createSupabaseAdmin()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data, error } = await supabase.from('businesses').select('id,name,is_pro,pro_until,created_at').eq('owner_id', user.id).order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ businesses: data ?? [] })
  } catch (error) {
    console.error('Owner businesses error:', error)
    return NextResponse.json({ error: 'Tidak dapat memuat lapak.' }, { status: 500 })
  }
}
