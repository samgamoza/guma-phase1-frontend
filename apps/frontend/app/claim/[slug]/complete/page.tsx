'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function ClaimCompletePage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [status, setStatus] = useState<'claiming' | 'success' | 'error'>('claiming')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function claimSite() {
      try {
        const res = await fetch('/api/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to claim site')
        }

        setStatus('success')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } catch (err: any) {
        setStatus('error')
        setErrorMsg(err.message)
      }
    }

    claimSite()
  }, [slug, router])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="card p-10 max-w-md w-full text-center space-y-5">
        {status === 'claiming' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-indigo-muted flex items-center justify-center mx-auto">
              <Loader2 size={24} className="text-indigo animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-ink mb-2">Claiming your site...</h2>
              <p className="text-warm-gray-500 text-sm">Please wait while we assign this site to your account.</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-ink mb-2">Site Claimed!</h2>
              <p className="text-warm-gray-500 text-sm">Taking you to your dashboard...</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
              <XCircle size={24} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-ink mb-2">Couldn't claim site</h2>
              <p className="text-warm-gray-500 text-sm">{errorMsg}</p>
            </div>
            <button onClick={() => router.push('/dashboard')} className="btn-primary w-full justify-center mt-4">
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}
