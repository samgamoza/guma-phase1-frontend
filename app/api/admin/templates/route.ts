import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  importFromLovable,
  importFromBase44,
  importFromV0,
  importFromBolt,
} from '@/lib/template-crm/importers'
import { getTemplate, updateTemplate, searchTemplates } from '@/lib/template-crm/storage'

// Verify admin
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

// GET /api/admin/templates — list templates
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return NextResponse.json(auth, { status: auth.status })

  const { supabase } = auth
  const url = new URL(req.url)

  const category = url.searchParams.get('category')
  const status = url.searchParams.get('status')
  const source = url.searchParams.get('source')
  const search = url.searchParams.get('search')

  let query = supabase.from('template_library').select('*')

  if (category) query = query.eq('primary_category', category)
  if (status) query = query.eq('status', status)
  if (source) query = query.eq('external_source', source)

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Optional client-side search if full-text not implemented
  let results = data || []
  if (search) {
    const lowerSearch = search.toLowerCase()
    results = results.filter(
      (t) =>
        t.name?.toLowerCase().includes(lowerSearch) ||
        t.description?.toLowerCase().includes(lowerSearch)
    )
  }

  return NextResponse.json(results)
}

// POST /api/admin/templates/import — trigger import from external source
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return NextResponse.json(auth, { status: auth.status })

  const body = await req.json()
  const { source, externalId } = body

  if (!source || !externalId) {
    return NextResponse.json(
      { error: 'Missing source or externalId' },
      { status: 400 }
    )
  }

  try {
    let result

    switch (source) {
      case 'lovable':
        result = await importFromLovable(externalId)
        break
      case 'base44':
        result = await importFromBase44(externalId)
        break
      case 'v0':
        result = await importFromV0(externalId)
        break
      case 'bolt':
        result = await importFromBolt(externalId)
        break
      default:
        return NextResponse.json({ error: 'Unsupported source' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/templates/:id — update template
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return NextResponse.json(auth, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const body = await req.json()

  if (!id) return NextResponse.json({ error: 'Missing template ID' }, { status: 400 })

  try {
    const updated = await updateTemplate(id, body)
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
