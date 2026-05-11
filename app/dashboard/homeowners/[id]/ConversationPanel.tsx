'use client'

import { useEffect, useRef } from 'react'
import type { Message } from '@/types'

function bubble(role: Message['role']) {
  if (role === 'user') return 'self-start bg-sand text-deep-slate'
  if (role === 'assistant') return 'self-end bg-brand-600 text-white'
  return 'self-end bg-deep-slate text-white'
}

export default function ConversationPanel({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground/40 py-12">
        No messages yet
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
      {messages.map(m => (
        <div key={m.id} className={`flex flex-col max-w-[75%] ${m.role === 'user' ? 'self-start items-start' : 'self-end items-end'}`}>
          {m.role === 'staff' && (
            <span className="text-xs text-brand-500 mb-0.5">Staff</span>
          )}
          <div className={`rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${bubble(m.role)}`}>
            {m.content}
          </div>
          <span className="text-xs text-muted-foreground/40 mt-0.5">
            {new Date(m.created_at).toLocaleString()}
          </span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
