'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Reminder = {
  id: string
  reminder_type: string
  due_date: string
  sent: boolean
}

const REMINDER_TYPES = [
  'hvac_filter',
  'hvac_service',
  'water_heater_flush',
  'roof_inspection',
  'gutter_cleaning',
  'plumbing_inspection',
  'electrical_inspection',
  'other',
]

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
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ reminderType: string; dueDate: string }>({ reminderType: '', dueDate: '' })
  const [adding, setAdding] = useState(false)
  const [newValues, setNewValues] = useState({ reminderType: 'hvac_filter', dueDate: '' })
  const [error, setError] = useState<string | null>(null)

  function refresh() {
    startTransition(() => router.refresh())
  }

  async function handleDelete(id: string) {
    setError(null)
    const res = await fetch(`/api/reminders/${id}`, { method: 'DELETE' })
    if (!res.ok) { setError('Failed to delete'); return }
    refresh()
  }

  async function handleSaveEdit(id: string) {
    setError(null)
    const res = await fetch(`/api/reminders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editValues),
    })
    if (!res.ok) { setError('Failed to save'); return }
    setEditingId(null)
    refresh()
  }

  async function handleAdd() {
    if (!newValues.dueDate) { setError('Due date is required'); return }
    setError(null)
    const res = await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reminderType: newValues.reminderType, dueDate: newValues.dueDate }),
    })
    if (!res.ok) { setError('Failed to add reminder'); return }
    setAdding(false)
    setNewValues({ reminderType: 'hvac_filter', dueDate: '' })
    refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-700">Scheduled Reminders</h2>
        <button
          onClick={() => setAdding(true)}
          className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors"
          disabled={isPending}
        >
          + Add
        </button>
      </div>

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      <div className="space-y-2">
        {reminders.map(r => (
          <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-3">
            {editingId === r.id ? (
              <div className="flex flex-col gap-2">
                <select
                  value={editValues.reminderType}
                  onChange={e => setEditValues(v => ({ ...v, reminderType: e.target.value }))}
                  className="border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  {REMINDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input
                  type="date"
                  value={editValues.dueDate}
                  onChange={e => setEditValues(v => ({ ...v, dueDate: e.target.value }))}
                  className="border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(r.id)}
                    disabled={isPending}
                    className="text-xs px-3 py-1 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{r.reminder_type}</p>
                  <p className="text-xs text-slate-500">{formatDate(r.due_date)}</p>
                  {r.sent && <span className="text-xs text-emerald-600">Sent</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(r.id)
                      setEditValues({ reminderType: r.reminder_type, dueDate: r.due_date })
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={isPending}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {reminders.length === 0 && !adding && (
          <p className="text-xs text-slate-400 py-4 text-center">No reminders scheduled</p>
        )}

        {adding && (
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
            <select
              value={newValues.reminderType}
              onChange={e => setNewValues(v => ({ ...v, reminderType: e.target.value }))}
              className="border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {REMINDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              type="date"
              value={newValues.dueDate}
              onChange={e => setNewValues(v => ({ ...v, dueDate: e.target.value }))}
              className="border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={isPending}
                className="text-xs px-3 py-1 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => { setAdding(false); setError(null) }}
                className="text-xs px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
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
