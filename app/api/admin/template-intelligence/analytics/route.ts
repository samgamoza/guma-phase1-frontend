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

/**
 * GET /api/admin/template-intelligence/analytics
 * Comprehensive template performance analytics
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return NextResponse.json(auth, { status: auth.status })

  const { supabase } = auth

  try {
    // Template overview
    const { data: templateStats } = await supabase
      .from('templates')
      .select('status, count(*)')
      .group_by('status')

    // Most used templates
    const { data: mostUsed } = await supabase
      .from('templates')
      .select('id, name, industry, total_uses, avg_user_rating')
      .eq('status', 'production')
      .order('total_uses', { ascending: false })
      .limit(10)

    // Highest converting templates
    const { data: highestConverting } = await supabase
      .from('templates')
      .select('id, name, industry, conversion_rate_observed, total_conversions')
      .eq('status', 'production')
      .gt('conversion_rate_observed', 0)
      .order('conversion_rate_observed', { ascending: false })
      .limit(10)

    // Revenue by template
    const { data: topRevenue } = await supabase
      .from('templates')
      .select('id, name, total_revenue_attributed, total_uses')
      .eq('status', 'production')
      .order('total_revenue_attributed', { ascending: false })
      .limit(10)

    // Industry distribution
    const { data: byIndustry } = await supabase
      .from('templates')
      .select('industry, count(*)')
      .eq('status', 'production')
      .group_by('industry')

    // Source distribution
    const { data: bySource } = await supabase
      .from('templates')
      .select('source, count(*)')
      .eq('status', 'production')
      .group_by('source')

    // Component library stats
    const { data: componentStats } = await supabase
      .from('components')
      .select('type, count(*)')
      .group_by('type')

    // Template ingestion pipeline status
    const { data: ingestionStatus } = await supabase
      .from('template_ingestion_jobs')
      .select('status, count(*)')
      .group_by('status')

    // Calculate aggregates
    const allTemplates = (templateStats || []).reduce(
      (sum: number, stat: any) => sum + (stat.count || 0),
      0
    )
    const avgRating =
      (mostUsed || []).reduce((sum: number, t: any) => sum + (t.avg_user_rating || 0), 0) /
        Math.max((mostUsed || []).length, 1) || 0
    const totalConversions =
      (highestConverting || []).reduce((sum: number, t: any) => sum + (t.total_conversions || 0), 0) || 0
    const totalRevenue =
      (topRevenue || []).reduce((sum: number, t: any) => sum + (t.total_revenue_attributed || 0), 0) || 0

    return NextResponse.json({
      summary: {
        total_templates: allTemplates,
        by_status: templateStats || [],
        by_industry: byIndustry || [],
        by_source: bySource || [],
      },
      performance: {
        most_used_templates: mostUsed || [],
        highest_converting_templates: highestConverting || [],
        top_revenue_templates: topRevenue || [],
        avg_rating: parseFloat(avgRating.toFixed(2)),
        total_conversions: totalConversions,
        total_revenue: parseFloat(totalRevenue.toFixed(2)),
      },
      components: {
        total_components: (componentStats || []).reduce(
          (sum: number, stat: any) => sum + (stat.count || 0),
          0
        ),
        by_type: componentStats || [],
      },
      ingestion: {
        by_status: ingestionStatus || [],
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/template-intelligence/analytics/record-usage
 * Record template usage when a website is deployed
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return NextResponse.json(auth, { status: auth.status })

  const { supabase } = auth
  const body = await req.json()

  const {
    templateId,
    websiteId,
    businessIndustry,
    businessType,
    pageSpeedScore,
    userRating,
    revenuGenerated,
    userFeedback,
    sectionsModified,
    colorsChanged,
    fontsChanged,
  } = body

  try {
    // Record usage
    const { error: usageError } = await supabase
      .from('template_usage')
      .insert([
        {
          template_id: templateId,
          website_id: websiteId,
          business_industry: businessIndustry,
          business_type: businessType,
          deployed_at: new Date().toISOString(),
          page_speed_score: pageSpeedScore,
          user_rating: userRating,
          user_feedback: userFeedback,
          revenue_generated: revenuGenerated,
          sections_modified: sectionsModified,
          colors_changed: colorsChanged,
          fonts_changed: fontsChanged,
        },
      ])

    if (usageError) throw usageError

    // Update template stats
    const { data: template, error: fetchError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (fetchError) throw fetchError

    const newUses = (template.total_uses || 0) + 1
    const newConversions = (template.total_conversions || 0) + (revenuGenerated ? 1 : 0)
    const newConversionRate = newConversions / newUses
    const totalRevenue = (template.total_revenue_attributed || 0) + (revenuGenerated || 0)
    const avgRating =
      ((template.avg_user_rating || 0) * (template.total_ratings || 0) + (userRating || 0)) /
      ((template.total_ratings || 0) + 1)

    await supabase
      .from('templates')
      .update({
        total_uses: newUses,
        total_conversions: newConversions,
        conversion_rate_observed: newConversionRate,
        total_revenue_attributed: totalRevenue,
        avg_user_rating: parseFloat(avgRating.toFixed(2)),
        total_ratings: (template.total_ratings || 0) + 1,
      })
      .eq('id', templateId)

    return NextResponse.json({
      success: true,
      message: 'Usage recorded',
    })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
