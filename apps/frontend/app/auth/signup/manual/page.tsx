'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { getSiteUrl } from '@/lib/site-url'
import { normalizeAuthError } from '@/lib/auth-error'
import { ArrowLeft, ArrowRight, Loader2, Sparkles, ShieldCheck, Mail } from 'lucide-react'

const CATEGORIES = [
  { value: 'restaurant', label: 'Restaurant / Food & Dining', icon: '🍽️' },
  { value: 'salon', label: 'Salon / Beauty & Wellness', icon: '✂️' },
  { value: 'trades', label: 'Trades / Home Services', icon: '🔧' },
  { value: 'medical', label: 'Medical / Dental / Health', icon: '🏥' },
  { value: 'legal', label: 'Legal / Financial', icon: '⚖️' },
  { value: 'retail', label: 'Retail / Shop', icon: '🛍️' },
  { value: 'auto', label: 'Automotive / Auto Repair', icon: '🚗' },
  { value: 'generic', label: 'Other / Local Business', icon: '🏢' },
]

function ManualSignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nameParam = searchParams.get('name') || ''
  const categoryParam = searchParams.get('category') || 'generic'
  const cityParam = searchParams.get('city') || ''
  const phoneParam = searchParams.get('phone') || ''
  const addressParam = searchParams.get('address') || ''
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Auth state
  const [email, setEmail] = useState('')
  const [authSent, setAuthSent] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  // Wizard
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [genStatus, setGenStatus] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Form fields (prefill name from URL param)
  const [name, setName] = useState(nameParam)
  const [category, setCategory] = useState(categoryParam)
  const [city, setCity] = useState(cityParam)
  const [address, setAddress] = useState(addressParam)
  const [phone, setPhone] = useState(phoneParam)
  const [hours, setHours] = useState('Mon–Fri: 9am–5pm · Sat: 10am–3pm · Sun: Closed')
  const [services, setServices] = useState('')

  const totalSteps = 3

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setCheckingAuth(false)
    }
    checkUser()
  }, [])

  // Also update fields if URL param changes (e.g. after magic link redirect)
  useEffect(() => {
    if (nameParam && !name) setName(nameParam)
    if (categoryParam && category === 'generic') setCategory(categoryParam)
    if (cityParam && !city) setCity(cityParam)
    if (phoneParam && !phone) setPhone(phoneParam)
    if (addressParam && !address) setAddress(addressParam)
  }, [nameParam, categoryParam, cityParam, phoneParam, addressParam])

  async function handleAuthSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setAuthLoading(true)
    setError(null)

    try {
      const redirectTo = `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(`/auth/signup/manual${nameParam ? `?name=${encodeURIComponent(nameParam)}` : ''}`)}`
      const res = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectTo })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send login link')
      }
      setAuthSent(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const nextStep = () => { if (step < totalSteps) setStep(step + 1) }
  const prevStep = () => { if (step > 1) setStep(step - 1) }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    const statuses = [
      'Selecting optimal HTML template...',
      'Mapping business categories and metadata...',
      'Resolving premium photography for your brand...',
      'Injecting copywriting and trust signals...',
      'Compiling production-ready site...',
    ]

    for (let i = 0; i < statuses.length; i++) {
      setGenStatus(statuses[i])
      await new Promise(r => setTimeout(r, 800))
    }

    try {
      const res = await fetch('/api/sites/create-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, city, address, phone, hours, services }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate website')

      router.push(`/claim/${data.slug}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  // ── Screens ────────────────────────────────────────────────────────────────

  if (checkingAuth) {
    return (
      <div className="card p-8 text-center flex flex-col items-center justify-center min-h-[350px] gap-4">
        <Loader2 size={24} className="animate-spin text-indigo" />
        <p className="text-sm text-warm-gray-400">Verifying session...</p>
      </div>
    )
  }

  // ── Not logged in: show email signup ──
  if (!user) {
    if (authSent) {
      return (
        <div className="card p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-muted flex items-center justify-center mx-auto">
            <Mail size={24} className="text-indigo" />
          </div>
          <h2 className="text-xl font-bold text-ink">Check your inbox</h2>
          <p className="text-sm text-warm-gray-500 max-w-xs leading-relaxed">
            We sent a magic link to <span className="font-semibold text-ink">{email}</span>. Click it to verify and begin setup.
          </p>
          <button onClick={() => setAuthSent(false)} className="text-xs text-indigo hover:underline">
            Use a different email
          </button>
        </div>
      )
    }

    return (
      <div className="card p-8 space-y-6">
        <Link href="/auth/signup" className="inline-flex items-center gap-1 text-xs text-warm-gray-400 hover:text-ink">
          <ArrowLeft size={12} /> Back to search
        </Link>

        <div>
          <span className="text-xs font-bold text-indigo uppercase tracking-wider">Step 1 — Create Account</span>
          <h1 className="text-2xl font-bold text-ink mt-1">Create your account</h1>
          <p className="text-warm-gray-500 text-sm mt-1">
            Sign up to start building{nameParam ? ` "${nameParam}"` : ' your business website'} instantly.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        <form onSubmit={handleAuthSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="owner@yourbusiness.com"
              required
              className="input"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={authLoading || !email}
            className="btn-primary w-full justify-center py-3 disabled:opacity-50"
          >
            {authLoading ? <Loader2 size={16} className="animate-spin" /> : <>Continue to Setup <ArrowRight size={14} /></>}
          </button>
        </form>

        <p className="text-center text-xs text-warm-gray-400">
          No password needed — we use secure magic links.
        </p>
      </div>
    )
  }

  // ── Generating screen ──
  if (loading) {
    return (
      <div className="card p-10 text-center flex flex-col items-center justify-center min-h-[380px] gap-6">
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="w-20 h-20 rounded-full border-4 border-indigo/20 border-t-indigo animate-spin" />
          <Sparkles className="absolute text-indigo animate-pulse" size={22} />
        </div>
        <div className="space-y-2 max-w-xs">
          <h2 className="text-xl font-bold text-ink">Building your site...</h2>
          <p className="text-sm text-warm-gray-400 animate-pulse">{genStatus}</p>
        </div>
      </div>
    )
  }

  // ── 3-Step Wizard ──
  return (
    <div className="space-y-5">
      <Link href="/auth/signup" className="inline-flex items-center gap-1.5 text-xs text-warm-gray-400 hover:text-ink">
        <ArrowLeft size={12} /> Back to search
      </Link>

      <div className="card p-8 relative overflow-hidden">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-warm-gray-100">
          <div
            className="h-full bg-indigo transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="flex justify-between items-center mb-6 mt-1">
          <span className="text-xs font-bold tracking-wider text-indigo uppercase">Step {step + 1} of {totalSteps + 1}</span>
          <span className="text-xs text-warm-gray-400 font-medium">Manual Setup</span>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>
        )}

        {/* STEP 1: Business Identity */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-ink mb-1">Basic details</h1>
              <p className="text-warm-gray-500 text-sm">What's your business name and type?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Business / Company Name <span className="text-red-500">*</span></label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Mario's Auto Repair"
                className="input"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Business Category <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                      category === cat.value
                        ? 'border-indigo bg-indigo-muted text-indigo'
                        : 'border-warm-gray-200 text-warm-gray-600 hover:border-indigo/40'
                    }`}
                  >
                    <span className="text-base leading-none">{cat.icon}</span>
                    <span className="leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Location & Contact */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-ink mb-1">Location &amp; contact</h1>
              <p className="text-warm-gray-500 text-sm">Help customers find and reach you.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">City <span className="text-red-500">*</span></label>
                <input
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Manila"
                  className="input"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Phone Number</label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+63 917 123 4567"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Full Address</label>
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. 123 Taft Avenue, Malate, Manila"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Hours of Operation</label>
              <input
                value={hours}
                onChange={e => setHours(e.target.value)}
                placeholder="Mon–Fri: 9am–6pm · Sat: 10am–3pm"
                className="input"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Services & Final */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-ink mb-1">Services &amp; products</h1>
              <p className="text-warm-gray-500 text-sm">List what you offer — these become featured sections on your site.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Services Offered <span className="text-warm-gray-400 font-normal">(comma or one per line)</span>
              </label>
              <textarea
                value={services}
                onChange={e => setServices(e.target.value)}
                placeholder="e.g. Brake repair, Engine tune-up, Car wash, Oil change, Tire rotation"
                className="input min-h-[120px] py-2.5 resize-none"
              />
            </div>

            {/* Summary Preview */}
            <div className="p-4 bg-indigo-muted/40 rounded-xl border border-indigo/10 space-y-2">
              <p className="text-xs font-bold text-indigo uppercase tracking-wider mb-2">Site Preview Summary</p>
              <div className="text-xs text-warm-gray-600 space-y-1">
                <p><span className="font-semibold text-ink">Name:</span> {name || '—'}</p>
                <p><span className="font-semibold text-ink">Category:</span> {CATEGORIES.find(c => c.value === category)?.label}</p>
                <p><span className="font-semibold text-ink">Location:</span> {city || '—'}{address ? `, ${address}` : ''}</p>
                {phone && <p><span className="font-semibold text-ink">Phone:</span> {phone}</p>}
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
              <ShieldCheck className="text-amber-500 mt-0.5 flex-shrink-0" size={16} />
              <p className="text-xs text-amber-700 leading-relaxed">
                Your website will be generated instantly using your details above. You can edit everything from your dashboard later.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-warm-gray-100">
          {step > 1 && (
            <button type="button" onClick={prevStep} className="btn-secondary flex-1 justify-center py-2.5">
              Back
            </button>
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={step === 1 ? !name.trim() : step === 2 ? !city.trim() : false}
              className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-50"
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              className="btn-primary flex-1 justify-center py-2.5"
            >
              Generate My Website <Sparkles size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ManualSignupPage() {
  return (
    <Suspense fallback={
      <div className="card p-8 text-center flex flex-col items-center justify-center min-h-[350px] gap-4">
        <Loader2 size={24} className="animate-spin text-indigo" />
        <p className="text-sm text-warm-gray-400">Loading setup...</p>
      </div>
    }>
      <ManualSignupContent />
    </Suspense>
  )
}
