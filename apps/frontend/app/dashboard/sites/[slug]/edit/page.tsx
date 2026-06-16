'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Save, Eye, ExternalLink, Globe, Palette, Type,
  Phone, MapPin, Clock, Mail, ChevronLeft,
  Loader2, CheckCircle2, Settings, Zap, AlertCircle,
  Sparkles, History, Laptop, Tablet, Smartphone, HelpCircle
} from 'lucide-react'

interface SiteData {
  id: string
  slug: string
  plan: string
  status: string
  htmlContent: string
  custom_domain: string | null
  businessName: string
  businessCategory: string
  businessCity: string
  businessPhone: string
  businessEmail: string
  businessAddress: string
}

type Tab = 'customizer' | 'domain' | 'settings'
type Viewport = 'desktop' | 'tablet' | 'mobile'

interface HistoryItem {
  id: string
  prompt: string
  description: string
  html: string
}

export default function SiteEditorPage() {
  const { slug }   = useParams<{ slug: string }>()
  const router     = useRouter()
  const iframeRef  = useRef<HTMLIFrameElement>(null)

  const [site, setSite]         = useState<SiteData | null>(null)
  const [tab, setTab]           = useState<Tab>('customizer')
  const [loading, setLoading]   = useState(true)
  const [domain, setDomain]     = useState('')
  const [domainSaving, setDomainSaving] = useState(false)

  // Viewport toggling
  const [viewport, setViewport] = useState<Viewport>('desktop')

  // AI Prompt State
  const [prompt, setPrompt] = useState('')
  const [prompting, setPrompting] = useState(false)
  const [credits, setCredits] = useState(25)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load Site & Credits from LocalStorage
  useEffect(() => {
    // Load Site Details
    fetch(`/api/sites/${slug}`)
      .then(r => r.json())
      .then(data => {
        setSite(data)
        setDomain(data.custom_domain || '')
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load site:', err)
        setLoading(false)
      })

    // Load/Initialize Credits
    const savedCredits = localStorage.getItem(`guma_ai_credits_${slug}`)
    if (savedCredits !== null) {
      setCredits(parseInt(savedCredits))
    } else {
      localStorage.setItem(`guma_ai_credits_${slug}`, '25')
      setCredits(25)
    }

    // Load History
    const savedHistory = localStorage.getItem(`guma_ai_history_${slug}`)
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)) } catch {}
    }
  }, [slug])

  const saveState = (newCredits: number, newHistory: HistoryItem[]) => {
    setCredits(newCredits)
    setHistory(newHistory)
    localStorage.setItem(`guma_ai_credits_${slug}`, newCredits.toString())
    localStorage.setItem(`guma_ai_history_${slug}`, JSON.stringify(newHistory))
  }

  // Trigger Customizer API
  const handlePromptSubmit = async (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt
    if (!activePrompt.trim() || prompting || !site) return

    if (credits <= 0) {
      setError('You have run out of free AI credits. Upgrade to Pro for unlimited edits.')
      return
    }

    setPrompting(true)
    setError(null)

    try {
      const res = await fetch(`/api/sites/${slug}/customize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activePrompt,
          htmlContent: site.htmlContent,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to apply update')

      // Save History Item
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        prompt: activePrompt,
        description: data.changeDescription || 'Updated layout details',
        html: site.htmlContent, // Save previous layout for undo
      }

      const updatedHistory = [newItem, ...history]
      const updatedSite = { ...site, htmlContent: data.updatedHTML }

      setSite(updatedSite)
      saveState(credits - 1, updatedHistory)
      setPrompt('')

      // Reload iframe content
      if (iframeRef.current) {
        // We write directly to iframe srcdoc to avoid reloads and flash
        iframeRef.current.srcdoc = data.updatedHTML
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPrompting(false)
    }
  }

  const handleUndo = (item: HistoryItem) => {
    if (!site) return
    const updatedSite = { ...site, htmlContent: item.html }
    setSite(updatedSite)
    const updatedHistory = history.filter(h => h.id !== item.id)
    saveState(credits, updatedHistory)

    if (iframeRef.current) {
      iframeRef.current.srcdoc = item.html
    }
  }

  // Set initial iframe content once loaded
  useEffect(() => {
    if (site?.htmlContent && iframeRef.current) {
      iframeRef.current.srcdoc = site.htmlContent
    }
  }, [site])

  async function handleDomainSave() {
    setDomainSaving(true)
    await fetch(`/api/sites/${slug}/domain`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain }),
    })
    setDomainSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-ink">
        <Loader2 size={28} className="animate-spin text-indigo" />
      </div>
    )
  }

  const isPro = site?.plan === 'pro' || site?.plan === 'business'

  return (
    <div className="flex flex-col h-screen bg-[#0a0b12] overflow-hidden text-white font-sans">
      {/* Top bar */}
      <div className="h-16 bg-[#0f111a] border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/dashboard" className="text-white/40 hover:text-white/80 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div className="w-px h-5 bg-white/10" />
          <div>
            <span className="text-white font-semibold text-sm truncate mr-2">
              {site?.businessName || slug}
            </span>
            <span className={`badge text-[9px] uppercase px-2 py-0.5 rounded-full ${
              isPro ? 'bg-indigo/20 text-indigo border border-indigo/35' : 'bg-white/10 text-white/50'
            }`}>
              {site?.plan} Plan
            </span>
          </div>
        </div>

        {/* Viewport Toggles */}
        <div className="hidden md:flex items-center bg-[#181a26] rounded-xl p-1 border border-white/5">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg transition-colors ${viewport === 'desktop' ? 'bg-indigo text-white' : 'text-white/40 hover:text-white/80'}`}
            title="Desktop view"
          >
            <Laptop size={14} />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg transition-colors ${viewport === 'tablet' ? 'bg-indigo text-white' : 'text-white/40 hover:text-white/80'}`}
            title="Tablet view"
          >
            <Tablet size={14} />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg transition-colors ${viewport === 'mobile' ? 'bg-indigo text-white' : 'text-white/40 hover:text-white/80'}`}
            title="Mobile view"
          >
            <Smartphone size={14} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/sites/${slug}`}
            target="_blank"
            className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5 bg-white/5 border border-white/5 hover:bg-white/10"
          >
            <ExternalLink size={13} /> View Live
          </a>
          {!isPro && (
            <Link
              href="/dashboard/upgrade"
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 bg-indigo hover:bg-indigo-light text-white font-semibold"
            >
              <Zap size={13} /> Upgrade to Pro
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Control Panel */}
        <div className="w-[400px] bg-[#0f111a] border-r border-white/5 flex flex-col overflow-hidden flex-shrink-0">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/5 bg-[#0b0c13]">
            {([
              ['customizer', 'AI Editor', Sparkles],
              ['domain',     'Domain',    Globe],
              ['settings',   'Settings',  Settings],
            ] as [Tab, string, any][]).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold tracking-wide transition-colors
                  ${tab === id
                    ? 'text-indigo border-b-2 border-indigo bg-white/[0.02]'
                    : 'text-white/40 hover:text-white/80'
                  }`}
              >
                <Icon size={13} />{label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Customizer Tab */}
            {tab === 'customizer' && (
              <div className="space-y-6">
                {/* Credit progress */}
                <div className="p-4 bg-[#141724] rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-white/60 font-semibold uppercase tracking-wider">Free Trial Customizations</span>
                    <span className="font-bold text-indigo">{credits} / 25 Credits</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo transition-all duration-300"
                      style={{ width: `${(credits / 25) * 100}%` }}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-xl p-3">
                    {error}
                  </p>
                )}

                {/* Prompt Engine */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">AI Prompt Editor</label>
                    <span className="text-[10px] text-indigo flex items-center gap-1 font-medium"><Sparkles size={10} /> Instant Customizer</span>
                  </div>
                  <div className="relative group">
                    <textarea
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      placeholder="e.g. Change colors to dark, or add brake repair to services..."
                      rows={3}
                      className="w-full bg-[#181a26] border border-white/5 rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/20 
                                 focus:outline-none focus:border-indigo/50 focus:ring-1 focus:ring-indigo/35 transition-all resize-none shadow-inner"
                      disabled={credits <= 0}
                    />
                  </div>
                  <button
                    onClick={() => handlePromptSubmit()}
                    disabled={prompting || !prompt.trim() || credits <= 0}
                    className="w-full btn-primary py-3 justify-center text-xs font-semibold tracking-wide bg-indigo hover:bg-indigo-light text-white disabled:opacity-40"
                  >
                    {prompting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <><Sparkles size={13} /> Apply AI Customization</>
                    )}
                  </button>
                </div>

                {/* Quick Action Chips */}
                <div className="space-y-2.5">
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Quick Suggestions</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: '🎨 Refresh Colors', action: 'Change colors to dark theme' },
                      { label: '👑 Go Luxury', action: 'Change colors to luxury theme' },
                      { label: '🔧 Add Oil Change', action: 'Add Oil Change to services' },
                      { label: '✍️ Optimize SEO', action: 'Optimize all title tags and headings' },
                    ].map(chip => (
                      <button
                        key={chip.label}
                        onClick={() => handlePromptSubmit(chip.action)}
                        disabled={prompting || credits <= 0}
                        className="text-[10px] font-semibold text-white/70 bg-white/5 border border-white/5 rounded-full px-3 py-1.5 hover:bg-white/10 hover:text-white transition-all"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Change History log */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">
                    <History size={12} /> Change Log
                  </div>
                  {history.length === 0 ? (
                    <p className="text-xs text-white/20 italic">No modifications applied yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {history.map(item => (
                        <div key={item.id} className="flex items-start justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl gap-3">
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-medium text-white/95 truncate">{item.prompt}</p>
                            <p className="text-[10px] text-white/40">{item.description}</p>
                          </div>
                          <button
                            onClick={() => handleUndo(item)}
                            className="text-[10px] text-indigo hover:text-indigo-light font-semibold"
                          >
                            Undo
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Domain Tab */}
            {tab === 'domain' && (
              <div className="space-y-4">
                <div>
                  <div className="section-label mb-2 text-white/60">Free subdomain</div>
                  <div className="bg-[#181a26] rounded-xl px-3.5 py-3 text-xs text-indigo font-mono border border-white/5">
                    guma.ai/sites/{slug}
                  </div>
                  <p className="text-[10px] text-white/40 mt-1.5">Always active · zero configuration</p>
                </div>

                {isPro ? (
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div>
                      <div className="section-label mb-2 text-white/60">Custom domain (Pro)</div>
                      <input
                        value={domain}
                        onChange={e => setDomain(e.target.value)}
                        placeholder="yourbusiness.com"
                        className="input text-xs py-2.5 mb-2 bg-[#181a26] border-white/5 text-white"
                      />
                      <button
                        onClick={handleDomainSave}
                        disabled={domainSaving || !domain}
                        className="btn-primary text-xs py-2.5 w-full justify-center disabled:opacity-50"
                      >
                        {domainSaving ? <Loader2 size={13} className="animate-spin" /> : 'Save domain'}
                      </button>
                    </div>
                    {domain && (
                      <div className="p-3.5 bg-white/[0.02] rounded-xl border border-white/5 text-xs space-y-2">
                        <div className="font-semibold text-white/90">DNS Configuration Required</div>
                        <div className="text-white/50 text-[11px] leading-relaxed">Add this CNAME record at your domain registrar:</div>
                        <div className="font-mono bg-black/35 rounded-lg p-2.5 border border-white/5 space-y-1.5 text-[11px]">
                          <div className="text-white/40">Type: <span className="text-white">CNAME</span></div>
                          <div className="text-white/40">Name: <span className="text-white">@</span></div>
                          <div className="text-white/40">Value: <span className="text-indigo">cname.guma.ai</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#141724] border border-white/5 p-5 text-center space-y-3">
                    <Globe size={20} className="text-white/30 mx-auto" />
                    <div>
                      <p className="text-xs font-semibold text-white">Custom Domain Access</p>
                      <p className="text-[10px] text-white/40 mt-0.5">Upgrade to Pro to connect your own domain.</p>
                    </div>
                    <Link href="/dashboard/upgrade" className="btn-primary text-xs py-2 px-4 justify-center w-full">
                      Upgrade to Pro
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {tab === 'settings' && (
              <div className="space-y-4">
                <div className="section-label text-white/60">Danger zone</div>
                <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-red-200">Delete site</p>
                    <p className="text-[10px] text-red-400 mt-1 leading-relaxed">
                      This will permanently remove your website database records and assets. This action cannot be undone.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete site? This cannot be undone.`)) {
                        fetch(`/api/sites/${slug}`, { method: 'DELETE' })
                          .then(() => router.push('/dashboard'))
                      }
                    }}
                    className="text-xs text-red-400 border border-red-800/40 px-4 py-2 rounded-lg
                               hover:bg-red-900/30 transition-colors font-semibold"
                  >
                    Delete site permanently
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Iframe Container */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#07080e] items-center justify-center p-6 relative">
          <div className="absolute top-0 left-0 right-0 h-10 bg-[#0f111a] flex items-center px-4 gap-2 border-b border-white/5 flex-shrink-0 z-10 w-full">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            </div>
            <div className="flex-1 bg-black/20 rounded-md px-3 py-1 text-[11px] text-white/30 ml-2 flex items-center gap-1.5 border border-white/5">
              <Globe size={10} />
              guma.ai/sites/{slug}
            </div>
          </div>

          {/* Responsive Wrapper */}
          <div 
            className="flex-1 w-full flex items-center justify-center pt-10 transition-all duration-300"
          >
            <div 
              className="h-full bg-white rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300"
              style={{
                width: viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '100%',
                maxWidth: '100%',
              }}
            >
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0 bg-white"
                title="Site preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
