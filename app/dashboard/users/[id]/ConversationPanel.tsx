'use client'

import { useEffect, useRef } from 'react'

type Message = {
  id: string
  role: 'user' | 'assistant' | 'staff'
  content: string
  created_at: string
}

function bubble(role: Message['role']) {
  if (role === 'user') return 'self-start bg-slate-100 text-slate-800'
  if (role === 'assistant') return 'self-end bg-emerald-600 text-white'
  return 'self-end bg-blue-600 text-white'
}

export default function ConversationPanel({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-slate-400 py-12">
        No messages yet
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
      {messages.map(m => (
        <div key={m.id} className={`flex flex-col max-w-[75%] ${m.role === 'user' ? 'self-start items-start' : 'self-end items-end'}`}>
          {m.role === 'staff' && (
            <span className="text-xs text-blue-500 mb-0.5">Staff</span>
          )}
          <div className={`rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${bubble(m.role)}`}>
            {m.content}
          </div>
          <span className="text-xs text-slate-400 mt-0.5">
            {new Date(m.created_at).toLocaleString()}
          </span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
