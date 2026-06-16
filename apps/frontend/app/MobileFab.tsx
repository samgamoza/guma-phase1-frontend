'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Search, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function MobileFab() {
  const [isVisible, setIsVisible] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [hasNotification, setHasNotification] = useState(false)

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 480)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('realtime-leads')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'businesses'
      }, () => {
        setHasNotification(true)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 md:hidden z-50">
      {/* Expandable search panel */}
      {isSearchOpen && (
        <div className="absolute bottom-16 right-0 w-72 bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/60 animate-fade-in">
          <p className="text-xs text-zinc-400 font-semibold mb-3">Search your business name</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!query.trim()) return
              window.location.href = `/auth/signup?q=${encodeURIComponent(query)}`
            }}
            className="flex gap-2"
          >
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. Santos Dental Clinic"
              className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo/50"
              autoFocus
            />
            <button type="submit" className="bg-indigo text-white rounded-xl px-3 py-2 flex items-center">
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => { setIsSearchOpen(!isSearchOpen); setHasNotification(false) }}
        className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 border-2 border-zinc-900 active:scale-90 ${
          isSearchOpen ? 'bg-zinc-800 text-white' : 'bg-indigo text-white shadow-indigo/40'
        }`}
        aria-label={isSearchOpen ? 'Close search' : 'Find my business'}
      >
        <div className="relative w-6 h-6 flex items-center justify-center">
          <Search
            size={22}
            strokeWidth={2.5}
            className={`absolute transition-all duration-300 ${
              isSearchOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100 delay-100'
            }`}
          />
          <X
            size={22}
            strokeWidth={2.5}
            className={`absolute transition-all duration-300 ${
              isSearchOpen ? 'opacity-100 rotate-0 scale-100 delay-100' : 'opacity-0 -rotate-90 scale-50'
            }`}
          />
        </div>

        {/* Ping indicator */}
        {hasNotification && !isSearchOpen && (
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-zinc-900" />
        )}
      </button>
    </div>
  )
}