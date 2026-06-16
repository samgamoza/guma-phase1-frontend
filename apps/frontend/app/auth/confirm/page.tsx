'use client'
/**
 * /auth/confirm
 *
 * Client-side handler for Supabase magic link hash-fragment auth.
 *
 * Supabase sometimes embeds the session in the URL hash:
 *   /auth/confirm#access_token=xxx&refresh_token=yyy&...
 *
 * This page:
 *  1. Reads the hash fragment (invisible to server-side routes)
 *  2. Calls supabase.auth.setSession() to establish the session
 *  3. Redirects the user to their intended destination (the `next` param)
 */
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Suspense } from 'react'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function handleHashSession() {
      const supabase = createClient()

      // Parse hash fragment: #access_token=...&refresh_token=...&type=...
      const hash = window.location.hash.substring(1) // strip leading #
      const params = new URLSearchParams(hash)

      const accessToken  = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const errorParam   = params.get('error')
      const errorDesc    = params.get('error_description')

      // Handle explicit error in hash
      if (errorParam) {
        setStatus('error')
        setErrorMsg(errorDesc || errorParam)
        return
      }

      // If we have tokens, set the session directly
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          setStatus('error')
          setErrorMsg(error.message)
        } else {
          setStatus('success')
          // Small delay so the user sees the success state
          setTimeout(() => router.replace(next), 800)
        }
        return
      }

      // No hash tokens — maybe it's already a session (cookie set by server callback)
      // Just check for an active session and redirect
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setStatus('success')
        setTimeout(() => router.replace(next), 800)
        return
      }

      // Nothing we can do
      setStatus('error')
      setErrorMsg('The magic link has expired or is invalid. Please request a new one.')
    }

    handleHashSession()
  }, [next, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="card p-10 text-center space-y-5 max-w-sm w-full">
        {status === 'loading' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-indigo-muted flex items-center justify-center mx-auto">
              <Loader2 size={24} className="text-indigo animate-spin" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-ink">Verifying your link...</h1>
              <p className="text-sm text-warm-gray-400 mt-1">Just a moment, setting up your account.</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} className="text-emerald-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-ink">You're verified!</h1>
              <p className="text-sm text-warm-gray-400 mt-1">Redirecting you now...</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
              <XCircle size={24} className="text-red-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-ink">Link expired</h1>
              <p className="text-sm text-warm-gray-400 mt-1 leading-relaxed">{errorMsg}</p>
            </div>
            <a
              href="/auth/signup"
              className="btn-primary inline-flex items-center gap-2 justify-center py-2.5 px-6 text-sm"
            >
              Start over
            </a>
          </>
        )}
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 size={24} className="animate-spin text-indigo" />
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
