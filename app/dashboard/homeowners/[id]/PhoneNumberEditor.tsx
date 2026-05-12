'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateHomeownerPhone } from '@/lib/api/client'

export default function PhoneNumberEditor({ userId, phoneNumber }: { userId: string; phoneNumber: string | null }) {
  const router = useRouter()
  const [value, setValue] = useState(phoneNumber ?? '')
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPending, startTransition] = useTransition()
  const busy = isSubmitting || isPending

  async function handleSave() {
    if (!value.trim()) {
      setError('Phone number is required')
      return
    }

    if (busy) return
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await updateHomeownerPhone(userId, value.trim())
      if (!res.ok) {
        const payload = await res.json().catch(() => ({})) as { error?: string }
        setError(payload.error ?? 'Failed to update phone number')
        return
      }
      setEditing(false)
      startTransition(() => router.refresh())
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {editing ? (
        <div className="space-y-2">
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            className="w-full border border-border/20 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/30"
            placeholder="+15551234567"
            disabled={busy}
          />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={busy} className="text-xs px-3 py-1 bg-navy text-white rounded-lg hover:bg-deep-slate transition-colors">Save</button>
            <button
              onClick={() => {
                setValue(phoneNumber ?? '')
                setEditing(false)
                setError(null)
              }}
              disabled={busy}
              className="text-xs px-3 py-1 border border-border/20 rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground/60 text-sm font-mono">{phoneNumber ?? 'No phone number'}</p>
          <button onClick={() => setEditing(true)} className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors">Edit</button>
        </div>
      )}
      {error && <p className="text-xs text-error mt-2">{error}</p>}
    </div>
  )
}
