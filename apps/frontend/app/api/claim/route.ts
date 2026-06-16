import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await request.json()
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  // Resolve site id from slug first
  const { data: site } = await supabase
    .from('websites')
    .select('id, claimed_by')
    .eq('slug', slug)
    .single()

  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

  // Already claimed by this user — idempotent success
  if (site.claimed_by === user.id) {
    return NextResponse.json({ success: true, websiteId: site.id })
  }

  // Atomic claim: UPDATE ... WHERE claimed_by IS NULL
  // If two requests race, only one will match this condition — the other gets 0 rows.
  const { data: claimed, error } = await supabase
    .from('websites')
    .update({
      claimed_by: user.id,
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', site.id)
    .is('claimed_by', null)   // only succeeds if still unclaimed
    .select('id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!claimed || claimed.length === 0) {
    // Another request won the race
    return NextResponse.json({ error: 'Already claimed by another user' }, { status: 409 })
  }

  // Stop any pending follow-up emails for this site
  await supabase
    .from('outreach')
    .update({ status: 'claimed' })
    .eq('website_id', site.id)
    .in('status', ['pending', 'sent'])   // don't touch already-failed records

  return NextResponse.json({ success: true, websiteId: site.id })
}
