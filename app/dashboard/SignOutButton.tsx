'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError('Sign out failed. Please try again.')
      return
    }
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSignOut}
        className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        Sign out
      </button>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
