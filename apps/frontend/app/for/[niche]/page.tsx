import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, MapPin, Star } from 'lucide-react'

// ─── Niche config ────────────────────────────────────────────────────────────

const NICHES: Record<string, {
  category: string        // maps to wizard category param
  label: string           // display name
  emoji: string
  headline: string
  subheadline: string
  pain: string[]          // 3 pain points specific to this niche
  platforms: string[]     // what platforms they're on
  examples: { name: string; city: string; tagline: string; accent: string; bg: string; text: string; badge: string }[]
  proofStat: string
  proofLabel: string
  cta: string
  metaTitle: string
  metaDesc: string
}> = {
  restaurants: {
    category: 'restaurant',
    label: 'Restaurants & Food Businesses',
    emoji: '🍽️',
    headline: 'Your food deserves more than a Facebook post.',
    subheadline: 'Get a free website that shows your menu, hours, and location — so hungry customers can find you on Google, not just on your feed.',
    pain: [
      'Customers ask "where are you located?" every single day in the comments.',
      'Your menu photos get buried under old posts. A website keeps them front and center, always.',
      'Grab, foodpanda, and Shopee Food take 30% commission. Your website sends customers directly to you.',
    ],
    platforms: ['📘 Facebook Page', '📸 Instagram Food Photos', '🎵 TikTok Recipes', '🛍️ Shopee Food', '🚗 Grab / Foodpanda'],
    examples: [
      { name: "Lola's Kitchen", city: 'Quezon City', tagline: 'Authentic Filipino home cooking since 1992', accent: '#f59e0b', bg: '#431407', text: '#fef3c7', badge: 'Restaurant' },
      { name: 'Café de Manila', city: 'Makati', tagline: 'Specialty coffee & light bites in the heart of the city', accent: '#a16207', bg: '#1c1917', text: '#fef9c3', badge: 'Café' },
    ],
    proofStat: '3×',
    proofLabel: 'more Google visibility vs. Facebook-only',
    cta: 'Get My Restaurant Website Free',
    metaTitle: 'Free Website for Restaurants in the Philippines | Guma AI',
    metaDesc: 'Get a free professional website for your restaurant, carinderia, or food business in the Philippines. Ready in 60 seconds. No coding needed.',
  },

  salons: {
    category: 'salon',
    label: 'Salons & Beauty Businesses',
    emoji: '✂️',
    headline: 'Your clients find you on Facebook. But new clients find you on Google.',
    subheadline: 'A free website that shows your services, prices, and booking link — so you stop losing customers to the salon they Googled instead.',
    pain: [
      'Potential clients Google "salon near me" and you don\'t show up — even if you\'re two streets away.',
      'Clients always ask for your price list. A website answers that before they even message you.',
      'Your best work photos deserve a permanent home, not to disappear in the Instagram feed.',
    ],
    platforms: ['📘 Facebook Page', '📸 Instagram Portfolio', '🎵 TikTok Tutorials', '💬 Viber Bookings'],
    examples: [
      { name: 'Studio Glam', city: 'Pasig', tagline: 'Premium hair, nails & skin care for modern Filipinas', accent: '#ec4899', bg: '#1a0010', text: '#fce7f3', badge: 'Salon' },
      { name: 'The Barber Society', city: 'Taguig', tagline: 'Precision cuts & fades for the modern gentleman', accent: '#3b82f6', bg: '#0f172a', text: '#dbeafe', badge: 'Barbershop' },
    ],
    proofStat: '60%',
    proofLabel: 'of salon bookings start with a Google search',
    cta: 'Get My Salon Website Free',
    metaTitle: 'Free Website for Salons & Beauty Shops in the Philippines | Guma AI',
    metaDesc: 'Get a free professional website for your salon, barbershop, or beauty business in the Philippines. Show your services, prices & booking link instantly.',
  },

  auto: {
    category: 'auto',
    label: 'Auto Repair & Automotive',
    emoji: '🚗',
    headline: 'Car owners Google the mechanic they trust. Are you showing up?',
    subheadline: 'A free website that shows your services, location, and contact — so drivers in your area find you first.',
    pain: [
      'Most drivers don\'t have a regular mechanic. They Google one when they need help. Without a website, you\'re invisible.',
      'Trust is everything in auto repair. A professional website builds credibility before the customer even drives in.',
      'Referrals are your best customers. Give them a link to share — not just a name to pass along.',
    ],
    platforms: ['📘 Facebook Page', '💬 Viber / SMS', '🗣️ Word of Mouth'],
    examples: [
      { name: 'Metro Auto Works', city: 'Makati', tagline: 'ASE-certified mechanics. Trusted by Makati drivers since 2015.', accent: '#3b82f6', bg: '#0f172a', text: '#dbeafe', badge: 'Auto Repair' },
      { name: 'FastLane Vulcanizing', city: 'Quezon City', tagline: 'Tire repair, alignment & aircon — same day service', accent: '#f97316', bg: '#1c0a00', text: '#ffedd5', badge: 'Vulcanizing' },
    ],
    proofStat: '7 in 10',
    proofLabel: 'customers choose a mechanic they found online',
    cta: 'Get My Auto Shop Website Free',
    metaTitle: 'Free Website for Auto Repair Shops in the Philippines | Guma AI',
    metaDesc: 'Get a free professional website for your auto repair shop, vulcanizing, or car service business in the Philippines. Ready in 60 seconds.',
  },

  medical: {
    category: 'medical',
    label: 'Clinics & Medical Practices',
    emoji: '🏥',
    headline: 'Patients research their doctor before they book. What do they find when they search yours?',
    subheadline: 'A free clinic website showing your specialization, schedule, and location — so patients choose you with confidence.',
    pain: [
      'Patients Google doctors before booking. If you have no website, they move on to the next clinic.',
      'New patients need to know: What do you specialize in? What are your hours? Where exactly are you? A website answers all three.',
      'A professional web presence signals trust — critical in healthcare where patients are already anxious.',
    ],
    platforms: ['📘 Facebook Page', '💬 Viber for Appointments', '🗣️ Patient Referrals'],
    examples: [
      { name: 'Dr. Santos Family Clinic', city: 'Mandaluyong', tagline: 'Compassionate general medicine for families in Metro Manila', accent: '#10b981', bg: '#022c22', text: '#d1fae5', badge: 'General Medicine' },
      { name: 'MindWell Psychology', city: 'BGC, Taguig', tagline: 'Professional mental health support in a safe, private setting', accent: '#8b5cf6', bg: '#1e1b4b', text: '#ede9fe', badge: 'Psychology' },
    ],
    proofStat: '80%',
    proofLabel: 'of patients research a clinic online before visiting',
    cta: 'Get My Clinic Website Free',
    metaTitle: 'Free Website for Clinics & Doctors in the Philippines | Guma AI',
    metaDesc: 'Get a free professional website for your clinic or medical practice in the Philippines. Show your schedule, specialization & location instantly.',
  },

  dental: {
    category: 'medical',
    label: 'Dental Clinics',
    emoji: '🦷',
    headline: 'People search for dentists near them every day. Show up when they do.',
    subheadline: 'A free dental website with your services, pricing, and booking info — so nervous patients pick you over the unknown.',
    pain: [
      '"Dentist near me" is one of the most Googled health searches in the Philippines. No website means no visibility.',
      'Patients want to know what you charge before they book. A website answers that and reduces cancellations.',
      'Before-and-after photos build trust faster than any ad. A website gives them a permanent, professional home.',
    ],
    platforms: ['📘 Facebook Page', '📸 Instagram Before/After', '💬 Viber for Bookings'],
    examples: [
      { name: 'BrightSmile Dental', city: 'Cebu City', tagline: 'Gentle, modern dentistry for the whole family', accent: '#10b981', bg: '#022c22', text: '#d1fae5', badge: 'Dental Clinic' },
      { name: 'Dra. Reyes Orthodontics', city: 'Quezon City', tagline: 'Specialist braces & Invisalign for teens and adults', accent: '#6366f1', bg: '#1e1b4b', text: '#e0e7ff', badge: 'Orthodontics' },
    ],
    proofStat: '2×',
    proofLabel: 'more new patient inquiries with a website vs. without',
    cta: 'Get My Dental Website Free',
    metaTitle: 'Free Website for Dental Clinics in the Philippines | Guma AI',
    metaDesc: 'Get a free professional website for your dental clinic in the Philippines. Show your services, pricing & booking link. Ready in 60 seconds.',
  },

  retail: {
    category: 'retail',
    label: 'Retail Shops & Boutiques',
    emoji: '🛍️',
    headline: 'Shopee and Lazada take their cut. Your website keeps it all.',
    subheadline: 'A free retail website that showcases your products and drives customers straight to you — no platform commission, no algorithm.',
    pain: [
      'Every Shopee and Lazada sale costs you 10–20% in commission. Direct customers through your own site cost nothing.',
      'On marketplaces, you compete on price. On your own site, you compete on brand — and you win.',
      'Marketplace customers are the platform\'s customers. Website customers are yours, forever.',
    ],
    platforms: ['🛍️ Shopee Store', '📦 Lazada Store', '📘 Facebook Shop', '📸 Instagram Shop', '🎵 TikTok Shop'],
    examples: [
      { name: 'Casa Hermosa', city: 'Manila', tagline: 'Handcrafted Filipino home décor & lifestyle pieces', accent: '#d97706', bg: '#1c1208', text: '#fef3c7', badge: 'Home Décor' },
      { name: 'Threads & Co.', city: 'Pasig', tagline: 'Affordable everyday fashion for the modern Filipina', accent: '#ec4899', bg: '#1a0010', text: '#fce7f3', badge: 'Boutique' },
    ],
    proofStat: '0%',
    proofLabel: 'commission on direct website sales vs. 10–20% on marketplaces',
    cta: 'Get My Shop Website Free',
    metaTitle: 'Free Website for Retail Shops in the Philippines | Guma AI',
    metaDesc: 'Get a free professional website for your retail shop or boutique in the Philippines. Stop paying marketplace fees. Ready in 60 seconds.',
  },

  bakery: {
    category: 'restaurant',
    label: 'Bakeries & Pastry Shops',
    emoji: '🧁',
    headline: 'Your pastries are beautiful. Your online presence should be too.',
    subheadline: 'A free bakery website that shows your bestsellers, custom order details, and pickup schedule — so customers order directly from you.',
    pain: [
      'Custom order inquiries get lost in Messenger threads. A website form collects everything you need upfront.',
      'Your Shopee or Facebook Shop photos disappear. A website keeps your best products visible forever.',
      'Word of mouth is powerful — but only if referrals have a link to send. Give them one.',
    ],
    platforms: ['📘 Facebook Orders', '📸 Instagram Showcase', '💬 Viber / Messenger Orders', '🛍️ Shopee'],
    examples: [
      { name: "Veyron's Cakes & Pastries", city: 'Manila', tagline: 'Custom celebration cakes made with love for every occasion', accent: '#f472b6', bg: '#1a0010', text: '#fce7f3', badge: 'Bakery' },
      { name: 'Pan de Amor', city: 'Caloocan', tagline: 'Freshly baked Filipino breads and pastries daily', accent: '#d97706', bg: '#1c0a00', text: '#fef3c7', badge: 'Panaderya' },
    ],
    proofStat: '40%',
    proofLabel: 'of custom cake orders come via Google search',
    cta: 'Get My Bakery Website Free',
    metaTitle: 'Free Website for Bakeries & Pastry Shops in the Philippines | Guma AI',
    metaDesc: 'Get a free professional website for your bakery or pastry shop in the Philippines. Show your menu, take custom orders. Ready in 60 seconds.',
  },

  trades: {
    category: 'trades',
    label: 'Trades & Home Services',
    emoji: '🔧',
    headline: 'When a pipe bursts, people Google a plumber. Not Facebook.',
    subheadline: 'A free website for your plumbing, electrical, aircon, or construction business — so urgent customers find you first, not your competitor.',
    pain: [
      'Emergency service jobs go to whoever shows up first on Google. A website puts you there.',
      'Clients want to see past work before they hire. A website with photos closes jobs before the call.',
      'Free quotes take time. A website pre-qualifies customers so you only talk to serious ones.',
    ],
    platforms: ['📘 Facebook Page', '💬 Viber / SMS', '🗣️ Referrals & Barangay Groups'],
    examples: [
      { name: 'QuickFix Home Services', city: 'Paranaque', tagline: 'Plumbing, electrical & aircon repair — same day response', accent: '#3b82f6', bg: '#0f172a', text: '#dbeafe', badge: 'Home Services' },
      { name: 'BuildRight Construction', city: 'Cavite', tagline: 'Trusted residential construction & renovation since 2010', accent: '#f59e0b', bg: '#1c1208', text: '#fef3c7', badge: 'Construction' },
    ],
    proofStat: '5×',
    proofLabel: 'more job inquiries for trades with a website vs. without',
    cta: 'Get My Business Website Free',
    metaTitle: 'Free Website for Trades & Home Services in the Philippines | Guma AI',
    metaDesc: 'Free website for plumbers, electricians, aircon repair, and construction businesses in the Philippines. Get found on Google. Ready in 60 seconds.',
  },

  gym: {
    category: 'generic',
    label: 'Gyms & Fitness Studios',
    emoji: '💪',
    headline: 'People search for gyms near them before they ever walk in.',
    subheadline: 'A free gym website showing your rates, schedules, and facilities — so fitness-seekers choose you over the gym they found on Google.',
    pain: [
      '"Gym near me" is searched thousands of times a month in every city. Without a website, you miss all of it.',
      'Membership inquiries flood your Messenger. A website answers rates, schedules, and FAQs before they even ask.',
      'Photos of your equipment and space close sign-ups. Keep them front and center on your own site.',
    ],
    platforms: ['📘 Facebook Page', '📸 Instagram Workouts', '🎵 TikTok Fitness Content'],
    examples: [
      { name: 'Iron District Gym', city: 'Quezon City', tagline: 'Serious training for serious athletes — open 24/7', accent: '#ef4444', bg: '#1a0000', text: '#fee2e2', badge: 'Gym' },
      { name: 'Bloom Pilates Studio', city: 'BGC, Taguig', tagline: 'Reformer Pilates & yoga for women in BGC', accent: '#8b5cf6', bg: '#1e1b4b', text: '#ede9fe', badge: 'Fitness Studio' },
    ],
    proofStat: '65%',
    proofLabel: 'of new gym members found it via Google search',
    cta: 'Get My Gym Website Free',
    metaTitle: 'Free Website for Gyms & Fitness Studios in the Philippines | Guma AI',
    metaDesc: 'Get a free professional website for your gym or fitness studio in the Philippines. Show rates, schedules & facilities. Ready in 60 seconds.',
  },

  laundry: {
    category: 'generic',
    label: 'Laundry Shops',
    emoji: '👕',
    headline: 'Laundry shops with a website get 3× more walk-ins from Google.',
    subheadline: 'A free website showing your rates, pickup/delivery options, and location — so busy customers choose you over the shop they found first.',
    pain: [
      'Customers Google "laundry pickup near me." Without a website, you\'re not in that list.',
      'Your rates and services are the first thing customers want to know. A website answers before they call.',
      'Offering pickup & delivery? That\'s your biggest edge — a website lets you shout it to the whole barangay.',
    ],
    platforms: ['📘 Facebook Page', '💬 Viber / SMS Orders', '🗣️ Barangay Word of Mouth'],
    examples: [
      { name: 'FreshFold Laundry', city: 'Pasig', tagline: 'Wash, dry & fold with free pickup & delivery in Pasig', accent: '#06b6d4', bg: '#001a1f', text: '#cffafe', badge: 'Laundry Shop' },
      { name: 'CleanPro Express', city: 'Manila', tagline: '8-hour express laundry service — clean, fresh, on time', accent: '#3b82f6', bg: '#0f172a', text: '#dbeafe', badge: 'Laundry' },
    ],
    proofStat: '3×',
    proofLabel: 'more walk-ins for laundry shops with a Google presence',
    cta: 'Get My Laundry Shop Website Free',
    metaTitle: 'Free Website for Laundry Shops in the Philippines | Guma AI',
    metaDesc: 'Get a free professional website for your laundry shop in the Philippines. Show your rates, pickup & delivery options. Ready in 60 seconds.',
  },
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { niche: string } }
): Promise<Metadata> {
  const niche = NICHES[params.niche]
  if (!niche) return { title: 'Guma AI' }
  return {
    title: niche.metaTitle,
    description: niche.metaDesc,
    openGraph: {
      title: niche.metaTitle,
      description: niche.metaDesc,
    },
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NichePage({ params }: { params: { niche: string } }) {
  const niche = NICHES[params.niche]
  if (!niche) notFound()

  const wizardUrl = `/auth/signup/manual?category=${niche.category}`

  return (
    <div className="min-h-screen bg-[#0a0b12] text-white overflow-x-hidden font-sans">

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-[-10%] left-[20%] w-[700px] h-[700px] bg-indigo/8 rounded-full blur-[140px]" />
        <div className="absolute top-[60%] right-[5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Nav */}
      <header className="border-b border-white/5 bg-zinc-950/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-white font-black text-lg tracking-tight">Guma AI</Link>
          <div className="flex items-center gap-4">
            <Link href="/start" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
              Build my website
            </Link>
            <Link href="/auth/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">

          <div className="inline-flex items-center gap-2 bg-zinc-800/60 border border-white/10 text-zinc-300 text-xs font-bold px-4 py-1.5 rounded-full">
            <span className="text-xl leading-none">{niche.emoji}</span>
            {niche.label}
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-tight text-white">
            {niche.headline.split('.')[0]}.{' '}
            {niche.headline.includes('.') && (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-light via-violet-400 to-indigo">
                {niche.headline.split('.').slice(1).join('.').trim()}
              </span>
            )}
          </h1>

          <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
            {niche.subheadline}
          </p>

          {/* Proof stat */}
          <div className="inline-flex items-center gap-4 bg-zinc-900/60 border border-white/8 rounded-2xl px-6 py-3">
            <div className="text-3xl font-black text-white">{niche.proofStat}</div>
            <div className="text-sm text-zinc-400 text-left leading-snug max-w-[200px]">{niche.proofLabel}</div>
          </div>

          {/* Platforms */}
          <div className="flex flex-wrap justify-center gap-2">
            {niche.platforms.map(p => (
              <span key={p} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10 bg-zinc-900/40 text-zinc-400">
                {p}
              </span>
            ))}
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo/30 bg-indigo/10 text-indigo-light">
              + your own website ✦
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href={wizardUrl}
              className="btn-primary rounded-full py-4 px-10 text-base font-black shadow-xl shadow-indigo/25 inline-flex items-center gap-2 justify-center"
            >
              {niche.cta} <ArrowRight size={18} />
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full py-4 px-8 text-sm font-semibold border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 transition inline-flex items-center gap-2 justify-center"
            >
              Search if my site is ready
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {['100% free to start', 'No coding needed', 'Ready in 60 seconds', 'Works on mobile'].map(item => (
              <span key={item} className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                <Check size={12} className="text-emerald-400" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Example Sites */}
      <section className="py-16 border-y border-white/5 bg-zinc-950/20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">What your site could look like</p>
            <h2 className="text-2xl font-extrabold text-white">Real examples for {niche.label.toLowerCase()}</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {niche.examples.map((ex, i) => (
              <div key={i} className="rounded-[1.5rem] overflow-hidden border border-white/5 bg-zinc-900/40 hover:-translate-y-1 transition-all duration-300">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/80 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400/60" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
                    <div className="w-2 h-2 rounded-full bg-green-400/60" />
                  </div>
                  <div className="flex-1 bg-zinc-800 rounded px-3 py-0.5 text-[9px] text-zinc-500 font-mono truncate mx-3">
                    guma.ai/sites/{ex.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-{ex.city.toLowerCase().split(',')[0].replace(/[^a-z0-9]+/g, '-')}
                  </div>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded-full">Live</span>
                </div>

                {/* Site preview */}
                <div className="p-1">
                  <div
                    className="rounded-b-xl p-5 space-y-3"
                    style={{ background: ex.bg }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: ex.accent }}>{ex.badge}</p>
                        <h3 className="font-black text-base leading-tight mb-1.5" style={{ color: ex.text }}>{ex.name}</h3>
                        <p className="text-[10px] leading-relaxed" style={{ color: ex.text, opacity: 0.6 }}>{ex.tagline}</p>
                      </div>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: ex.accent + '22', border: `1px solid ${ex.accent}44` }}
                      >
                        {niche.emoji}
                      </div>
                    </div>
                    <div
                      className="inline-flex items-center gap-1.5 text-[9px] font-black px-3 py-1.5 rounded-full"
                      style={{ background: ex.accent, color: '#000' }}
                    >
                      {niche.category === 'restaurant' ? 'View Menu' :
                       niche.category === 'medical'    ? 'Book Appointment' :
                       niche.category === 'salon'      ? 'Book Now' :
                       niche.category === 'trades'     ? 'Get Free Quote' :
                       'Contact Us'} <ArrowRight size={9} />
                    </div>
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{ex.name}</p>
                    <p className="flex items-center gap-1 text-[10px] text-zinc-500 mt-0.5">
                      <MapPin size={8} /> {ex.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={9} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Why {niche.label.toLowerCase()} need their own website</h2>
          </div>

          <div className="space-y-4">
            {niche.pain.map((p, i) => (
              <div key={i} className="flex gap-4 bg-zinc-900/40 border border-white/5 rounded-2xl p-5 hover:border-indigo/20 transition">
                <div className="w-8 h-8 rounded-xl bg-indigo/10 border border-indigo/20 flex items-center justify-center flex-shrink-0 text-sm font-black text-indigo-light">
                  {i + 1}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed pt-1">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 border-t border-white/5 bg-zinc-950/20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-white">Ready in 3 steps — takes 60 seconds</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { n: '01', icon: '✍️', title: 'Tell us your business name', desc: 'Add your tagline — what makes you special in one line.' },
              { n: '02', icon: '⚡', title: 'We build it instantly', desc: 'No waiting. Your professional site is ready before you finish reading this.' },
              { n: '03', icon: '🌐', title: 'Go live — free', desc: 'Share your link on all your platforms. Customers find you on Google too.' },
            ].map(s => (
              <div key={s.n} className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 text-center hover:border-indigo/20 transition">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="text-[10px] font-black tracking-widest text-indigo-light/50 uppercase mb-1">Step {s.n}</div>
                <h3 className="text-sm font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-indigo/10 via-zinc-900/40 to-zinc-950/60 border border-indigo/20 rounded-[2rem] p-10 text-center space-y-6 relative overflow-hidden">
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-indigo/10 blur-3xl pointer-events-none" />
            <div className="text-4xl">{niche.emoji}</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Your {niche.label.toLowerCase().split('&')[0].trim()} deserves to be found online.
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Free. No coding. No maintenance. Built in 60 seconds.
            </p>
            <Link
              href={wizardUrl}
              className="btn-primary py-4 px-10 rounded-full shadow-xl shadow-indigo/25 inline-flex text-sm font-black items-center gap-2"
            >
              {niche.cta} <ArrowRight size={16} />
            </Link>
            <p className="text-xs text-zinc-600">No credit card · No technical skills · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Browse other niches */}
      <section className="py-12 px-6 border-t border-white/5 bg-zinc-950/20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-600 text-center mb-6">Other business types</p>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(NICHES)
              .filter(([key]) => key !== params.niche)
              .map(([key, n]) => (
                <Link
                  key={key}
                  href={`/for/${key}`}
                  className="text-xs font-semibold px-3 py-2 rounded-full border border-white/8 bg-zinc-900/30 text-zinc-400 hover:text-white hover:border-white/20 transition"
                >
                  {n.emoji} {n.label.split('&')[0].trim()}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#080910] py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <span>© {new Date().getFullYear()} Guma AI. All rights reserved.</span>
          <div className="flex gap-6 text-zinc-500">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/start" className="hover:text-white transition-colors">Build my website</Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Static params for build-time generation ─────────────────────────────────

export function generateStaticParams() {
  return Object.keys(NICHES).map(niche => ({ niche }))
}
