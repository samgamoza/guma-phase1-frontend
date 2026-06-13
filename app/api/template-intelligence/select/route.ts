import { NextRequest, NextResponse } from 'next/server'
import {
  selectOptimalTemplate,
  logTemplateRecommendation,
} from '@/lib/template-intelligence/selection-engine'

/**
 * POST /api/template-intelligence/select
 * Intelligent template selection based on business context
 * Used during website generation flow
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      industry,
      businessModel,
      targetAudience,
      designPreference,
      category,
      description,
      websiteId,
    } = body

    if (!industry || !businessModel || !targetAudience) {
      return NextResponse.json(
        { error: 'Missing required context (industry, businessModel, targetAudience)' },
        { status: 400 }
      )
    }

    // Run intelligent selection engine
    const selection = await selectOptimalTemplate({
      industry,
      businessModel,
      targetAudience,
      designPreference,
      category,
      description,
    })

    // Log recommendation for analytics
    await logTemplateRecommendation(
      selection.selectedTemplate.id,
      websiteId || null,
      {
        industry,
        businessModel,
        targetAudience,
        designPreference,
      },
      selection.rankedTemplates[0]?.reason || [],
      selection.rankedTemplates[0]?.score || 0
    )

    return NextResponse.json({
      selectedTemplate: selection.selectedTemplate,
      alternativeTemplates: selection.rankedTemplates.slice(1, 4),
      recommendation: selection.recommendation,
      suggestedComponents: selection.suggestedComponents,
    })
  } catch (error) {
    console.error('Selection error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
