'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadForm() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [planName, setPlanName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // busy covers both the fetch round-trip and the subsequent router.refresh() transition
  const busy = isUploading || isPending

  async function handleUpload() {
    if (!file || !planName.trim()) {
      setStatus({ type: 'error', message: 'Plan name and PDF file are required.' })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'File must be under 10 MB.' })
      return
    }
    if (busy) return

    setStatus(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.set('plan_name', planName.trim())
      formData.set('file', file)

      const res = await fetch('/api/warranty-upload', { method: 'POST', body: formData })
      const json = await res.json()

      if (!res.ok) {
        setStatus({ type: 'error', message: json.error ?? 'Upload failed.' })
        return
      }

      setStatus({ type: 'success', message: `Uploaded ${json.chunksInserted} chunks for "${planName.trim()}".` })
      setPlanName('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      startTransition(() => router.refresh())
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Upload warranty document</h2>

      {status && (
        <div className={`mb-4 text-sm px-3 py-2 rounded-lg ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {status.message}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div>
          <label htmlFor="upload-plan-name" className="block text-xs font-medium text-slate-600 mb-1">Plan name</label>
          <input
            id="upload-plan-name"
            type="text"
            value={planName}
            onChange={e => setPlanName(e.target.value)}
            placeholder="e.g. Premium Home Warranty"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            disabled={busy}
          />
          <p className="text-xs text-slate-400 mt-1">
            Uploading with an existing plan name replaces that document.
          </p>
        </div>

        <div>
          <label htmlFor="upload-pdf-file" className="block text-xs font-medium text-slate-600 mb-1">PDF file (max 10 MB)</label>
          <input
            id="upload-pdf-file"
            ref={fileRef}
            type="file"
            accept="application/pdf"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            disabled={busy}
            className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={busy || !file || !planName.trim()}
          className="self-start px-4 py-2 bg-slate-900 text-white text-sm rounded-xl disabled:opacity-40 hover:bg-slate-700 transition-colors"
        >
          {busy ? 'Uploading…' : 'Upload'}
        </button>
      </div>
    </div>
  )
}
