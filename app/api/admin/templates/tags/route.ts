import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { tagTemplate, organizeInCollection } from '@/lib/template-crm/storage'

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

// POST /api/admin/templates/tags — add tags to template
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return NextResponse.json(auth, { status: auth.status })

  const body = await req.json()
  const { templateId, tags, type } = body

  if (!templateId || !tags || !type) {
    return NextResponse.json(
      { error: 'Missing templateId, tags, or type' },
      { status: 400 }
    )
  }

  if (!['industry', 'use_case'].includes(type)) {
    return NextResponse.json(
      { error: 'type must be "industry" or "use_case"' },
      { status: 400 }
    )
  }

  try {
    const updated = await tagTemplate(templateId, tags, type)
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

// POST /api/admin/templates/collections — create or update collection
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return NextResponse.json(auth, { status: auth.status })

  const { supabase } = auth
  const body = await req.json()
  const { collectionId, templateIds, name, slug, description } = body

  if (!collectionId && !name) {
    return NextResponse.json(
      { error: 'Missing collectionId or name' },
      { status: 400 }
    )
  }

  try {
    if (collectionId) {
      // Update existing collection
      const { data, error } = await supabase
        .from('template_collections')
        .update({
          template_ids: templateIds,
          name,
          description,
        })
        .eq('id', collectionId)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(data)
    } else {
      // Create new collection
      const { data, error } = await supabase
        .from('template_collections')
        .insert([
          {
            name,
            slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
            description,
            template_ids: templateIds || [],
          },
        ])
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(data)
    }
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

// GET /api/admin/templates/collections — list collections
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return NextResponse.json(auth, { status: auth.status })

  const { supabase } = auth

  try {
    const { data, error } = await supabase
      .from('template_collections')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
