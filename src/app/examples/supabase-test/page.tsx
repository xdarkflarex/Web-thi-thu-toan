"use client"
import { useEffect, useState } from 'react'

type ApiResponse = { ok: boolean; data?: unknown; error?: string }

export default function SupabaseTestPage() {
  const [result, setResult] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/supabase-test', { cache: 'no-store' })
        const text = await res.text()
        try {
          const json = JSON.parse(text) as ApiResponse
          setResult(json)
        } catch {
          setResult({ ok: false, error: `Non-JSON response (${res.status}): ${text.slice(0, 200)}...` })
        }
      } catch (e: any) {
        setResult({ ok: false, error: e?.message ?? 'Unknown error' })
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Supabase Connectivity Test</h1>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <pre className="text-sm bg-gray-100 p-4 rounded">
{JSON.stringify(result, null, 2)}
        </pre>
      )}
      <p className="text-sm text-gray-500">Endpoint: /api/supabase-test</p>
    </div>
  )
}


