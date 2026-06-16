'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Play, Clock } from 'lucide-react'

export function CrawlerFormClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const city = (formData.get('city') as string) || 'Austin'
    const state = (formData.get('state') as string) || 'TX'
    const industry = (formData.get('industry') as string) || 'Restaurants'
    const source = (formData.get('source') as string) || 'yellowpages'
    const limit = parseInt((formData.get('limit') as string) || '100')

    try {
      // Invoke the Supabase Edge Function named 'crawler'
      const { data, error: invokeError } = await supabase.functions.invoke('crawler', {
        body: {
          category: industry, // Map form field 'industry' to Edge Function 'category'
          city,
          state,
          // You can pass 'limit' and 'source' if your Edge Function is updated to use them
          // limit,
          // source,
        },
      })

      if (invokeError) {
        console.error('Edge Function invocation error:', invokeError)
        router.push(`/admin/crawler?error=${encodeURIComponent(invokeError.message)}`)
      } else if (data && data.error) {
        // Assuming the Edge Function returns { error: string } on application-level errors
        console.error('Edge Function returned error:', data.error)
        router.push(`/admin/crawler?error=${encodeURIComponent(data.error)}`)
      } else {
        router.push('/admin/crawler?success=1')
      }
    } catch (err: any) {
      console.error('Client-side fetch error:', err)
      router.push(`/admin/crawler?error=${encodeURIComponent(err.message || 'Unknown error')}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-warm-gray-500 mb-1">Source</label>
        <select name="source" className="input w-full text-sm" defaultValue="yellowpages">
          <option value="yellowpages">YellowPages (Playwright)</option>
          <option value="googleplaces">Google Places API</option>
          <option value="serper">Serper.dev (Google Maps)</option>
          <option value="apify">Apify (Cloud Actor)</option>
          <option value="brightdata">Bright Data (Dataset API)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-warm-gray-500 mb-1">City</label>
        <input name="city" placeholder="e.g. Austin" className="input w-full text-sm" required />
      </div>
      <div>
        <label className="block text-xs font-medium text-warm-gray-500 mb-1">State</label>
        <input name="state" placeholder="e.g. TX" className="input w-full text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-warm-gray-500 mb-1">Industry / Category</label>
        <input name="industry" placeholder="e.g. Restaurant, Plumber, Salon" className="input w-full text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-warm-gray-500 mb-1">Max results</label>
        <select name="limit" className="input w-full text-sm" defaultValue="100">
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="250">250</option>
          <option value="500">500</option>
        </select>
      </div>
      <button type="submit" className="btn-primary w-full text-sm flex items-center justify-center gap-2" disabled={isLoading}>
        {isLoading ? (
          <>
            <Clock className="w-4 h-4 animate-spin" />
            Triggering...
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Start Crawl
          </>
        )}
      </button>
    </form>
  )
}