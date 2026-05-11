# AI Contract: app/dashboard/users/[id]/ConversationPanel.tsx

## Purpose
Client Component (`ConversationPanel`) that renders a scrollable list of conversation messages for a single homeowner. Automatically scrolls to the bottom when `messages.length` changes and applies role-based bubble styling.

## Allowed Responsibilities
- Render each `Message` in a chat-bubble layout, differentiated by `role` (`'user'`, `'assistant'`, `'staff'`).
- Auto-scroll to the latest message via a `bottomRef` div and `useEffect` on `messages.length`.
- Show a "No messages yet" empty state when the array is empty.
- Display a "Staff" label above staff-originated bubbles.
- Format `created_at` timestamps with `toLocaleString()`.

## Not Allowed
- Do not fetch messages; the parent page (`UserDetailPage`) passes them as props.
- Do not send messages; that belongs in `MessageForm`.
- Do not poll for new messages; refresh is triggered by `router.refresh()` in `MessageForm`.
- Do not mutate state based on incoming messages beyond the scroll effect.

## Public Interfaces
- `export default function ConversationPanel({ messages }: { messages: Message[] }): JSX.Element`
- `Message` is imported from `@/types` — do not re-declare it locally.

## Required Patterns
- `'use client'` directive required.
- `bubble(role)` helper maps role to Tailwind classes: user → `bg-sand text-deep-slate`, assistant → `bg-brand-600 text-white`, staff → `bg-deep-slate text-white`.
- `useEffect` dependency is `[messages.length]`, not `[messages]`.
- `bottomRef.current?.scrollIntoView({ behavior: 'auto' })` (not `'smooth'`).
- Staff label uses `text-brand-500`; timestamps use `text-muted-foreground/40`.

## Tests Required
- Renders "No messages yet" when `messages` is empty.
- Renders a bubble for each message in order.
- User messages align to the start (`self-start`); assistant and staff align to the end (`self-end`).
- "Staff" label is shown only for messages with `role === 'staff'`.
- Timestamps are rendered for each message.

## Notes for AI Agents
- Message data is fetched in `app/dashboard/users/[id]/page.tsx` and passed down. Do not add a data-fetch hook here.
- The three role values (`user`, `assistant`, `staff`) are the only valid values; do not add new roles without updating the `bubble` function.
