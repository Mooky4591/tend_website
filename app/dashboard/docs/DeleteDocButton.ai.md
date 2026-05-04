# AI Contract: app/dashboard/docs/DeleteDocButton.tsx

## Purpose
Client Component (`DeleteDocButton`) that renders a delete button for a single warranty plan document. Invokes an injected `action` callback (a bound server action) after a browser `confirm` dialog, and manages `busy`/`error` state locally.

## Allowed Responsibilities
- Render a delete button labeled "Delete" (or "Deleting…" when busy).
- Show a `confirm` dialog before invoking the `action` prop.
- Track `busy` and `error` state; display an inline error message on failure.
- Call `action()` and handle promise rejection with a generic error message.

## Not Allowed
- Do not call Supabase or fetch any API directly; all data mutation is delegated to the `action` prop.
- Do not hard-code the plan name in the confirmation message; always use the `planName` prop.
- Do not perform navigation or page refresh; the caller (parent page) owns the revalidation.

## Public Interfaces
- `export default function DeleteDocButton({ action, planName }: { action: () => Promise<void>; planName: string }): JSX.Element`

## Required Patterns
- `'use client'` directive required.
- Confirmation dialog text must include the `planName` prop.
- Button must be `disabled` when `busy === true`.
- `setBusy(false)` must occur in a `finally` block to avoid a stuck loading state.

## Tests Required
- Renders a button with text "Delete" initially.
- Clicking the button shows a confirm dialog before calling `action`.
- Cancelling the confirm dialog does not call `action`.
- Displays "Deleting…" while `action` is in progress.
- Shows an error message when `action` rejects.
- Error message is cleared on a subsequent attempt.

## Notes for AI Agents
- The `action` prop is always a bound server action from `app/dashboard/docs/page.tsx` (e.g., `deleteDoc.bind(null, planName)`). This component has no knowledge of Supabase or the API.
- Page revalidation after successful deletion is triggered by `revalidatePath` inside the server action, not by this component.
