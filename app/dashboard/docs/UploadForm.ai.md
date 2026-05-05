# AI Contract: app/dashboard/docs/UploadForm.tsx

## Purpose
Client Component (`UploadForm`) that collects a plan name and PDF file, posts them to `/api/warranty-upload` via `fetch`, and triggers a router refresh upon success. Manages upload progress, file input reset, and status feedback.

## Allowed Responsibilities
- Collect `planName` (text) and `file` (PDF, max 10 MB) from the user.
- Client-side validate: both fields required, file size ≤ 10 MB.
- Call `uploadWarrantyDoc` from `@/lib/api/client` to upload the file.
- Display success message with `chunksInserted` count from the API response.
- Display error message from the API response or a generic fallback.
- Reset `planName`, `file`, and the file input ref (`fileRef.current.value = ''`) after success.
- Call `router.refresh()` in a `useTransition` to re-render the document list.

## Not Allowed
- Do not call Supabase directly; data mutation is owned by the API route.
- Do not call `fetch` directly; use `uploadWarrantyDoc` from `@/lib/api/client`.
- Do not accept non-PDF files (the `<input>` has `accept="application/pdf"`).
- Do not proceed with upload if `busy` is true (debounce guard).
- Do not render outside this form card; do not own the document list.

## Public Interfaces
- `export default function UploadForm(): JSX.Element`

## Required Patterns
- `'use client'` directive required.
- `busy = isUploading || isPending` combines the fetch round-trip and the router refresh transition.
- `startTransition(() => router.refresh())` must be called after a successful upload.
- File input must be reset via `fileRef.current.value = ''` on success.
- Button is `disabled` when `busy || !file || !planName.trim()`.

## Tests Required
- Displays error when submitted with no plan name.
- Displays error when file exceeds 10 MB (client-side check).
- Shows "Uploading…" on the button while busy.
- Displays success message with `chunksInserted` count from API response.
- Displays API error message when response is not ok.
- Resets plan name and file after successful upload.
- Button is disabled when file or plan name is missing.

## Notes for AI Agents
- The 10 MB check is duplicated client-side here and server-side in `app/api/warranty-upload/route.ts`. Both must remain consistent.
- The `plan_name` form field key must match exactly what the API route expects (`formData.get('plan_name')`).
