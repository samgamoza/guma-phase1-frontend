import { NextRequest, NextResponse } from 'next/server'
import { rewriteSection } from '@/src/lib/phase2/ai-rewrite-engine'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, section, originalContent, style, tone, businessContext } = await req.json()

    if (!sessionId || !section || !originalContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await rewriteSection({
      sessionId,
      section,
      originalContent,
      style,
      tone,
      businessContext
    })

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
