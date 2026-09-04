'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, Wand2 } from 'lucide-react'

type AuthMode = 'login' | 'signup'
type SubMode = 'password' | 'magic-link' | 'forgot-password'

interface AuthFormProps {
  mode: AuthMode
}

const titles: Record<SubMode, (mode: AuthMode) => string> = {
  'password': (m) => m === 'login' ? 'Welcome back' : 'Create an account',
  'magic-link': (m) => m === 'login' ? 'Magic link sign in' : 'Magic link sign up',
  'forgot-password': () => 'Reset your password',
}

const descriptions: Record<SubMode, (mode: AuthMode) => string> = {
  'password': (m) => m === 'login' ? 'Enter your credentials to access your closet' : 'Enter your details to create your account',
  'magic-link': () => "We'll send a one-time sign-in link to your email",
  'forgot-password': () => "Enter your email and we'll send a reset link",
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [subMode, setSubMode] = useState<SubMode>('password')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const clearAlerts = () => { setError(null); setMessage(null) }
  const switchTo = (next: SubMode) => { clearAlerts(); setSubMode(next) }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearAlerts()
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${appUrl}/confirm` },
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/closet')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearAlerts()
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${appUrl}/confirm`,
          shouldCreateUser: mode === 'signup',
        },
      })
      if (error) throw error
      setMessage('Check your email for your magic sign-in link!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearAlerts()
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/confirm?next=/reset-password`,
      })
      if (error) throw error
      setMessage('Password reset link sent — check your email!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred'
      if (msg.toLowerCase().includes('security purposes') || msg.toLowerCase().includes('seconds')) {
        setError('Please wait at least 60 seconds before requesting another reset email.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const emailField = (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-10"
          required
          disabled={loading}
        />
      </div>
    </div>
  )

  const alerts = (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          key="error"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="text-sm text-red-500 bg-red-50 dark:bg-red-950/50 p-3 rounded-md"
        >
          {error}
        </motion.div>
      )}
      {message && (
        <motion.div
          key="message"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="text-sm text-green-600 bg-green-50 dark:bg-green-950/50 p-3 rounded-md"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {titles[subMode](mode)}
          </CardTitle>
          <CardDescription className="text-center">
            {descriptions[subMode](mode)}
          </CardDescription>
        </CardHeader>

        <AnimatePresence mode="wait">

          {/* ── Password form ── */}
          {subMode === 'password' && (
            <motion.form
              key="password"
              onSubmit={handlePasswordSubmit}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="space-y-4">
                {emailField}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {alerts}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === 'login' ? 'Sign In' : 'Sign Up'}
                </Button>
                <div className="flex w-full items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => switchTo('magic-link')}
                    className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    Use magic link
                  </button>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchTo('forgot-password')}
                      className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <p className="text-sm text-zinc-500 text-center">
                  {mode === 'login' ? (
                    <>Don&apos;t have an account?{' '}<a href="/signup" className="text-zinc-900 dark:text-zinc-100 hover:underline font-medium">Sign up</a></>
                  ) : (
                    <>Already have an account?{' '}<a href="/login" className="text-zinc-900 dark:text-zinc-100 hover:underline font-medium">Sign in</a></>
                  )}
                </p>
              </CardFooter>
            </motion.form>
          )}

          {/* ── Magic link form ── */}
          {subMode === 'magic-link' && (
            <motion.form
              key="magic-link"
              onSubmit={handleMagicLink}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="space-y-4">
                {emailField}
                {alerts}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send magic link
                </Button>
                <button
                  type="button"
                  onClick={() => switchTo('password')}
                  className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Use password instead
                </button>
                <p className="text-sm text-zinc-500 text-center">
                  {mode === 'login' ? (
                    <>Don&apos;t have an account?{' '}<a href="/signup" className="text-zinc-900 dark:text-zinc-100 hover:underline font-medium">Sign up</a></>
                  ) : (
                    <>Already have an account?{' '}<a href="/login" className="text-zinc-900 dark:text-zinc-100 hover:underline font-medium">Sign in</a></>
                  )}
                </p>
              </CardFooter>
            </motion.form>
          )}

          {/* ── Forgot password form ── */}
          {subMode === 'forgot-password' && (
            <motion.form
              key="forgot-password"
              onSubmit={handleForgotPassword}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="space-y-4">
                {emailField}
                {alerts}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send reset link
                </Button>
                <button
                  type="button"
                  onClick={() => switchTo('password')}
                  className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to sign in
                </button>
              </CardFooter>
            </motion.form>
          )}

        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
