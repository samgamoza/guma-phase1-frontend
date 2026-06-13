import { NextRequest, NextResponse } from 'next/server'

const GENERATOR_API_URL = process.env.GENERATOR_API_URL || ''
const ADMIN_API_SECRET  = process.env.ADMIN_API_SECRET  || ''
const ADMIN_EMAILS      = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())

export async function POST(req: NextRequest) {
  const { createServerSupabaseClient } = await import('@/lib/supabase-server')
  const serverClient = createServerSupabaseClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const websiteId = formData.get('website_id') as string

  if (!websiteId) {
    return NextResponse.json({ error: 'Missing website_id' }, { status: 400 })
  }

  try {
    if (!GENERATOR_API_URL) {
      return NextResponse.json({ error: 'GENERATOR_API_URL not configured' }, { status: 503 })
    }

    const res = await fetch(`${GENERATOR_API_URL}/jobs/retry`, {
      method:  'POST',
      headers: {
        'Content-Type':   'application/json',
        'x-admin-secret': ADMIN_API_SECRET,
      },
      body: JSON.stringify({ websiteId }),
    })

    const result = await res.json()
    if (!res.ok) throw new Error(result.error || 'Generator retry failed')

    const url = new URL('/admin/generator', req.url)
    url.searchParams.set('success', 'Retry queued')
    return NextResponse.redirect(url, 303)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
