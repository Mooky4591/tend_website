'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function MessageForm({ userId }: { userId: string }) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // busy covers both the fetch round-trip and the subsequent router.refresh() transition
  const busy = isSending || isPending

  async function handleSend() {
    const trimmed = message.trim()
    if (!trimmed || busy) return
    setError(null)
    setIsSending(true)

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: trimmed }),
      })

      if (!res.ok) {
        const { error: msg } = await res.json()
        setError(msg ?? 'Failed to send')
        return
      }

      setMessage('')
      startTransition(() => router.refresh())
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="border-t border-slate-200 p-4">
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <div className="flex gap-2">
        <textarea
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-300"
          rows={2}
          placeholder="Type a message to send via SMS…"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          disabled={busy}
        />
        <button
          onClick={handleSend}
          disabled={busy || !message.trim()}
          className="px-4 py-2 bg-slate-900 text-white text-sm rounded-xl disabled:opacity-40 hover:bg-slate-700 transition-colors self-end"
        >
          {busy ? 'Sending…' : 'Send'}
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-1">Sends via SMS and appears in the conversation thread.</p>
    </div>
  )
}
