import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * createServerSupabaseClient()
 *
 * Read-only server client for Server Components and Route Handlers.
 * Uses the full @supabase/ssr cookie adapter to properly handle
 * chunked session cookies (prevents "chunked cookie decoded to invalid JSON" warnings).
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      // Read-only in server components — set/remove are no-ops here
      set(_name: string, _value: string, _options: CookieOptions) {},
      remove(_name: string, _options: CookieOptions) {},
    },
  })
}

/**
 * createServerSupabaseClientWithWrite(responseOrCookieStore)
 *
 * Read-write server client for Route Handlers that need to set auth cookies
 * (e.g. the /auth/callback PKCE exchange). Pass the mutable NextResponse
 * so cookies are written to both request and response.
 *
 * Usage in a Route Handler:
 *   const response = NextResponse.redirect(...)
 *   const supabase = createServerSupabaseClientWithWrite(response)
 *   await supabase.auth.exchangeCodeForSession(code)
 *   return response  // ← now carries Set-Cookie headers
 */
export function createServerSupabaseClientWithResponse(response: { cookies: any }) {
  const cookieStore = cookies()

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        // Write to the request store (best-effort)
        try { cookieStore.set({ name, value, ...options }) } catch {}
        // Write to the response — this is the critical path
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        try { cookieStore.set({ name, value: '', ...options }) } catch {}
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })
}
