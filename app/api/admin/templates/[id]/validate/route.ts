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

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return NextResponse.json(auth, { status: auth.status })

  const { supabase } = auth

  try {
    // Fetch template
    const { data: template, error: fetchError } = await supabase
      .from('template_library')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Run validation checks
    const validation = await validateTemplate(template)

    // Store validation result
    const { data: validationRecord, error: saveError } = await supabase
      .from('template_validation')
      .insert([
        {
          template_id: params.id,
          validation_status: validation.status,
          lighthouse_score: validation.lighthouse_score,
          accessibility_score: validation.accessibility_score,
          seo_score: validation.seo_score,
          performance_score: validation.performance_score,
          components_valid: validation.components_valid,
          a11y_issues: validation.a11y_issues,
          seo_issues: validation.seo_issues,
          critical_issues: validation.critical_issues,
          warnings: validation.warnings,
          recommendation: validation.recommendation,
          tested_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (saveError) throw saveError

    // Update template with scores
    await supabase
      .from('template_library')
      .update({
        lighthouse_score: validation.lighthouse_score,
        accessibility_score: validation.accessibility_score,
        seo_score: validation.seo_score,
      })
      .eq('id', params.id)

    return NextResponse.json(validationRecord)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

async function validateTemplate(template: any) {
  // Simulated validation scores
  // In production, you'd integrate Lighthouse, accessibility checkers, etc.

  const htmlLength = (template.html_content || '').length
  const cssLength = (template.css_content || '').length

  // Basic heuristics
  const hasMetaTags = template.html_content?.includes('<meta')
  const hasHeadings = template.html_content?.includes('<h1')
  const hasAltText = template.html_content?.includes('alt=')
  const hasResponsive = template.css_content?.includes('@media')

  const a11y_issues = []
  const seo_issues = []
  const warnings = []

  if (!hasHeadings) {
    seo_issues.push({ issue: 'Missing h1 tag', severity: 'critical' })
  }
  if (!hasMetaTags) {
    seo_issues.push({ issue: 'Missing meta tags', severity: 'high' })
  }
  if (!hasAltText) {
    a11y_issues.push({ issue: 'Missing image alt text', severity: 'high' })
  }
  if (!hasResponsive) {
    warnings.push({ warning: 'No media queries found', severity: 'medium' })
  }

  const seo_score = hasHeadings && hasMetaTags ? 85 : 60
  const accessibility_score = hasAltText ? 80 : 65
  const performance_score = htmlLength < 50000 && cssLength < 10000 ? 80 : 60
  const lighthouse_score = Math.round((seo_score + accessibility_score + performance_score) / 3)

  return {
    status:
      seo_issues.length === 0 && a11y_issues.length === 0
        ? 'pass'
        : warnings.length > 0
          ? 'pass_with_warnings'
          : 'fail',
    lighthouse_score,
    accessibility_score,
    seo_score,
    performance_score,
    components_valid: true,
    a11y_issues,
    seo_issues,
    critical_issues: [...seo_issues.filter((i) => i.severity === 'critical')],
    warnings,
    recommendation:
      seo_issues.length === 0 && a11y_issues.length === 0
        ? 'approve'
        : 'approve_with_changes',
  }
}
