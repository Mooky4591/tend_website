'use client'

export default function DeleteDocButton({
  action,
  planName,
}: {
  action: () => Promise<void>
  planName: string
}) {
  return (
    <button
      type="button"
      onClick={async () => {
        if (!confirm(`Delete "${planName}" and all its chunks? This cannot be undone.`)) return
        await action()
      }}
      className="text-xs text-red-500 hover:text-red-700 transition-colors"
    >
      Delete
    </button>
  )
}
