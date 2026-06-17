import Link from 'next/link'
import { ArrowRight, Check, Globe, Clock } from 'lucide-react'

const PLATFORMS = [
  { name: 'Facebook', icon: '📘', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { name: 'Instagram', icon: '📸', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  { name: 'TikTok', icon: '🎵', color: 'text-white', bg: 'bg-zinc-700/40 border-white/10' },
  { name: 'Shopee', icon: '🛍️', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  { name: 'Lazada', icon: '📦', color: 'text-blue-300', bg: 'bg-blue-400/10 border-blue-400/20' },
  { name: 'Viber', icon: '💬', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
]

const STEPS = [
  {
    number: '01',
    icon: '✍️',
    title: 'Tell us your business name',
    desc: 'And what you do. Takes less than a minute.',
  },
  {
    number: '02',
    icon: '⚡',
    title: 'We build your website instantly',
    desc: "No waiting. No back-and-forth. It's ready before you finish your coffee.",
  },
  {
    number: '03',
    icon: '🌐',
    title: 'You go live — for free',
    desc: 'Share the link anywhere. Customers can now find you on Google, 24/7.',
  },
]

const OBJECTIONS = [
  {
    fear: '"Websites are too expensive."',
    truth: 'Guma AI is 100% free to start. No credit card. No monthly fee to get online.',
    icon: '💸',
  },
  {
    fear: '"I don\'t know how to build one."',
    truth: "You don't build anything. We build it for you — you just answer 3 questions.",
    icon: '🛠️',
  },
  {
    fear: '"I\'m too busy to maintain a website."',
    truth: "There's nothing to maintain. Update your phone number? Done in 10 seconds from your phone.",
    icon: '⏱️',
  },
  {
    fear: '"My Facebook / Shopee / TikTok page is enough."',
    truth: "Those platforms decide who sees you — and they can restrict your reach anytime. Your own website is always there, on Google, on maps, 24/7. No algorithm in the way.",
    icon: '📡',
  },
  {
    fear: '"I only sell on Shopee or Lazada."',
    truth: "A website builds trust before customers even open your Shopee store. Buyers who Google you and find nothing often don't buy. A website fixes that.",
    icon: '🏆',
  },
  {
    fear: '"My customers find me on TikTok anyway."',
    truth: "TikTok is great for discovery. But when someone wants to contact you, check your hours, or send a referral — they need a link. Give them one.",
    icon: '🔗',
  },
]

export default function StartPage() {
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
          <Link href="/auth/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-7">

          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
            🇵🇭 Built for Filipino business owners
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-tight text-white">
            You&apos;re on every platform.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-light via-violet-400 to-indigo">
              But do you own your online presence?
            </span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Facebook, Instagram, TikTok, Shopee, Viber — you&apos;re doing everything right.
            But none of those are yours. One algorithm change and your reach disappears.
            A website is the one thing you actually own.
          </p>

          {/* Platform badges */}
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {PLATFORMS.map(p => (
              <span key={p.name} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${p.bg} ${p.color}`}>
                {p.icon} {p.name}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10 text-zinc-500">
              + more
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/auth/signup/manual"
              className="btn-primary rounded-full py-4 px-10 text-base font-black shadow-xl shadow-indigo/25 inline-flex items-center gap-2 justify-center"
            >
              Build My Free Website <ArrowRight size={18} />
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full py-4 px-8 text-sm font-semibold border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 transition inline-flex items-center gap-2 justify-center"
            >
              Search if my site is already ready
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2">
            {['100% free to start', 'No coding needed', 'Ready in 60 seconds', 'Works on mobile'].map(item => (
              <span key={item} className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                <Check size={12} className="text-emerald-400" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* The real problem */}
      <section className="py-16 border-y border-white/5 bg-zinc-950/30 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-6 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-red-400">Without a website</p>
              {[
                'Facebook limits who sees your posts',
                'TikTok can restrict your account anytime',
                'Shopee controls your store visibility',
                'No Google presence — invisible to searchers',
                'Referrals have no link to share',
              ].map(item => (
                <div key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span> {item}
                </div>
              ))}
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-6 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">With a Guma AI website</p>
              {[
                'Always findable on Google — no algorithm',
                'One link to share on all your platforms',
                'Customers see your hours, location, contact',
                'Looks professional — builds instant trust',
                'Free forever — no tech skills needed',
              ].map(item => (
                <div key={item} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How simple it is */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">3 questions. That&apos;s it.</h2>
            <p className="text-zinc-500 text-sm">We do the rest. No setup. No waiting. No confusion.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(({ number, icon, title, desc }) => (
              <div key={number} className="relative bg-zinc-900/40 border border-white/5 rounded-3xl p-7 text-center hover:border-indigo/20 transition">
                <div className="text-4xl mb-4">{icon}</div>
                <div className="text-[10px] font-black tracking-widest text-indigo-light/50 uppercase mb-2">Step {number}</div>
                <h3 className="text-base font-bold text-white mb-2 leading-snug">{title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/auth/signup/manual"
              className="btn-primary rounded-full py-3.5 px-8 text-sm font-black inline-flex items-center gap-2"
            >
              Start Now — It&apos;s Free <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Objection handling */}
      <section className="py-20 border-t border-white/5 bg-zinc-950/20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              We&apos;ve heard every reason not to.
            </h2>
            <p className="text-zinc-500 text-sm">Here&apos;s why none of them apply to Guma AI.</p>
          </div>

          <div className="space-y-4">
            {OBJECTIONS.map(({ fear, truth, icon }) => (
              <div key={fear} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 hover:border-white/8 transition">
                <div className="flex gap-4">
                  <div className="text-2xl flex-shrink-0 mt-0.5">{icon}</div>
                  <div>
                    <p className="text-sm font-bold text-zinc-400 mb-1.5 italic">{fear}</p>
                    <p className="text-sm text-white leading-relaxed font-medium">{truth}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-indigo/10 via-zinc-900/40 to-zinc-950/60 border border-indigo/20 rounded-[2rem] p-10 sm:p-16 text-center space-y-7 relative overflow-hidden">
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-indigo/10 blur-3xl pointer-events-none" />
            <p className="text-4xl">🏪</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Your customers are searching online.<br />
              <span className="text-zinc-400 font-medium text-2xl">Make sure they can find you.</span>
            </h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
              Keep your Facebook, TikTok, Shopee — and add a website that ties it all together.
              One link. Professional. Free. Forever yours.
            </p>
            <Link
              href="/auth/signup/manual"
              className="btn-primary py-4 px-12 rounded-full shadow-xl shadow-indigo/25 inline-flex text-base font-black items-center gap-2"
            >
              Build My Free Website <ArrowRight size={17} />
            </Link>
            <p className="text-xs text-zinc-600">No credit card · No technical skills · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#080910] py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <span>© {new Date().getFullYear()} Guma AI. All rights reserved.</span>
          <div className="flex gap-6 text-zinc-500">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/auth/signup" className="hover:text-white transition-colors">Search my business</Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
