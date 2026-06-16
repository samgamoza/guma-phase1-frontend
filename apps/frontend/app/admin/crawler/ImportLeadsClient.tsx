'use client'

import { useState } from 'react'
import { FileUp, Loader2, Database, Terminal } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ImportLeadsClient() {
  const [view, setView] = useState<'json' | 'csv'>('json')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleImport = async () => {
    setLoading(true)
    try {
      let leads = []
      if (view === 'json') {
        leads = JSON.parse(input)
      } else {
        // Basic CSV parser (Note: Does not handle escaped commas in quotes)
        const rows = input.split('\n').filter(r => r.trim())
        const headers = rows[0].split(',').map(h => h.trim())
        leads = rows.slice(1).map(row => {
          const values = row.split(',')
          const obj: any = {}
          headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim())
          return obj
        })
      }

      const res = await fetch('/api/admin/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads })
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Import failed')

      router.push(`/admin/crawler?success=Imported ${result.count} test leads.`)
      setInput('')
    } catch (err: any) {
      alert('Import Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['json', 'csv'].map((t) => (
          <button
            key={t}
            onClick={() => setView(t as any)}
            className={`px-3 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider transition-colors ${
              view === t ? 'bg-indigo text-white' : 'bg-warm-gray-100 text-warm-gray-500'
            }`}
          >
            {t === 'json' ? <Terminal className="w-3 h-3 inline mr-1" /> : <Database className="w-3 h-3 inline mr-1" />}
            {t}
          </button>
        ))}
      </div>

      <div className="relative">
        <textarea
          className="input h-48 text-[10px] font-mono leading-relaxed bg-warm-gray-50/50"
          placeholder={view === 'json' ? '[{"name": "Mario Pizza", "city": "Chicago", "category": "restaurant"}]' : "name,city,category,email\nMario Pizza,Chicago,restaurant,mario@example.com"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <button
        onClick={handleImport}
        disabled={loading || !input}
        className="btn-primary w-full text-xs flex justify-center items-center gap-2"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileUp className="w-3 h-3" />}
        {loading ? 'Processing...' : `Import ${view.toUpperCase()} Leads`}
      </button>
      
      <p className="text-[10px] text-warm-gray-400 text-center italic">
        Businesses will be added to the 'businesses' table with source 'manual-import'.
      </p>
    </div>
  )
}