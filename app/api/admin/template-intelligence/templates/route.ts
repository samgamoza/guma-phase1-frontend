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

/**
 * GET /api/admin/template-intelligence/templates
 * List all templates with filtering and sorting
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return NextResponse.json(auth, { status: auth.status })

  const { supabase } = auth
  const url = new URL(req.url)

  const status = url.searchParams.get('status') || 'production'
  const industry = url.searchParams.get('industry')
  const source = url.searchParams.get('source')
  const sortBy = url.searchParams.get('sortBy') || 'total_uses'
  const limit = parseInt(url.searchParams.get('limit') || '50')

  let query = supabase.from('templates').select('*')

  if (status) query = query.eq('status', status)
  if (industry) query = query.eq('industry', industry)
  if (source) query = query.eq('source', source)

  const { data, error } = await query
    .order(sortBy, { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    count: data?.length || 0,
    templates: data || [],
  })
}

/**
 * PATCH /api/admin/template-intelligence/templates/:id
 * Update template metadata
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return NextResponse.json(auth, { status: auth.status })

  const { supabase } = auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing template ID' }, { status: 400 })
  }

  const body = await req.json()

  const { data, error } = await supabase
    .from('templates')
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

/**
 * DELETE /api/admin/template-intelligence/templates/:id
 * Archive a template
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return NextResponse.json(auth, { status: auth.status })

  const { supabase } = auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing template ID' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('templates')
    .update({
      status: 'archived',
      archived_date: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    message: 'Template archived',
    template: data,
  })
}
