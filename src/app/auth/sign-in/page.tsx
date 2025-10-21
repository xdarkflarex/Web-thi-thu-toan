"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) router.replace('/')
    }
    check()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) router.replace('/')
    })
    return () => sub.subscription.unsubscribe()
  }, [router])

  const signInWithEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.replace('/')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const signUpWithEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      // If email confirmations are enabled, user must verify email first
      const needsConfirmation = !!data.user && !data.session
      if (needsConfirmation) {
        // Stay on page; show a minimal confirmation hint
        setMode('signin')
        setError(null)
      } else {
        router.replace('/')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign up failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'signin' ? 'Sign in' : 'Create account'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={mode === 'signin' ? signInWithEmailPassword : signUpWithEmailPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <span className="inline-flex items-center gap-2"><Spinner /> {mode === 'signin' ? 'Signing in…' : 'Creating account…'}</span>
              ) : (
                (mode === 'signin' ? 'Sign in' : 'Create account')
              )}
            </Button>
            <button
              type="button"
              className="w-full text-sm text-muted-foreground underline underline-offset-2"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              disabled={loading}
            >
              {mode === 'signin' ? "Don't have an account? Create one" : 'Have an account? Sign in'}
            </button>
          </form>
          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

          <p className="text-xs text-muted-foreground mt-6">
            Teachers/Admins can sign in to manage content. Guests can take an exam at <code>/exam/guest</code> without signing in.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


