import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { updateTemplateStatus } from '@/lib/template-crm/storage'

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

// POST /api/admin/templates/:id/publish — move to production
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return NextResponse.json(auth, { status: auth.status })

  const { supabase } = auth

  try {
    // Check validation passed
    const { data: validations, error: validError } = await supabase
      .from('template_validation')
      .select('*')
      .eq('template_id', params.id)
      .order('tested_at', { ascending: false })
      .limit(1)

    if (validError) throw validError

    const latestValidation = validations?.[0]
    if (!latestValidation || latestValidation.validation_status === 'fail') {
      return NextResponse.json(
        { error: 'Template must pass validation before publishing' },
        { status: 400 }
      )
    }

    // Update status to production
    const updated = await updateTemplateStatus(params.id, 'production')

    // Log audit
    await supabase.from('template_audit_log').insert([
      {
        template_id: params.id,
        action: 'published',
        changes: { status: 'production' },
      },
    ])

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

// POST /api/admin/templates/:id/archive — move to archived
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return NextResponse.json(auth, { status: auth.status })

  const { supabase } = auth

  try {
    const updated = await updateTemplateStatus(params.id, 'archived')

    await supabase.from('template_audit_log').insert([
      {
        template_id: params.id,
        action: 'archived',
        changes: { status: 'archived' },
      },
    ])

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
