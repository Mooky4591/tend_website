'use client'

import { useState } from 'react'

export default function DeleteDocButton({
  action,
  planName,
}: {
  action: () => Promise<void>
  planName: string
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div>
      {error && <p className="text-xs text-error mt-1">{error}</p>}
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          if (!confirm(`Delete "${planName}" and all its chunks? This cannot be undone.`)) return
          setBusy(true)
          setError(null)
          try {
            await action()
          } catch {
            setError('Failed to delete. Please try again.')
          } finally {
            setBusy(false)
          }
        }}
        className="text-xs text-error/80 hover:text-error transition-colors disabled:opacity-40"
      >
        {busy ? 'Deleting…' : 'Delete'}
      </button>
    </div>
  )
}
