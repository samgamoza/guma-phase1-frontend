import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  rewriteSection,
  generateHeroCopy,
  generateFeaturesCopy,
  generatePricingCopy,
  generateCopyVariations,
  optimizeForConversion,
} from '@/lib/phase2/ai-rewrite-engine'

/**
 * POST /api/phase2/ai-rewrites
 * Rewrite website section copy using AI
 */
export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { sessionId, section, originalContent, style, tone, action } = body

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from('premium_builder_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single()

    if (sessionError || session?.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let result

    switch (action) {
      case 'rewrite':
        result = await rewriteSection({
          sessionId,
          section,
          originalContent,
          style,
          tone,
        })
        break

      case 'generate-hero':
        const heroCopy = await generateHeroCopy(
          sessionId,
          body.businessName,
          body.businessDescription,
          body.targetAudience
        )
        result = {
          rewriteId: 'generated',
          rewrittenContent: heroCopy,
          explanation: 'Hero copy generated from business description',
        }
        break

      case 'generate-features':
        const featuresCopy = await generateFeaturesCopy(sessionId, body.features)
        result = {
          rewriteId: 'generated',
          rewrittenContent: JSON.stringify(featuresCopy),
          explanation: 'Feature copy generated',
        }
        break

      case 'generate-pricing':
        const pricingCopy = await generatePricingCopy(sessionId, body.pricingTiers)
        result = {
          rewriteId: 'generated',
          rewrittenContent: pricingCopy,
          explanation: 'Pricing copy generated',
        }
        break

      case 'variations':
        const variations = await generateCopyVariations(
          sessionId,
          section,
          originalContent,
          body.count || 3
        )
        return NextResponse.json({
          variations,
          explanation: 'Copy variations generated for A/B testing',
        })

      case 'optimize':
        const optimized = await optimizeForConversion(
          sessionId,
          section,
          originalContent
        )
        result = {
          rewriteId: 'optimized',
          rewrittenContent: optimized,
          explanation: 'Copy optimized for conversion',
        }
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
