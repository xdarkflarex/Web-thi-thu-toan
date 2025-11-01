"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { LanguageSwitcher } from '@/components/language-switcher'

export default function SignInPage() {
  const { t } = useTranslation(['common', 'auth']);
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
      const msg = err instanceof Error ? err.message : t('signInFailed', { ns: 'auth' })
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
      const msg = err instanceof Error ? err.message : t('signUpFailed', { ns: 'auth' })
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <div className="flex justify-end mb-4">
        <LanguageSwitcher />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'signin' ? t('signIn', { ns: 'auth' }) : t('signUp', { ns: 'auth' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={mode === 'signin' ? signInWithEmailPassword : signUpWithEmailPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email', { ns: 'auth' })}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder', { ns: 'auth' })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password', { ns: 'auth' })}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder', { ns: 'auth' })}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <span className="inline-flex items-center gap-2"><Spinner /> {mode === 'signin' ? t('signingIn', { ns: 'auth' }) : t('creatingAccount', { ns: 'auth' })}</span>
              ) : (
                (mode === 'signin' ? t('signIn', { ns: 'auth' }) : t('signUp', { ns: 'auth' }))
              )}
            </Button>
            <button
              type="button"
              className="w-full text-sm text-muted-foreground underline underline-offset-2"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              disabled={loading}
            >
              {mode === 'signin' ? t('dontHaveAccount', { ns: 'auth' }) : t('haveAccount', { ns: 'auth' })}
            </button>
          </form>
          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

          <p className="text-xs text-muted-foreground mt-6">
            {t('description', { ns: 'auth' })}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


