# AI Contract: types/index.ts

## Purpose
Central repository for shared domain types used across both server and client modules. Eliminates per-file type declarations that would otherwise diverge.

## Allowed Responsibilities
- Export `Reminder` — the shape of a row returned from the `reminders` table (id, reminder_type, due_date, sent).
- Export `MessageRole` — the union of valid values for `conversations.role`.
- Export `Message` — the shape of a row returned from the `conversations` table.

## Not Allowed
- Do not import Supabase, Next.js, or any runtime library here.
- Do not add request/response types for API endpoints (those belong in the route files).
- Do not add component prop types (those belong in each component file).
- Do not generate types from a database schema — keep these manually maintained until Supabase CLI codegen is adopted.

## Public Interfaces
- `export type Reminder = { id: string; reminder_type: string; due_date: string; sent: boolean }`
- `export type MessageRole = 'user' | 'assistant' | 'staff'`
- `export type Message = { id: string; role: MessageRole; content: string; created_at: string }`

## Required Patterns
- Pure TypeScript type declarations only — no runtime values.
- `Reminder` and `Message` fields must match the column names and types used in the Supabase queries that populate them.

## Tests Required
- No runtime tests needed. TypeScript compilation (`tsc --noEmit`) enforces correctness.

## Notes for AI Agents
- `Reminder` is consumed by `app/dashboard/users/[id]/RemindersPanel.tsx`.
- `Message` is consumed by `app/dashboard/users/[id]/ConversationPanel.tsx`.
- If the Supabase schema changes (e.g., a column is renamed), update this file and fix any downstream type errors.
