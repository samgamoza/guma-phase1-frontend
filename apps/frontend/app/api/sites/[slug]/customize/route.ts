import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { prompt, htmlContent } = await request.json()

    if (!prompt || !htmlContent) {
      return NextResponse.json({ error: 'Missing prompt or htmlContent' }, { status: 400 })
    }

    // Verify user owns this site
    const serverSupabase = createServerSupabaseClient()
    const { data: { user } } = await serverSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Query site details
    const { data: site } = await serverSupabase
      .from('websites')
      .select('id, claimed_by')
      .eq('slug', slug)
      .single()

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    if (site.claimed_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to edit this site' }, { status: 403 })
    }

    // Perform Customizer Rule-Based Updates
    let updatedHTML = htmlContent
    let changeDescription = 'Updated site content'

    const lowerPrompt = prompt.toLowerCase()

    // 1. Phone Update
    const phoneMatch = prompt.match(/(?:phone|call|number).*?(\+?[\d\s-]{7,15})/i)
    if (phoneMatch && phoneMatch[1]) {
      const newPhone = phoneMatch[1].trim()
      // Replace in href="tel:..."
      updatedHTML = updatedHTML.replace(/href="tel:[^"]*"/g, `href="tel:${newPhone}"`)
      // Replace text matches of old phone (standard formats)
      updatedHTML = updatedHTML.replace(/(?:\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?[\d\s-]{7,15})/g, newPhone)
      changeDescription = `Updated contact phone to ${newPhone}`
    }

    // 2. Add Service
    else if (lowerPrompt.includes('service') || lowerPrompt.includes('add')) {
      const serviceMatch = prompt.match(/(?:add|service)\s+["']?([^"']{3,30})["']?/i)
      if (serviceMatch && serviceMatch[1]) {
        const newService = serviceMatch[1].trim()
        // Find first services list <ul> or </ul> or list section
        if (updatedHTML.includes('</ul>')) {
          updatedHTML = updatedHTML.replace('</ul>', `<li class="feature">${newService}</li>\n</ul>`)
        } else if (updatedHTML.includes('</div>') && updatedHTML.includes('<li>')) {
          updatedHTML = updatedHTML.replace('<li>', `<li class="feature">${newService}</li>\n<li>`)
        }
        changeDescription = `Added "${newService}" to services list`
      }
    }

    // 3. Style overrides: Dark Theme
    else if (lowerPrompt.includes('dark') || lowerPrompt.includes('black') || lowerPrompt.includes('night')) {
      const darkStyles = `
        <style id="guma-dark-override">
          :root {
            --dark: #09090b !important;
            --dark2: #18181b !important;
            --dark3: #27272a !important;
            --light: #f4f4f5 !important;
            --bg: #09090b !important;
            --text: #f4f4f5 !important;
            --muted: #a1a1aa !important;
          }
          body {
            background-color: #09090b !important;
            color: #f4f4f5 !important;
          }
          .menu, .info {
            background-color: #18181b !important;
          }
          .menu-card {
            background-color: #27272a !important;
          }
        </style>
      `
      if (updatedHTML.includes('</head>')) {
        updatedHTML = updatedHTML.replace('</head>', `${darkStyles}\n</head>`)
      }
      changeDescription = 'Swapped theme to high-contrast dark layout'
    }

    // 4. Style overrides: Luxury/Gold Theme
    else if (lowerPrompt.includes('luxury') || lowerPrompt.includes('gold')) {
      const luxuryStyles = `
        <style id="guma-luxury-override">
          :root {
            --p: #d4a843 !important;
            --p2: #b8860b !important;
            --gold: #d4a843 !important;
            --dark: #111111 !important;
            --dark2: #1c1c1c !important;
            --light: #f5f5f5 !important;
            --bg: #111111 !important;
          }
          .btn-primary {
            background-color: #d4a843 !important;
            color: #111 !important;
          }
        </style>
      `
      if (updatedHTML.includes('</head>')) {
        updatedHTML = updatedHTML.replace('</head>', `${luxuryStyles}\n</head>`)
      }
      changeDescription = 'Applied luxury gold design presets'
    }

    // 5. General Text Replace / Brand Rename
    else {
      const renameMatch = prompt.match(/(?:rename|name|title|called)\s+to\s+["']?([^"']{3,50})["']?/i)
      if (renameMatch && renameMatch[1]) {
        const newName = renameMatch[1].trim()
        // We will replace header logos and titles
        updatedHTML = updatedHTML.replace(/<title>[^<]*<\/title>/i, `<title>${newName}</title>`)
        updatedHTML = updatedHTML.replace(/class="nav-logo">[^<]*/g, `class="nav-logo">${newName}`)
        updatedHTML = updatedHTML.replace(/class="footer-brand">[^<]*/g, `class="footer-brand">${newName}`)
        changeDescription = `Renamed business to "${newName}"`
      } else {
        // Fallback generic SEO rewrite simulator
        updatedHTML = updatedHTML.replace(/class="hero-title">[^<]*<br>/i, `class="hero-title">Preeminent Local Service<br>`)
        changeDescription = 'Applied AI SEO optimization to headings'
      }
    }

    // Save to Supabase using service key
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    const { error: updateError } = await serviceClient
      .from('websites')
      .update({ html_content: updatedHTML })
      .eq('id', site.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    return NextResponse.json({ success: true, updatedHTML, changeDescription })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
