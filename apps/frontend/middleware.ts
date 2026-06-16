import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options })
          res = NextResponse.next({
            request: { headers: req.headers },
          })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options })
          res = NextResponse.next({
            request: { headers: req.headers },
          })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // --- IMPORTANT: Handle redirects for protected routes ---
  // Define paths that *do not* require authentication
  const publicPaths = [
    '/', // Your landing page
    '/auth/login',
    '/auth/signup',
    '/auth/signup/manual',
    '/auth/callback',
    '/claim/[slug]', // Allow access to claim page
    '/sites/[slug]', // Allow previewing generated websites publicly
    '/api/webhooks/stripe', // Stripe webhook should be public
    '/api/sites/search', // Business search must be public (used on signup page)
    '/api/sites/create-manual', // Manual generation must be public
    '/api/auth/send-magic-link', // Allow generating/sending magic links publicly
  ]

  // Check if the current path is a public path
  const isPublicPath = publicPaths.some(path => {
    // Basic path matching, can be enhanced with regex for dynamic segments
    if (path.includes('[slug]')) {
      const regex = new RegExp(`^${path.replace(/\[slug\]/g, '[^/]+')}$`)
      return regex.test(req.nextUrl.pathname)
    }
    return req.nextUrl.pathname === path
  })

  // If the user is trying to access a protected route and is not authenticated, redirect to login
  // Using getUser() instead of getSession() for better security in middleware
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !isPublicPath) {
    const redirectUrl = new URL('/auth/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}