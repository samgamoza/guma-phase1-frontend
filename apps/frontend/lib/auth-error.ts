/**
 * normalizeAuthError()
 *
 * Translates raw Supabase auth error messages into user-friendly strings.
 * Supabase can return cryptic errors like "0", empty strings, or internal
 * codes that would confuse end users.
 */
export function normalizeAuthError(error: { message?: string; status?: number } | null): string {
  if (!error) return 'Something went wrong. Please try again.'

  const msg = (error.message || '').toLowerCase().trim()
  const status = error.status

  // Rate limiting
  if (msg.includes('rate limit') || msg.includes('too many requests') || status === 429) {
    return 'Too many attempts. Please wait a few minutes before trying again.'
  }

  // Invalid/disallowed redirect URL (shows as "0" or empty due to Supabase bug)
  if (!msg || msg === '0' || msg === 'undefined' || status === 0) {
    return 'Sign-in could not be completed. Please ensure the redirect URL is configured in your Supabase dashboard, then try again.'
  }

  // Email not confirmed
  if (msg.includes('email not confirmed')) {
    return 'Please confirm your email address first. Check your inbox for the confirmation link.'
  }

  // Invalid email
  if (msg.includes('invalid email') || msg.includes('unable to validate')) {
    return 'Please enter a valid email address.'
  }

  // Network / fetch errors
  if (msg.includes('failed to fetch') || msg.includes('network') || status === 0) {
    return 'Network error. Please check your connection and try again.'
  }

  // Signup disabled
  if (msg.includes('signups not allowed') || msg.includes('signup is disabled')) {
    return 'New sign-ups are temporarily disabled. Please try again later.'
  }

  // Default: return the message cleaned up, or a generic fallback
  return error.message && error.message !== '0'
    ? error.message
    : 'An unexpected error occurred. Please try again.'
}
