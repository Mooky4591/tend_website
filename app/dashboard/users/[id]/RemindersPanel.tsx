'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Reminder } from '@/types'
import { REMINDER_TYPES } from '@/lib/constants'
import { createReminder, updateReminder, deleteReminder } from '@/lib/api/client'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function RemindersPanel({
  reminders,
  userId,
}: {
  reminders: Reminder[]
  userId: string
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ reminderType: string; dueDate: string }>({ reminderType: '', dueDate: '' })
  const [adding, setAdding] = useState(false)
  const [newValues, setNewValues] = useState({ reminderType: 'hvac_filter', dueDate: '' })
  const [error, setError] = useState<string | null>(null)

  // busy covers both the fetch round-trip and the subsequent router.refresh() transition
  const busy = isSubmitting || isPending

  function refresh() {
    startTransition(() => router.refresh())
  }

  async function handleDelete(id: string) {
    if (busy) return
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await deleteReminder(id)
      if (!res.ok) { setError('Failed to delete'); return }
      refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSaveEdit(id: string) {
    if (busy) return
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await updateReminder(id, editValues)
      if (!res.ok) { setError('Failed to save'); return }
      setEditingId(null)
      refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleAdd() {
    if (!newValues.dueDate) { setError('Due date is required'); return }
    if (busy) return
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await createReminder(userId, newValues.reminderType, newValues.dueDate)
      if (!res.ok) { setError('Failed to add reminder'); return }
      setAdding(false)
      setNewValues({ reminderType: 'hvac_filter', dueDate: '' })
      refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Scheduled Reminders</h2>
        <button
          onClick={() => setAdding(true)}
          className="text-xs px-3 py-1.5 bg-navy text-white rounded-lg hover:bg-deep-slate transition-colors"
          disabled={busy}
        >
          + Add
        </button>
      </div>

      {error && <p className="text-xs text-error mb-2">{error}</p>}

      <div className="space-y-2">
        {reminders.map(r => (
          <div key={r.id} className="bg-white border border-border/20 rounded-xl p-3">
            {editingId === r.id ? (
              <div className="flex flex-col gap-2">
                <select
                  value={editValues.reminderType}
                  onChange={e => setEditValues(v => ({ ...v, reminderType: e.target.value }))}
                  className="border border-border/20 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  {REMINDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input
                  type="date"
                  value={editValues.dueDate}
                  onChange={e => setEditValues(v => ({ ...v, dueDate: e.target.value }))}
                  className="border border-border/20 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(r.id)}
                    disabled={busy}
                    className="text-xs px-3 py-1 bg-navy text-white rounded-lg hover:bg-deep-slate transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    disabled={busy}
                    className="text-xs px-3 py-1 border border-border/20 rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.reminder_type}</p>
                  <p className="text-xs text-muted-foreground/60">{formatDate(r.due_date)}</p>
                  {r.sent && <span className="text-xs text-success">Sent</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(r.id)
                      setEditValues({ reminderType: r.reminder_type, dueDate: r.due_date })
                    }}
                    disabled={busy}
                    className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={busy}
                    className="text-xs text-error/80 hover:text-error transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {reminders.length === 0 && !adding && (
          <p className="text-xs text-muted-foreground/50 py-4 text-center">No reminders scheduled</p>
        )}

        {adding && (
          <div className="bg-white border border-border/20 rounded-xl p-3 flex flex-col gap-2">
            <select
              value={newValues.reminderType}
              onChange={e => setNewValues(v => ({ ...v, reminderType: e.target.value }))}
              className="border border-border/20 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              {REMINDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              type="date"
              value={newValues.dueDate}
              onChange={e => setNewValues(v => ({ ...v, dueDate: e.target.value }))}
              className="border border-border/20 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={busy}
                className="text-xs px-3 py-1 bg-navy text-white rounded-lg hover:bg-deep-slate transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => { setAdding(false); setError(null) }}
                disabled={busy}
                className="text-xs px-3 py-1 border border-border/20 rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
