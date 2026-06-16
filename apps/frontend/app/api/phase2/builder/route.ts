import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  updateHeroSection, 
  updateFeaturesSection, 
  updatePricingSection, 
  applyColorSystem,
  applyTypographySystem,
  publishPremiumWebsite
} from '@/src/lib/phase2/builder-engine'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data, error } = await supabase
    .from('premium_builder_sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const action = searchParams.get('action')

  if (!id || !action) {
    return NextResponse.json({ error: 'Missing id or action' }, { status: 400 })
  }

  const payload = await req.json()

  try {
    let result
    switch (action) {
      case 'update-hero':
        result = await updateHeroSection(id, payload.headline, payload.subheading, payload.ctaText)
        break
      case 'update-features':
        result = await updateFeaturesSection(id, payload.features)
        break
      case 'update-pricing':
        result = await updatePricingSection(id, payload.pricingTiers)
        break
      case 'apply-design':
        if (payload.colorSystemId) {
          await applyColorSystem(id, payload.colorSystemId)
        }
        if (payload.typographySystemId) {
          await applyTypographySystem(id, payload.typographySystemId)
        }
        result = { success: true }
        break
      case 'publish':
        const html = await publishPremiumWebsite(id)
        result = { success: true, htmlLength: html.length }
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
