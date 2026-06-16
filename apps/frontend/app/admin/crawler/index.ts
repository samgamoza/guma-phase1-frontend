import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { category, city, state } = await req.json()

    // Initialize Supabase with Service Role Key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. SIMPLE SCRAPE LOGIC
    const targetUrl = `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(category)}&geo_location_terms=${encodeURIComponent(`${city}, ${state}`)}`
    
    // Bright Data Credentials from Supabase Secrets
    const BRIGHT_DATA_PROXY = Deno.env.get('BRIGHT_DATA_PROXY') // Format: brd.superproxy.io:22225
    const BRIGHT_DATA_AUTH  = Deno.env.get('BRIGHT_DATA_AUTH')  // Format: brd-customer-hl_xxxx-zone-xxx:password
    
    // Create a controller to abort the fetch if it takes too long
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout to stay under Supabase 10s

    const fetchOptions: RequestInit = {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      },
    }

    // If proxy credentials exist, use the Bright Data tunnel
    if (BRIGHT_DATA_PROXY && BRIGHT_DATA_AUTH) {
      // Note: Standard fetch in Deno/Edge Functions handles the Proxy-Authorization header
      // for many proxy services.
      (fetchOptions.headers as Record<string, string>)['Proxy-Authorization'] = `Basic ${btoa(BRIGHT_DATA_AUTH)}`
    }

    const response = await fetch(targetUrl, fetchOptions).finally(() => clearTimeout(timeoutId))

    if (!response.ok) throw new Error(`Failed to fetch source: ${response.statusText}`)

    const html = await response.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')
    
    // 2. EXTRACT MULTIPLE BUSINESSES
    const resultElements = doc?.querySelectorAll('.result') || []
    const businessesToInsert = []

    for (const el of resultElements) {
      const name = el.querySelector('a.business-name')?.textContent?.trim()
      if (!name) continue

      const timestamp = Date.now()
      const slug = `${name}-${city}`.toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-') + `-${timestamp}-${Math.random().toString(36).substring(7)}`

      businessesToInsert.push({
        name: name,
        city: city,
        state: state || null,
        category: category,
        source_dir: 'edge-function',
        slug: slug,
        crawled_at: new Date().toISOString(),
      })
      
      if (businessesToInsert.length >= 10) break // Limit to first 10 for safety
    }

    if (businessesToInsert.length === 0) {
      throw new Error('No businesses found for this search criteria.')
    }

    // 3. SAVE TO DATABASE
    const { data, error: dbError } = await supabase
      .from('businesses')
      .insert(businessesToInsert)
      .select()

    if (dbError) throw dbError

    return new Response(JSON.stringify({ message: 'Success', business: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})