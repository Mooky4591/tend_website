'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignOut() {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError('Sign out failed. Please try again.')
      setLoading(false)
      return
    }
    try {
      router.push('/login')
      router.refresh()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="text-sm text-muted-foreground/60 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Signing out…' : 'Sign out'}
      </button>
      {error && (
        <p role="alert" className="text-xs text-error">{error}</p>
      )}
    </div>
  )
}
