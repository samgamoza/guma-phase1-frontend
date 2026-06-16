'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Zap, ArrowRight, CheckCircle2, Globe, Search,
  Star, Shield, Smartphone, Check, TrendingUp,
  ChevronDown, ChevronUp, MapPin, Clock, Users,
  Award, BarChart3, Lock, Sparkles, ExternalLink
} from 'lucide-react'
import MobileFab from './MobileFab'
import ClaimedTicker from './ClaimedTicker'

// ─── Static Data ────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Search,
    title: 'Search',
    desc: 'Enter your business name to see if a website is already available for you.',
  },
  {
    step: '02',
    icon: CheckCircle2,
    title: 'Claim',
    desc: 'Verify ownership and activate your website instantly — no technical setup needed.',
  },
  {
    step: '03',
    icon: TrendingUp,
    title: 'Grow',
    desc: 'Update your content, connect your domain, and start attracting customers online.',
  },
]

const FEATURES = [
  {
    tag: 'Get Online Faster',
    title: 'Launch a professional website without hiring anyone.',
    desc: 'Your website is ready before you even sign up. Simply claim it and go live in minutes — no designers, no developers, no waiting.',
    benefits: ['Ready to launch immediately', 'Mobile-friendly design', 'Professional appearance'],
    icon: Globe,
    visual: (
      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-zinc-900/60 rounded-2xl px-4 py-3 border border-white/5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Check size={14} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Website Ready</p>
            <p className="text-[10px] text-zinc-500">guma.ai/sites/your-business</p>
          </div>
          <span className="ml-auto text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded-full">Live</span>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900/60 rounded-2xl px-4 py-3 border border-white/5">
          <div className="w-8 h-8 rounded-lg bg-indigo/20 flex items-center justify-center flex-shrink-0">
            <Smartphone size={14} className="text-indigo-light" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Mobile Optimized</p>
            <p className="text-[10px] text-zinc-500">Looks great on all screens</p>
          </div>
          <span className="ml-auto text-[10px] bg-indigo/15 text-indigo-light font-bold px-2 py-0.5 rounded-full">✓</span>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900/60 rounded-2xl px-4 py-3 border border-white/5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Award size={14} className="text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Professional Design</p>
            <p className="text-[10px] text-zinc-500">Industry-matched look & feel</p>
          </div>
          <span className="ml-auto text-[10px] bg-amber-500/15 text-amber-400 font-bold px-2 py-0.5 rounded-full">✓</span>
        </div>
      </div>
    ),
  },
  {
    tag: 'Built To Be Found',
    title: 'Search-friendly pages that help customers discover you.',
    desc: 'Every Guma AI website is built with local SEO in mind — structured metadata, fast loading, and clean URLs so your business shows up when people search.',
    benefits: ['Fast loading pages', 'SEO-ready structure', 'Local search visibility'],
    icon: Search,
    visual: (
      <div className="space-y-4">
        <div className="bg-zinc-900/60 rounded-2xl p-4 border border-white/5 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-indigo/20 flex items-center justify-center">
              <Shield size={12} className="text-indigo-light" />
            </div>
            <span className="text-xs font-bold text-white">SEO Health Check</span>
            <span className="ml-auto text-[10px] font-bold text-emerald-400">95/100</span>
          </div>
          {['SSL certificate active', 'Structured schema injected', 'Sitemap generated', 'Mobile score: 98'].map(item => (
            <div key={item} className="flex items-center gap-2 text-xs text-zinc-400">
              <Check size={12} className="text-emerald-400 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    tag: 'Own Your Brand',
    title: 'Use your own domain name and build real brand equity.',
    desc: 'On Pro, connect your custom domain (yourbusiness.com), remove the Guma badge, and establish a credible online presence that truly belongs to you.',
    benefits: ['Custom domain support', 'SSL security included', 'Professional credibility'],
    icon: Lock,
    visual: (
      <div className="space-y-3">
        <div className="bg-zinc-900/60 rounded-2xl p-5 border border-white/5">
          <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-3">Your domain</p>
          <div className="flex items-center gap-2 bg-zinc-950 rounded-xl px-4 py-3 border border-indigo/30">
            <Lock size={12} className="text-emerald-400" />
            <span className="text-sm font-mono text-white">yourbusiness.com</span>
            <span className="ml-auto text-[10px] text-emerald-400 font-bold">Secured ✓</span>
          </div>
          <p className="text-[10px] text-zinc-600 mt-2 text-center">SSL certificate automatically provisioned</p>
        </div>
      </div>
    ),
  },
  {
    tag: 'Grow With Confidence',
    title: 'Track visitors and manage everything from one dashboard.',
    desc: 'See who is visiting your site, update your business information anytime, and access tools to help you grow your online presence as your business scales.',
    benefits: ['Visitor analytics', 'Easy content updates', 'Growth tools included'],
    icon: BarChart3,
    visual: (
      <div className="space-y-3">
        <div className="bg-zinc-900/60 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-white">Monthly Visitors</span>
            <span className="text-xs text-emerald-400 font-bold">↑ 24%</span>
          </div>
          <div className="flex items-end gap-1.5 h-16">
            {[40, 55, 48, 70, 62, 85, 78, 95].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm bg-indigo/30 hover:bg-indigo/60 transition-colors" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[9px] text-zinc-600">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
          </div>
        </div>
      </div>
    ),
  },
]

// Featured site data is now embedded directly in the JSX below for unique per-card layouts.

const STATS = [
  { value: '10,000+', label: 'Businesses Available', icon: Globe },
  { value: '500+',    label: 'Websites Claimed',     icon: CheckCircle2 },
  { value: '95%',     label: 'Mobile Performance',   icon: Smartphone },
  { value: '24/7',    label: 'Secure Hosting',        icon: Shield },
]

const FAQS = [
  {
    q: 'Is my website really already available?',
    a: 'Many businesses already have a ready-to-launch website on Guma AI. Search your business name above to find out — it takes less than a minute.',
  },
  {
    q: 'Do I need technical skills?',
    a: 'No. Everything is designed for business owners with zero technical experience. If you can type your name, you can claim and manage your website.',
  },
  {
    q: 'Can I use my own domain name?',
    a: 'Yes. Pro plans support custom domains. You can connect yourbusiness.com and remove all Guma AI branding for a fully professional presence.',
  },
  {
    q: 'Is it free to claim?',
    a: 'Yes. Claiming and activating your website is completely free. No credit card required. Upgrade to Pro when you are ready for more features.',
  },
  {
    q: 'Can I edit the website later?',
    a: 'Absolutely. You can update your business name, phone number, description, photos, and hours anytime from your dashboard.',
  },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    window.location.href = `/auth/signup?q=${encodeURIComponent(searchQuery)}`
  }

  return (
    <div className="min-h-screen bg-[#0a0b12] text-white selection:bg-indigo/30 overflow-x-hidden font-sans">

      {/* Ambient background — warmer gradient mesh + subtle dot grid + noise */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 ambient-mesh" />
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-[-10%] left-[20%] w-[800px] h-[800px] bg-indigo/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[10%] w-[600px] h-[600px] bg-violet-600/7 rounded-full blur-[120px]" />
        <div className="absolute top-[80%] left-[40%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Top Banner */}
      <div className="relative z-20 bg-[#0b0c10] text-zinc-300 text-xs py-3 px-6 text-center font-medium border-b border-white/5 tracking-wide">
        <span className="bg-indigo/20 text-indigo-light border border-indigo/30 px-2.5 py-0.5 rounded-full mr-2 text-[10px] font-black uppercase tracking-widest">Beta</span>
        Thousands of Philippine businesses already have a website waiting for them.
      </div>

      {/* Navigation */}
      <header className="border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo flex items-center justify-center shadow-lg shadow-indigo/30">
              <Zap size={15} className="text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">GUMA <span className="text-indigo-light font-medium text-sm">AI</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-400">
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="#examples" className="hover:text-white transition-colors">Examples</Link>
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-semibold text-zinc-400 hover:text-white px-4 py-2 transition-colors">
              Sign in
            </Link>
            <Link href="/auth/signup" className="btn-primary shadow-indigo/20 py-2 px-5 rounded-full flex items-center gap-1.5 text-xs tracking-wide uppercase font-black hover:shadow-indigo/40 transition-shadow">
              Find My Business <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">

          <div className="inline-flex items-center gap-2 bg-zinc-900/70 border border-white/8 shadow-lg text-indigo-light text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider backdrop-blur">
            <Sparkles size={11} className="text-indigo" />
            Search. Claim. Launch.
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.01] text-white max-w-4xl mx-auto">
            Your website may{' '}
            <span className="bg-gradient-to-r from-indigo-light via-violet-400 to-indigo bg-clip-text text-transparent">
              already be waiting.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Search your business name to see if a ready-to-launch website is available.
            Claim it in minutes and start building your online presence.
          </p>

          {/* Hero Search */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto pt-2">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Enter your business name…"
                className="w-full pl-11 pr-5 py-4 rounded-full border border-white/10 bg-zinc-900/70 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo/60 transition text-sm backdrop-blur"
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary rounded-full py-4 px-8 text-sm font-black shadow-xl shadow-indigo/20 hover:shadow-indigo/40 transition whitespace-nowrap flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Find My Business <ArrowRight size={15} />
            </button>
          </form>

          {/* Secondary CTA */}
          <div className="flex justify-center">
            <Link href="#examples" className="text-sm text-zinc-500 hover:text-white underline underline-offset-4 transition-colors flex items-center gap-1.5">
              <ExternalLink size={13} />
              View example websites first
            </Link>
          </div>

          {/* Trust Strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-4">
            {['Free to claim', 'Mobile friendly', 'SEO ready', 'Live in minutes'].map(item => (
              <span key={item} className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                <Check size={13} className="text-emerald-400" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Live Ticker */}
      <ClaimedTicker />

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 border-y border-white/5 bg-zinc-950/20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <div className="section-label">How it works</div>
            <h2 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-300">
              From search to live in minutes
            </h2>
            <p className="text-zinc-500 max-w-md mx-auto text-sm">
              No technical skills. No design experience. No complicated setup.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px bg-gradient-to-r from-transparent via-indigo/30 to-transparent" aria-hidden />

            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative bg-zinc-900/30 backdrop-blur-sm border border-white/5 rounded-3xl p-8 hover:border-indigo/25 transition-all duration-300 group text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo/10 border border-indigo/20 flex items-center justify-center mb-6 mx-auto group-hover:bg-indigo/20 transition-colors">
                  <Icon size={22} className="text-indigo-light" />
                </div>
                <div className="text-[10px] font-black tracking-widest text-indigo-light/60 uppercase mb-2">Step {step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED WEBSITES — unique realistic mockups ────────────────── */}
      <section id="examples" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="section-label">Featured Websites</div>
            <h2 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-300">
              Real websites, already built
            </h2>
            <p className="text-zinc-500 max-w-lg mx-auto text-sm leading-relaxed">
              These businesses found their website ready and claimed it in minutes.
              Yours could be next.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* ── Card 1: Metro Auto Works — dark industrial theme ── */}
            <div className="group relative bg-zinc-900/40 border border-white/5 rounded-[1.75rem] overflow-hidden hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-500">
              <div className="card-shimmer absolute inset-0 rounded-[1.75rem] pointer-events-none" />
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-5 py-3 bg-zinc-900/80 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 bg-zinc-800 rounded-md px-3 py-1 text-[10px] text-zinc-500 font-mono truncate mx-4">
                  metroautoworks.guma.ai
                </div>
                <div className="text-[9px] bg-emerald-500/15 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full">✓ Claimed</div>
              </div>
              {/* Site preview — dark industrial auto shop */}
              <div className="p-1">
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 rounded-b-2xl overflow-hidden">
                  {/* Hero area */}
                  <div className="relative p-6 pb-5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-black">M</div>
                        <span className="text-white font-extrabold text-sm">Metro Auto Works</span>
                      </div>
                      <div className="flex gap-3 text-[9px] text-slate-400 font-medium">
                        <span>Services</span><span>About</span><span>Contact</span>
                      </div>
                    </div>
                    <h3 className="text-white text-lg font-black leading-tight mb-1.5">Expert Auto Repair &<br />Maintenance Services</h3>
                    <p className="text-slate-400 text-[10px] mb-4 max-w-[260px]">Trusted by Makati City drivers since 2015. ASE-certified technicians.</p>
                    <div className="flex gap-2">
                      <div className="bg-blue-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-md">Book Service</div>
                      <div className="border border-slate-600 text-slate-300 text-[9px] font-medium px-3 py-1.5 rounded-md">Call Now</div>
                    </div>
                  </div>
                  {/* Service cards row */}
                  <div className="px-6 pb-5 grid grid-cols-3 gap-2">
                    {[
                      { label: 'Oil Change', price: '₱850', icon: '🛢️' },
                      { label: 'Brake Service', price: '₱2,400', icon: '🔧' },
                      { label: 'AC Repair', price: '₱1,800', icon: '❄️' },
                    ].map(s => (
                      <div key={s.label} className="bg-slate-800/80 border border-slate-700/50 rounded-lg p-2.5 text-center">
                        <div className="text-lg mb-0.5">{s.icon}</div>
                        <div className="text-[9px] font-bold text-white">{s.label}</div>
                        <div className="text-[8px] text-blue-400 font-semibold mt-0.5">from {s.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Card info */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Metro Auto Works</span>
                    <span className="text-[9px] bg-blue-500/15 text-blue-300 font-bold px-2 py-0.5 rounded-full">Auto Repair</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
                    <MapPin size={9} /> Makati City
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={10} className="text-amber-400 fill-amber-400" />)}
                  <span className="text-[10px] text-zinc-500 ml-1">4.9</span>
                </div>
              </div>
            </div>

            {/* ── Card 2: BrightSmile Dental — clean medical white/green ── */}
            <div className="group relative bg-zinc-900/40 border border-white/5 rounded-[1.75rem] overflow-hidden hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-500">
              <div className="card-shimmer absolute inset-0 rounded-[1.75rem] pointer-events-none" />
              <div className="flex items-center gap-2 px-5 py-3 bg-zinc-900/80 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 bg-zinc-800 rounded-md px-3 py-1 text-[10px] text-zinc-500 font-mono truncate mx-4">
                  brightsmiledental.guma.ai
                </div>
                <div className="text-[9px] bg-emerald-500/15 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full">✓ Claimed</div>
              </div>
              <div className="p-1">
                <div className="bg-gradient-to-br from-[#f0fdf4] via-[#ecfdf5] to-[#f8fafc] rounded-b-2xl overflow-hidden">
                  {/* Light theme hero */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm">🦷</div>
                        <span className="text-emerald-900 font-extrabold text-sm">BrightSmile</span>
                      </div>
                      <div className="flex gap-3 text-[9px] text-emerald-700/60 font-medium">
                        <span>Services</span><span>Team</span><span>Book</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <h3 className="text-emerald-900 text-lg font-black leading-tight mb-1.5">Your smile deserves<br />the best care.</h3>
                        <p className="text-emerald-700/60 text-[10px] mb-3">Gentle, modern dentistry in the heart of Cebu City.</p>
                        <div className="bg-emerald-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-full inline-block">Book Appointment →</div>
                      </div>
                      <div className="w-24 h-24 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-4xl flex-shrink-0">
                        😁
                      </div>
                    </div>
                  </div>
                  {/* Trust badges */}
                  <div className="px-6 pb-5 flex gap-2">
                    {[
                      { label: '15+ Years', sub: 'Experience' },
                      { label: '5,000+', sub: 'Happy Patients' },
                      { label: '4.8 ★', sub: 'Google Rating' },
                    ].map(b => (
                      <div key={b.label} className="flex-1 bg-white border border-emerald-100 rounded-lg p-2.5 text-center shadow-sm">
                        <div className="text-[10px] font-black text-emerald-700">{b.label}</div>
                        <div className="text-[8px] text-emerald-600/50 font-medium">{b.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">BrightSmile Dental</span>
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-300 font-bold px-2 py-0.5 rounded-full">Dental Clinic</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
                    <MapPin size={9} /> Cebu City
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={10} className="text-amber-400 fill-amber-400" />)}
                  <span className="text-[10px] text-zinc-500 ml-1">4.8</span>
                </div>
              </div>
            </div>

            {/* ── Card 3: Lola's Kitchen — warm rustic restaurant ── */}
            <div className="group relative bg-zinc-900/40 border border-white/5 rounded-[1.75rem] overflow-hidden hover:border-orange-500/30 hover:-translate-y-1 transition-all duration-500">
              <div className="card-shimmer absolute inset-0 rounded-[1.75rem] pointer-events-none" />
              <div className="flex items-center gap-2 px-5 py-3 bg-zinc-900/80 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 bg-zinc-800 rounded-md px-3 py-1 text-[10px] text-zinc-500 font-mono truncate mx-4">
                  lolaskitchen.guma.ai
                </div>
                <div className="text-[9px] bg-emerald-500/15 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full">✓ Claimed</div>
              </div>
              <div className="p-1">
                <div className="bg-gradient-to-br from-amber-950 via-orange-950 to-stone-900 rounded-b-2xl overflow-hidden relative">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(251,191,36,0.4) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                  <div className="p-6 pb-4 relative">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🍲</span>
                        <div>
                          <span className="text-amber-100 font-extrabold text-sm block leading-none">Lola&apos;s Kitchen</span>
                          <span className="text-amber-400/60 text-[8px] font-medium tracking-widest uppercase">Filipino Home Cooking</span>
                        </div>
                      </div>
                      <div className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[9px] font-bold px-2.5 py-1 rounded-full">🕐 Open Now</div>
                    </div>
                    <h3 className="text-amber-50 text-lg font-black leading-tight mb-1.5">Taste the warmth of<br />home-cooked Filipino food.</h3>
                    <p className="text-amber-200/40 text-[10px] mb-4">Family recipes passed down for 3 generations. Quezon City.</p>
                    <div className="flex gap-2">
                      <div className="bg-amber-500 text-amber-950 text-[9px] font-black px-3 py-1.5 rounded-md">View Menu</div>
                      <div className="border border-amber-600/40 text-amber-200 text-[9px] font-medium px-3 py-1.5 rounded-md">Reserve a Table</div>
                    </div>
                  </div>
                  {/* Menu preview */}
                  <div className="px-6 pb-5 grid grid-cols-3 gap-2 relative">
                    {[
                      { dish: 'Sinigang na Baboy', price: '₱280', emoji: '🥘' },
                      { dish: 'Kare-Kare', price: '₱350', emoji: '🍛' },
                      { dish: 'Halo-Halo', price: '₱120', emoji: '🍧' },
                    ].map(m => (
                      <div key={m.dish} className="bg-amber-900/40 backdrop-blur-sm border border-amber-700/30 rounded-lg p-2.5 text-center">
                        <div className="text-lg mb-0.5">{m.emoji}</div>
                        <div className="text-[8px] font-bold text-amber-100 leading-tight">{m.dish}</div>
                        <div className="text-[8px] text-amber-400 font-semibold mt-0.5">{m.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Lola&apos;s Kitchen</span>
                    <span className="text-[9px] bg-orange-500/15 text-orange-300 font-bold px-2 py-0.5 rounded-full">Restaurant</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
                    <MapPin size={9} /> Quezon City
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={10} className="text-amber-400 fill-amber-400" />)}
                  <span className="text-[10px] text-zinc-500 ml-1">4.7</span>
                </div>
              </div>
            </div>

            {/* ── Card 4: Santos & Partners — elegant dark law firm ── */}
            <div className="group relative bg-zinc-900/40 border border-white/5 rounded-[1.75rem] overflow-hidden hover:border-amber-400/30 hover:-translate-y-1 transition-all duration-500">
              <div className="card-shimmer absolute inset-0 rounded-[1.75rem] pointer-events-none" />
              <div className="flex items-center gap-2 px-5 py-3 bg-zinc-900/80 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 bg-zinc-800 rounded-md px-3 py-1 text-[10px] text-zinc-500 font-mono truncate mx-4">
                  santospartners.guma.ai
                </div>
                <div className="text-[9px] bg-amber-500/15 text-amber-300 font-bold px-2.5 py-0.5 rounded-full">⚡ Available</div>
              </div>
              <div className="p-1">
                <div className="bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950 rounded-b-2xl overflow-hidden">
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xs font-black text-amber-950">S&P</div>
                        <div>
                          <span className="text-white font-extrabold text-sm block leading-none">Santos & Partners</span>
                          <span className="text-amber-400/50 text-[8px] font-medium tracking-widest uppercase">Law Firm · Est. 2008</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-l-2 border-amber-400/40 pl-4 mb-4">
                      <h3 className="text-white text-lg font-black leading-tight mb-1">Justice. Integrity.<br />Unwavering Advocacy.</h3>
                      <p className="text-zinc-500 text-[10px]">Full-service legal counsel for businesses and individuals in BGC, Taguig.</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-amber-400 text-amber-950 text-[9px] font-black px-3 py-1.5 rounded-md">Free Consultation</div>
                      <div className="border border-zinc-700 text-zinc-300 text-[9px] font-medium px-3 py-1.5 rounded-md">Our Practice Areas</div>
                    </div>
                  </div>
                  {/* Practice areas */}
                  <div className="px-6 pb-5 flex gap-2">
                    {[
                      { area: 'Corporate Law', icon: '🏢' },
                      { area: 'Litigation', icon: '⚖️' },
                      { area: 'Real Estate', icon: '🏠' },
                      { area: 'Tax Advisory', icon: '📊' },
                    ].map(a => (
                      <div key={a.area} className="flex-1 bg-zinc-800/60 border border-zinc-700/40 rounded-lg p-2 text-center">
                        <div className="text-sm mb-0.5">{a.icon}</div>
                        <div className="text-[7px] font-bold text-zinc-300 leading-tight">{a.area}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Santos & Partners</span>
                    <span className="text-[9px] bg-amber-500/15 text-amber-300 font-bold px-2 py-0.5 rounded-full">Law Firm</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
                    <MapPin size={9} /> BGC, Taguig
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={10} className="text-amber-400 fill-amber-400" />)}
                  <span className="text-[10px] text-zinc-500 ml-1">5.0</span>
                </div>
              </div>
            </div>

          </div>

          <div className="text-center mt-12">
            <Link
              href="/auth/signup"
              className="btn-primary rounded-full py-3 px-8 text-sm font-black shadow-lg shadow-indigo/20 inline-flex items-center gap-2"
            >
              Find My Business <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 border-t border-white/5 bg-zinc-950/15 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <div className="section-label">Everything included</div>
            <h2 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-300">
              Built for business owners, not developers
            </h2>
          </div>

          <div className="space-y-24">
            {FEATURES.map((feat, i) => (
              <div key={feat.tag} className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 !== 0 ? 'md:[&>:first-child]:order-2' : ''}`}>
                <div className="space-y-6">
                  <span className="text-xs font-bold tracking-widest uppercase text-indigo-light bg-indigo/10 border border-indigo/20 px-3 py-1 rounded-full">
                    {feat.tag}
                  </span>
                  <h3 className="text-3xl font-extrabold text-white leading-tight">{feat.title}</h3>
                  <p className="text-zinc-400 text-base leading-relaxed">{feat.desc}</p>
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    {feat.benefits.map(b => (
                      <div key={b} className="flex items-center gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                          <Check size={11} className="text-emerald-400" />
                        </div>
                        <span className="text-zinc-300 font-medium">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-zinc-950 rounded-3xl border border-white/5 p-6 shadow-2xl">
                  {feat.visual}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OBJECTION HANDLING ───────────────────────────────────────────── */}
      <section className="py-28 border-t border-white/5 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 border border-white/8 rounded-[2.5rem] p-10 sm:p-16 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="section-label">Zero friction</div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                No website experience required.
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                No coding. No design skills. No complicated setup.
                Simply claim your website and make updates whenever you're ready.
              </p>
              <Link href="/auth/signup" className="btn-primary inline-flex items-center gap-2 py-3.5 px-8 rounded-full text-sm font-black">
                Claim My Website Free <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {[
                'No Developer Needed',
                'No Hosting Setup',
                'No Technical Knowledge',
                'No Maintenance Hassles',
              ].map(item => (
                <div key={item} className="flex items-center gap-4 bg-zinc-900/50 border border-white/5 rounded-2xl px-5 py-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <Check size={16} className="text-emerald-400" />
                  </div>
                  <span className="font-semibold text-white text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF METRICS ─────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/5 bg-zinc-950/30 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <div className="section-label">Growing every day</div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Businesses are claiming their sites right now
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 text-center hover:border-indigo/20 transition group">
                <div className="w-10 h-10 rounded-xl bg-indigo/10 border border-indigo/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo/20 transition-colors">
                  <Icon size={18} className="text-indigo-light" />
                </div>
                <div className="text-3xl font-black text-white mb-1">{value}</div>
                <div className="text-xs text-zinc-500 font-semibold">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 border-t border-white/5 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <div className="section-label">Pricing</div>
            <h2 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-300">
              Start free, scale when ready
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto text-sm">
              No contracts. No hidden fees. Upgrade or cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">

            {/* Free Plan */}
            <div className="bg-zinc-900/10 border border-white/5 rounded-3xl p-8 sm:p-10 flex flex-col justify-between hover:border-white/10 transition">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Free</span>
                  <p className="text-sm text-zinc-500 mt-1">Perfect for getting online.</p>
                  <h3 className="text-4xl font-black text-white mt-3">$0 <span className="text-sm font-normal text-zinc-500">/mo</span></h3>
                </div>
                <div className="h-px bg-white/5" />
                <ul className="space-y-4">
                  {['Instant website', 'guma.ai subdomain', 'Basic analytics', 'Mobile-friendly design'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/auth/signup" className="w-full text-center py-3.5 rounded-full border border-white/10 text-white bg-zinc-950 font-bold hover:bg-zinc-900 transition text-sm mt-8 block">
                Get started free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-zinc-900/25 border-2 border-indigo rounded-3xl p-8 sm:p-10 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo/10 transition relative">
              <div className="absolute -top-3.5 left-8 bg-indigo text-white text-[9px] font-extrabold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg shadow-indigo/30">
                Most Popular
              </div>
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-light">Pro</span>
                  <p className="text-sm text-zinc-400 mt-1">Perfect for growing your brand.</p>
                  <h3 className="text-4xl font-black text-white mt-3">$29 <span className="text-sm font-normal text-zinc-500">/mo</span></h3>
                </div>
                <div className="h-px bg-white/5" />
                <ul className="space-y-4">
                  {['Everything in Free', 'Custom domain', 'Drag-and-drop editor', 'Contact forms', 'Remove Guma AI badge', 'Priority support'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/auth/signup" className="btn-primary w-full justify-center rounded-full py-4 mt-8 shadow-lg shadow-indigo/20">
                Start with Pro <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-28 border-t border-white/5 bg-zinc-950/20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="section-label">FAQ</div>
            <h2 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-300">
              Common questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden hover:border-white/8 transition">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-bold text-white text-sm leading-snug">{faq.q}</span>
                  <div className="flex-shrink-0 w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-zinc-400">
                    {openFaq === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto relative">
          <div className="rounded-[2.5rem] bg-gradient-to-br from-indigo/10 via-zinc-900/40 to-zinc-950/60 border border-indigo/20 p-12 sm:p-20 text-center relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-indigo/10 blur-3xl pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-violet-700/8 blur-3xl pointer-events-none" />

            <div className="relative max-w-2xl mx-auto space-y-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo flex items-center justify-center mx-auto shadow-lg shadow-indigo/30">
                <Zap size={24} className="text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Search your business.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-light to-violet-400">
                  Your website could already be ready.
                </span>
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed">
                Find out in less than a minute. No credit card required.
              </p>
              <Link href="/auth/signup" className="btn-primary py-4 px-12 rounded-full shadow-xl shadow-indigo/25 inline-flex text-base font-black hover:shadow-indigo/40 transition items-center gap-2">
                Find My Business <ArrowRight size={17} />
              </Link>
              <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-zinc-500 pt-2">
                <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Free forever</span>
                <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> No credit card</span>
                <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Live in minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-[#080910] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-indigo flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">GUMA <span className="text-indigo-light font-medium text-xs">AI</span></span>
            <span className="text-zinc-700">|</span>
            <span>© {new Date().getFullYear()} Guma AI. All rights reserved.</span>
          </div>
          <div className="flex gap-6 font-semibold text-zinc-400">
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/auth/signup" className="hover:text-white transition-colors text-indigo-light">Get started</Link>
          </div>
        </div>
      </footer>

      <MobileFab />
    </div>
  )
}
