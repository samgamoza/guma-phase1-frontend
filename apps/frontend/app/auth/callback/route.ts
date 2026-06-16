import { createServerSupabaseClientWithResponse } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * /auth/callback
 *
 * Handles the Supabase PKCE code exchange after a magic link is clicked.
 *
 * How it works with Resend SMTP:
 *  1. User requests magic link → Supabase sends email via your Resend SMTP
 *  2. User clicks link in email → goes to Supabase's /auth/v1/verify endpoint
 *  3. Supabase verifies the token, generates a PKCE code, then redirects to:
 *       {NEXT_PUBLIC_SITE_URL}/auth/callback?code=<pkce_code>&next=<destination>
 *  4. This route exchanges the code for a session (writes auth cookies to response)
 *  5. User is redirected to their intended destination, now authenticated
 *
 * ─── Supabase Dashboard Setup Required ────────────────────────────────────────
 * Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
 * Must include:
 *   http://localhost:3002/**         (local dev)
 *   https://your-production-url/**  (production)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Security: only allow relative paths as destinations
  const redirectPath = next.startsWith('/') ? next : '/dashboard'

  // No PKCE code — likely a hash-fragment flow (rare with custom SMTP)
  // Forward to our client-side handler that can read #access_token=...
  if (!code) {
    console.warn('[auth/callback] No code — falling back to client-side confirm')
    const confirmUrl = new URL(`${origin}/auth/confirm`)
    confirmUrl.searchParams.set('next', redirectPath)
    return NextResponse.redirect(confirmUrl.toString())
  }

  // Build the success response first so we can attach cookies to its headers
  const successResponse = NextResponse.redirect(`${origin}${redirectPath}`)

  // Use the write-capable Supabase client that sets cookies on the response
  const supabase = createServerSupabaseClientWithResponse(successResponse)

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] PKCE exchange failed:', error.message)
    return NextResponse.redirect(
      `${origin}/auth/login?error=auth_failed&reason=${encodeURIComponent(error.message)}`
    )
  }

  // Session is now set in the response cookies — redirect the user
  return successResponse
}
