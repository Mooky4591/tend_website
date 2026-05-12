# AI Contract: app/dashboard/homeowners/[id]/PhoneNumberEditor.tsx

## Purpose
Client Component that allows staff to edit and save a homeowner phone number inline on the user detail page.

## Allowed Responsibilities
- Render current phone number and an Edit action.
- Toggle inline edit mode with Save/Cancel controls.
- Call `updateHomeownerPhone` from `@/lib/api/client`.
- Show API error messages and refresh the page on success.

## Not Allowed
- Do not call Supabase directly.
- Do not fetch homeowner data independently.
- Do not mutate other homeowner fields.

## Public Interfaces
- `export default function PhoneNumberEditor({ userId, phoneNumber }: { userId: string; phoneNumber: string | null }): JSX.Element`

## Required Patterns
- `'use client'` directive.
- Use `busy = isSubmitting || isPending` to disable actions during save/refresh.
- Use `startTransition(() => router.refresh())` after successful update.

## Tests Required
- Renders current phone and Edit button.
- Save calls API and refreshes on success.
- Cancel reverts to initial phone value.
- Displays API error on failure.
