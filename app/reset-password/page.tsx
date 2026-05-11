'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        await supabase.auth.signOut()
        try {
          router.push('/login')
          router.refresh()
        } catch {
          setLoading(false)
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-white tracking-tight">Tendr</span>
          <p className="mt-2 text-white/50 text-sm">Set your new password</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-deep-slate rounded-2xl p-8 border border-deep-slate space-y-5"
        >
          {error && (
            <div role="alert" className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 text-sm text-error/80">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-navy border border-deep-slate/50 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="text-white/50 hover:text-white transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
