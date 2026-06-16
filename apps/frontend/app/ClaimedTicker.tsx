'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { CheckCircle2 } from 'lucide-react'

// Define a type for the data we expect from the 'businesses' table
type BusinessRow = {
  id: string; // Assuming 'id' is a UUID from Supabase
  name: string;
}

export default function ClaimedTicker() {
  const [claimedNames, setClaimedNames] = useState<BusinessRow[]>([]) // Store full objects to use ID as key
  
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  useEffect(() => {
    const fetchClaimedBusinesses = async () => {
      const { data, error } = await supabase
        .from('websites')
        .select('id, status, generated_at, businesses (id, name)')
        .in('status', ['claimed', 'published'])
        .order('generated_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching claimed businesses:', error.message)
      } else if (data) {
        const businesses = (data as any[])
          .map((w) => w.businesses)
          .filter((b): b is BusinessRow => b !== null && typeof b.name === 'string')
        setClaimedNames(businesses)
      }
    }

    fetchClaimedBusinesses()
  }, [supabase]) // `supabase` client is stable, so this effect runs once on mount.

  if (claimedNames.length === 0) return null

  return (
    <div className="bg-zinc-950/45 backdrop-blur border-y border-white/5 py-3.5 overflow-hidden select-none" aria-hidden="true">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer">
        {/* Doubling the list for a seamless loop */}
        {[...claimedNames, ...claimedNames].map((business, i) => (
          <div key={`${business.id}-${i}`} className="flex items-center gap-3 px-10 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>{business.name} <span className="text-zinc-600 font-normal ml-1">just claimed</span></span>
          </div>
        ))}
      </div>
    </div>
  )
}