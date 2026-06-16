import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import fs from 'node:fs'
import path from 'node:path'

// Category Config
const CATEGORY_MAP: Record<string, string> = {
  restaurant: 'restaurant',
  salon:      'salon',
  trades:     'trades',
  medical:    'medical',
  legal:      'legal',
  retail:     'retail',
  generic:    'retail',
}

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: 'Restaurant / Food & Dining',
  salon:      'Salon / Beauty / Wellness',
  trades:     'Trades / Home Services',
  medical:    'Medical / Dental / Health',
  legal:      'Legal / Financial',
  retail:     'Retail / Shop',
  generic:    'Local Business',
}

const CATEGORY_TAGLINES: Record<string, string> = {
  restaurant: 'Great food, great vibes',
  salon:      'Look & feel your best',
  trades:     'Reliable service — done right',
  medical:    'Your health is our priority',
  legal:      'Experienced legal counsel you can trust',
  retail:     'Your local favourite',
  generic:    'Serving the community with pride',
}

const CATEGORY_CTAS: Record<string, string> = {
  restaurant: 'Order Now',
  salon:      'Book Appointment',
  trades:     'Get a Free Quote',
  medical:    'Book Appointment',
  legal:      'Free Consultation',
  retail:     'Shop Now',
  generic:    'Get in Touch',
}

const UNSPLASH_DATA: Record<string, { hero: string[]; gallery: string[] }> = {
  restaurant: {
    hero: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop'],
    gallery: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&auto=format&fit=crop',
    ],
  },
  trades: {
    hero: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&auto=format&fit=crop'],
    gallery: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1545259742-f9e8f9a9f3e1?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&auto=format&fit=crop',
    ],
  },
  salon: {
    hero: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&auto=format&fit=crop'],
    gallery: [
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1487412947147-5cebf100d293?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470259078422-826894b933aa?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop',
    ],
  },
  medical: {
    hero: ['https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1600&auto=format&fit=crop'],
    gallery: [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=600&auto=format&fit=crop',
    ],
  },
  legal: {
    hero: ['https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&auto=format&fit=crop'],
    gallery: [
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521791055366-0d553872952f?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop',
    ],
  },
  retail: {
    hero: ['https://images.unsplash.com/photo-12874a6-unsplash?w=1600&auto=format&fit=crop'],
    gallery: [
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521791055366-0d553872952f?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop',
    ],
  },
}

export async function POST(req: NextRequest) {
  try {
    const serverSupabase = createServerSupabaseClient()
    const { data: { user } } = await serverSupabase.auth.getUser()

    const body = await req.json()
    const { name, category, city, country = 'US', address, phone, hours, services } = body

    if (!name || !category || !city) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate unique slug
    let baseSlug = `${name}-${city}`.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    // Append timestamp or check to make sure slug is unique
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`

    // Read the template
    const tmplKey = CATEGORY_MAP[category] || 'retail'
    const templateFileName = `${tmplKey}.html`

    // Look for template file path inside monorepo
    let templatePath = path.join(process.cwd(), '../generator/src/templates/html', templateFileName)
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), 'apps/generator/src/templates/html', templateFileName)
    }
    if (!fs.existsSync(templatePath)) {
      // Final fallback to make sure we don't crash in production/standalone builds
      templatePath = path.join(process.cwd(), '../../apps/generator/src/templates/html', templateFileName)
    }

    let rawHTML = ''
    if (fs.existsSync(templatePath)) {
      rawHTML = fs.readFileSync(templatePath, 'utf8')
    } else {
      // In-code minimal layout fallback
      rawHTML = `<!DOCTYPE html><html><head><title>{{BUSINESS_NAME}}</title><style>body{font-family:sans-serif;padding:40px;background:#f9f9f9;text-align:center;}</style></head><body><h1>{{BUSINESS_NAME}}</h1><p>{{DESCRIPTION}}</p><p>Call us: {{PHONE}}</p></body></html>`
    }

    // Resolve images
    const unsplash = UNSPLASH_DATA[tmplKey] || UNSPLASH_DATA.retail
    const heroImage = unsplash.hero[0]
    const gallery = (idx: number) => unsplash.gallery[idx] || heroImage

    // Resolve description & details
    const categoryLabel = CATEGORY_LABELS[category] || 'Local Business'
    const description = `${name} is a premier ${categoryLabel.toLowerCase()} serving ${city} and surrounding areas.`
    const tagline = CATEGORY_TAGLINES[category] || 'Welcome to our business'

    // Format services as HTML list
    const parsedServices = Array.isArray(services) 
      ? services 
      : (services || '').split(/,|\n/).map((s: string) => s.trim()).filter(Boolean)
    const servicesHTML = parsedServices.length > 0 
      ? parsedServices.map((s: string) => `<li>${s}</li>`).join('\n')
      : `<li>Trusted Professional Services</li><li>Quality Guarantee</li>`

    const SITE_BASE = process.env.SITE_BASE_URL || 'https://guma.ai'
    const claimUrl = `${SITE_BASE}/claim/${slug}`
    const siteUrl = `${SITE_BASE}/sites/${slug}`

    const vars: Record<string, string> = {
      BUSINESS_NAME:      name,
      TAGLINE:            tagline,
      DESCRIPTION:        description,
      PHONE:              phone || 'Call us for details',
      ADDRESS:            address || city,
      CITY:               city,
      COUNTRY:            country,
      CATEGORY:           categoryLabel,
      CUISINE_TYPE:       categoryLabel,
      HOURS:              hours || 'Mon–Fri: 9am–5pm · Sat: 10am–3pm · Sun: Closed',
      RATING:             '5.0',
      REVIEW_COUNT:       '15',
      YEAR:               new Date().getFullYear().toString(),
      HERO_IMAGE:         heroImage,
      GALLERY_1:          gallery(0),
      GALLERY_2:          gallery(1),
      GALLERY_3:          gallery(2),
      GALLERY_4:          gallery(3),
      GALLERY_5:          gallery(4),
      GALLERY_6:          gallery(5),
      CLAIM_URL:          claimUrl,
      SITE_URL:           siteUrl,
      SERVICES:           servicesHTML,
      MENU_ITEMS:         servicesHTML,
      TRUST_POINTS:       `<li>5.0★ Rated Business</li><li>Experienced Team</li><li>Prompt Support</li>`,
      SIGNATURE_ITEMS:    servicesHTML,
      DISHES:             servicesHTML,
      TEAM_MEMBERS:       `<li>Our dedicated local team</li>`,
      SERVICE_AREA_CITIES: `<li>${city}</li><li>Surrounding areas</li>`,
      SOCIAL_PROOF_COUNT: '100% Client Satisfaction',
      LANG_TOGGLE:        '',
      FIL_TAGLINE:        tagline,
      FIL_CTA:            CATEGORY_CTAS[category] || 'Contact Us',
      STYLE_TIER_CSS:     '',
      TIER_BADGE:         '',
      REVEAL_JS:          '',
      SLUG:               slug,
      PRIMARY_CTA:        CATEGORY_CTAS[category] || 'Contact Us',
      SECONDARY_CTA:      'Learn More',
      ICON:               '🏢',
    }

    // Replace all {{PLACEHOLDER}}
    const htmlContent = rawHTML.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key) => {
      return vars[key] !== undefined ? vars[key] : ''
    })

    // Insert into DB using Service Key Client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // Insert Business
    const { data: businessData, error: bizError } = await supabase
      .from('businesses')
      .insert({
        name,
        slug,
        category: categoryLabel,
        phone,
        address,
        city,
        country,
        source_dir: 'manual_onboarding',
        has_website: true,
        raw_data: {
          services: parsedServices,
          hours: hours,
          source: 'manual',
        }
      })
      .select('id')
      .single()

    if (bizError || !businessData) {
      throw new Error(`Failed to create business: ${bizError?.message}`)
    }

    // Insert Website
    const { error: siteError } = await supabase
      .from('websites')
      .insert({
        business_id: businessData.id,
        slug,
        html_content: htmlContent,
        template: tmplKey,
        status: user ? 'published' : 'generated',
        claimed_by: user?.id || null,
        published_at: user ? new Date().toISOString() : null,
        plan: 'free',
      })

    if (siteError) {
      throw new Error(`Failed to create website: ${siteError.message}`)
    }

    return NextResponse.json({ success: true, slug })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
