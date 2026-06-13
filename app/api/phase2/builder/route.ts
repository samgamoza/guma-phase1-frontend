import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  createBuilderSession,
  generateWebsiteHTML,
  publishPremiumWebsite,
  updateHeroSection,
  updateFeaturesSection,
  updatePricingSection,
  reorderSections,
  toggleSectionVisibility,
} from '@/lib/phase2/builder-engine'

/**
 * POST /api/phase2/builder
 * Create new premium builder session
 */
export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { websiteId, baseTemplateId, industry } = body

    const session = await createBuilderSession({
      userId: user.id,
      websiteId,
      baseTemplateId,
      industry,
    })

    return NextResponse.json(session)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/phase2/builder/:id
 * Get builder session details
 */
export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('id')

  if (!sessionId) return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })

  try {
    const { data, error } = await supabase
      .from('premium_builder_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/phase2/builder/:id
 * Update builder session (content, design, sections)
 */
export async function PATCH(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('id')
  const action = searchParams.get('action')

  if (!sessionId) return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })

  try {
    const body = await req.json()

    let result

    switch (action) {
      case 'update-hero':
        result = await updateHeroSection(
          sessionId,
          body.headline,
          body.subheading,
          body.ctaText
        )
        break

      case 'update-features':
        result = await updateFeaturesSection(sessionId, body.features)
        break

      case 'update-pricing':
        result = await updatePricingSection(sessionId, body.pricingTiers)
        break

      case 'reorder-sections':
        result = await reorderSections(sessionId, body.newOrder)
        break

      case 'toggle-section':
        result = await toggleSectionVisibility(sessionId, body.section, body.visible)
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
