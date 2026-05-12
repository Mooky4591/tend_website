# AI Contract: app/dashboard/homeowners/[id]/MessageForm.tsx

## Purpose
Client Component (`MessageForm`) that lets dashboard staff send an SMS to a homeowner by posting to `/api/send-message`. Uses `useTransition` to trigger a `router.refresh()` after the message is sent so the conversation panel updates.

## Allowed Responsibilities
- Collect a message string from a `<textarea>`.
- Call `sendMessage` from `@/lib/api/client` on button click or Enter keypress (without Shift).
- Display an error from the API response on failure.
- Clear the textarea and call `router.refresh()` in a transition on success.
- Show a "Sending…" / "Send" label based on `busy` state.

## Not Allowed
- Do not call Supabase directly; all persistence and SMS delivery is owned by the API route.
- Do not call `fetch` directly; use `sendMessage` from `@/lib/api/client`.
- Do not allow sending an empty or whitespace-only message (`trimmed` check).
- Do not send while `busy === true`; enforce via `disabled` on the button and textarea rather than a handler guard.
- Do not handle opt-out status here; the API route and RLS handle that.

## Public Interfaces
- `export default function MessageForm({ userId }: { userId: string }): JSX.Element`

## Required Patterns
- `'use client'` directive required.
- `busy = isSending || isPending` pattern (same as `UploadForm`).
- Enter key without Shift submits; Shift+Enter inserts a newline.
- `startTransition(() => router.refresh())` after successful send.
- Button is `disabled` when `busy || !message.trim()`.

## Tests Required
- Renders a textarea and a Send button.
- Button is disabled when message is empty.
- Button is disabled while sending.
- Enter key (without Shift) triggers `handleSend`.
- Shift+Enter does not trigger `handleSend`.
- Displays API error message on failure.
- Clears textarea after successful send.

## Notes for AI Agents
- `userId` is the homeowner's row ID in the `users` table (not the Supabase auth UUID). Pass it verbatim in the POST body.
- The conversation panel (`ConversationPanel`) is refreshed via `router.refresh()` after a successful send; there is no WebSocket or polling.
