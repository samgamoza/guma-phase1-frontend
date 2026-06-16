/**
 * getSiteUrl()
 *
 * Returns the canonical site base URL for use in magic link emailRedirectTo.
 *
 * Strategy:
 *  - In the browser: ALWAYS use window.location.origin (dynamic, port-safe).
 *    This means local dev on port 3000, 3001, or 3002 all work automatically.
 *  - On the server: read NEXT_PUBLIC_SITE_URL (set per-environment).
 *    Must be set for server-side rendering and production builds.
 *
 * ─── Supabase Dashboard Requirement ──────────────────────────────────────────
 * The URL used in emailRedirectTo must match an allowed Redirect URL pattern in:
 *   Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
 *
 * Add these patterns (the wildcard /** covers all paths):
 *   http://localhost:3000/**
 *   http://localhost:3001/**
 *   http://localhost:3002/**
 *   https://your-production-domain.com/**
 *
 * ─── .env.local ──────────────────────────────────────────────────────────────
 * NEXT_PUBLIC_SITE_URL=http://localhost:3000   ← update to match your active port
 * (Production) NEXT_PUBLIC_SITE_URL=https://guma.ai
 */

export function getSiteUrl(): string {
  // Browser: always use the actual origin — handles any dev port automatically
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Server-side: use env var (required for SSR / production)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }

  // Last resort fallback (should never reach here if env is set)
  return 'http://localhost:3000'
}
