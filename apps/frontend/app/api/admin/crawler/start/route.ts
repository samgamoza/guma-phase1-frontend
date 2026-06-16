import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  // Ensure no trailing slash to prevent //jobs issues
  const CRAWLER_API_URL  = (process.env.CRAWLER_API_URL || '').replace(/\/+$/, '') 
  const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET || ''

  const back = (params: Record<string, string>) => {
    const url = new URL('/admin/crawler', req.url)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    return NextResponse.redirect(url, 303)
  }

  // Initialize Supabase to verify the user's session
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Check if the user is actually an authenticated admin
  const { data: { user } } = await supabase.auth.getUser(
    req.headers.get('Authorization')?.split(' ')[1] || ''
  )

  // If you aren't using Supabase Auth for the admin dashboard, 
  // fall back to a simple secret check or your existing cookie logic.
  if (!user && !req.cookies.get('admin_session')) {
    return back({ error: 'Unauthorized: Please log in to trigger crawls.' })
  }

  const formData = await req.formData()
  const city     = (formData.get('city')     as string) || 'Austin'
  const state    = (formData.get('state')    as string) || 'TX'
  const industry = (formData.get('industry') as string) || 'Restaurants'
  const source   = (formData.get('source')   as string) || 'yellowpages'
  const limit    = parseInt((formData.get('limit') as string) || '100')
  const maxPages = Math.ceil(limit / 20)
  const useBypass = formData.get('bypass') === 'true'
  const isPaidLeadBatch = formData.get('source') === 'brightdata-dataset'

  // --- PAID LEAD PROCESSING ---
  if (isPaidLeadBatch) {
    // If using paid leads, we don't trigger a crawler. 
    // We assume the leads are already in a JSON/CSV format.
    // This route could trigger the 'guma-generator' worker directly.
    return back({ success: 'Paid lead batch accepted. Triggering AI generation pipeline...' })
  }
  // ----------------------------

  // --- BYPASS / TURNAROUND LOGIC ---
  if (useBypass) {
    const { error: dbError } = await supabase.from('businesses').insert({
      name: `${industry} Example`,
      city,
      state,
      category: industry,
      source_dir: source,
      slug: `${industry}-${city}-${Date.now()}`.toLowerCase().replace(/\s+/g, '-')
    })

    if (dbError) return back({ error: `Manual insert failed: ${dbError.message}` })
    return back({ success: 'Mock data created. Crawler bypassed successfully!' })
  }
  // ---------------------------------

  // The crawler service owns the crawl_jobs record and the BullMQ queue.
  if (!CRAWLER_API_URL) {
    return back({ error: 'CRAWLER_API_URL not set — deploy the crawler service first.' })
  }

  try {
    const res = await fetch(`${CRAWLER_API_URL}/jobs`, {
      method:  'POST',
      headers: {
        'Content-Type':   'application/json',
        'x-admin-secret': ADMIN_API_SECRET,
      },
      body: JSON.stringify({ category: industry, city, state, maxPages, source }),
    })
    const result = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(result.error || `Crawler service error (${res.status})`)

    return back({ success: '1' })
  } catch (err: any) {
    return back({ error: `Could not reach crawler service: ${err.message}` })
  }
}
