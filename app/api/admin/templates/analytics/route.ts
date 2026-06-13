import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

async function requireAdmin(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized', status: 401 }

  const { data: userData } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!userData?.is_admin) return { error: 'Forbidden', status: 403 }

  return { user, supabase }
}

// GET /api/admin/templates/analytics — template statistics
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return NextResponse.json(auth, { status: auth.status })

  const { supabase } = auth

  try {
    // Count by status
    const { data: byStatus } = await supabase
      .from('template_library')
      .select('status, count(*)')
      .group_by('status')

    // Count by source
    const { data: bySource } = await supabase
      .from('template_library')
      .select('external_source, count(*)')
      .group_by('external_source')

    // Count by category
    const { data: byCategory } = await supabase
      .from('template_library')
      .select('primary_category, count(*)')
      .group_by('primary_category')

    // Most used templates
    const { data: mostUsed } = await supabase
      .from('template_library')
      .select('id, name, usage_count, downloads')
      .order('usage_count', { ascending: false })
      .limit(10)

    // Average scores
    const { data: scores } = await supabase
      .from('template_library')
      .select('lighthouse_score, accessibility_score, seo_score')
      .eq('status', 'production')

    const avgLighthouse =
      scores?.reduce((sum, t) => sum + (t.lighthouse_score || 0), 0) / (scores?.length || 1) || 0
    const avgAccessibility =
      scores?.reduce((sum, t) => sum + (t.accessibility_score || 0), 0) / (scores?.length || 1) || 0
    const avgSEO =
      scores?.reduce((sum, t) => sum + (t.seo_score || 0), 0) / (scores?.length || 1) || 0

    // Recent imports
    const { data: recentImports } = await supabase
      .from('template_import_queue')
      .select('*')
      .eq('status', 'completed')
      .order('import_completed_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      summary: {
        total_templates: (byStatus || []).reduce((sum, s: any) => sum + (s.count || 0), 0),
        by_status: byStatus || [],
        by_source: bySource || [],
        by_category: byCategory || [],
      },
      quality: {
        avg_lighthouse: Math.round(avgLighthouse),
        avg_accessibility: Math.round(avgAccessibility),
        avg_seo: Math.round(avgSEO),
      },
      trending: {
        most_used: mostUsed || [],
        recent_imports: recentImports || [],
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
