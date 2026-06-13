import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { text, context, tone } = await request.json()

  // Fetch site to verify ownership
  const { data: site } = await supabase
    .from('websites')
    .select('id, claimed_by, plan')
    .eq('slug', params.slug)
    .single()

  if (!site || site.claimed_by !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  if (site.plan === 'free') {
    return NextResponse.json({ error: 'Upgrade to Pro to use AI rewrite' }, { status: 403 })
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Rewrite this text to be more compelling and professional. Keep it concise.

Context: ${context}
Tone: ${tone || 'professional and friendly'}

Original text:
"${text}"

Return ONLY the rewritten text, no explanations.`,
        },
      ],
    })

    const rewritten = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as any).text)
      .join('')

    return NextResponse.json({
      original: text,
      rewritten: rewritten.trim(),
    })
  } catch (error: any) {
    console.error('Claude API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to rewrite text' },
      { status: 500 }
    )
  }
}
