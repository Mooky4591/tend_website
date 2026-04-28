'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    try {
      await supabase.auth.resetPasswordForEmail(email, 
        {
       redirectTo: 'https://trytendr.org/auth/confirm?next=/reset-password'
       }
      )
    } catch {
      // Swallow errors — always show the same success message so we
      // don't reveal whether an email address is registered.
    } finally {
      // Clear any lingering session so a background token refresh can't
      // cause the middleware to redirect the success screen to /dashboard.
      await supabase.auth.signOut()
    }

    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <span className="text-2xl font-bold text-white tracking-tight">Tendr</span>
          <div className="mt-8 bg-slate-900 rounded-2xl p-8 border border-slate-800">
            <p className="text-slate-300 text-sm">
              If that email is registered, you&apos;ll receive a password reset link shortly.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block text-sm text-slate-400 hover:text-white transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-white tracking-tight">Tendr</span>
          <p className="mt-2 text-slate-400 text-sm">Reset your password</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 rounded-2xl p-8 border border-slate-800 space-y-5"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="you@company.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
