import { createClient } from '@supabase/supabase-js'
import { logger } from '../utils/logger.js'
import ws from 'ws'

let _client = null
export function getSupabase() {
  if (!_client) {
    _client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      { auth: { persistSession: false }, global: { fetch }, realtime: { transport: ws } }
    )
  }
  return _client
}

/** Pull pending outreach jobs that have a valid email target */
export async function getPendingOutreach(limit = 50) {
  const { data, error } = await getSupabase()
    .from('outreach')
    .select(`
      id, to_email, status,
      businesses(name, category, city, phone, email, slug),
      websites(id, slug, status, plan)
    `)
    .eq('status', 'pending')
    .not('businesses.email', 'is', null)
    .limit(limit)

  if (error) throw error
  return data || []
}

/** Mark outreach record status and record timestamps */
export async function updateOutreachStatus(id, status, extras = {}) {
  const patch = { status, ...extras }
  if (status === 'sent')    patch.sent_at    = new Date().toISOString()
  if (status === 'opened')  patch.opened_at  = new Date().toISOString()
  if (status === 'clicked') patch.clicked_at = new Date().toISOString()

  const { error } = await getSupabase()
    .from('outreach')
    .update(patch)
    .eq('id', id)

  if (error) logger.error('updateOutreachStatus error', { id, error: error.message })
}

/** Count emails sent today (for daily cap enforcement) */
export async function getSentTodayCount() {
  const midnight = new Date()
  midnight.setHours(0, 0, 0, 0)

  const { count } = await getSupabase()
    .from('outreach')
    .select('id', { count: 'exact', head: true })
    .gte('sent_at', midnight.toISOString())

  return count || 0
}
