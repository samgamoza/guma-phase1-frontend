import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { runIngestionPipeline } from '@/lib/template-intelligence/ingestion-pipeline'

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
 * POST /api/admin/template-intelligence/upload
 * Upload and ingest a new template through 10-step pipeline
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return NextResponse.json(auth, { status: auth.status })

  try {
    const formData = await req.formData()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const source = formData.get('source') as string
    const htmlFile = formData.get('html') as File
    const cssFile = formData.get('css') as File
    const jsFile = formData.get('js') as File
    const reactFile = formData.get('react') as File

    if (!name || !source || !htmlFile) {
      return NextResponse.json(
        { error: 'Missing required fields (name, source, html)' },
        { status: 400 }
      )
    }

    // Read files
    const htmlContent = await htmlFile.text()
    const cssContent = cssFile ? await cssFile.text() : undefined
    const jsContent = jsFile ? await jsFile.text() : undefined
    const reactJsx = reactFile ? await reactFile.text() : undefined

    // Run 10-step ingestion pipeline
    const templateId = await runIngestionPipeline({
      source: source as any,
      name,
      description,
      htmlContent,
      cssContent,
      jsContent,
      reactJsx,
    })

    return NextResponse.json({
      success: true,
      templateId,
      message: 'Template uploaded and analyzed successfully',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
