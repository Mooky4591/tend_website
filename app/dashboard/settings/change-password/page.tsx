'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    if (!userEmail) {
      setError('Unable to verify your account. Please sign in again.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      })

      if (signInError) {
        setError('Current password is incorrect.')
        setLoading(false)
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
      try {
        router.push('/dashboard')
        router.refresh()
      } catch {
        // loading already reset above
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-sm">
        <h1 className="text-xl font-semibold text-foreground mb-6">Change password</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div role="alert" className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 text-sm text-error/80">
              {error}
            </div>
          )}

          {success && (
            <div role="status" className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
              Password updated successfully. Redirecting…
            </div>
          )}

          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-foreground/70 mb-1.5">
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full border border-border/40 rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-foreground/70 mb-1.5">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full border border-border/40 rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground/70 mb-1.5">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full border border-border/40 rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-4 pt-1">
            <button
              type="submit"
              disabled={loading || success || userEmail === null}
              className="bg-brand-600 hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
