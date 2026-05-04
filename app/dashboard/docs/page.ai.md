# AI Contract: app/dashboard/docs/page.tsx

## Purpose
Server Component page (`DocsPage`) that lists uploaded warranty plan documents (grouped by `plan_name`) and provides the `deleteDoc` server action consumed by `DeleteDocButton`. Also renders the `UploadForm` client component.

## Allowed Responsibilities
- Authenticate the user and redirect to `/login` if unauthenticated.
- Query `warranty_documents` for `plan_name`, chunk count, and latest `created_at`, then sort descending by upload date.
- Define `deleteDoc` as a `'use server'` action that re-authenticates, resolves tenant, deletes, and calls `revalidatePath('/dashboard/docs')`.
- Render the document list with `DeleteDocButton` (bound action) and the `UploadForm` side by side.

## Not Allowed
- Do not render document content or embeddings.
- Do not implement upload logic here; that belongs in `UploadForm` and `app/api/warranty-upload/route.ts`.
- Do not accept URL params or form data directly on this page.

## Public Interfaces
- `export default async function DocsPage(): Promise<JSX.Element>` — Next.js page export.
- `async function deleteDoc(planName: string): Promise<void>` — `'use server'` action, not exported directly but passed via `.bind`.
- `function formatDate(dateStr: string): string` — local helper.
- `type DocRow = { plan_name: string; chunk_count: number; uploaded_at: string }` — local type cast.

## Required Patterns
- `deleteDoc` must include its own auth + tenant check; never trust the page-level auth context inside a server action.
- `revalidatePath('/dashboard/docs')` must be called after successful deletion.
- Documents sorted by `uploaded_at` descending (`b.uploaded_at.localeCompare(a.uploaded_at)`).
- `DeleteDocButton` receives `action={deleteDoc.bind(null, d.plan_name)}`.

## Tests Required
- Unauthenticated user is redirected to `/login`.
- Document list renders `plan_name`, chunk count, and formatted upload date.
- Empty state renders when no documents are uploaded.
- `deleteDoc` throws `'Unauthorized'` when called without a valid session.
- `deleteDoc` throws `'No tenant'` when the user has no `tenant_users` row.
- `deleteDoc` calls `revalidatePath` after successful deletion.

## Notes for AI Agents
- The Supabase query uses a Postgres aggregate alias (`chunk_count:count()`, `uploaded_at:created_at.max()`) which requires an `as unknown as DocRow[]` cast; do not remove the cast.
- Deletion via the DELETE API route (`app/api/warranty-docs/[planName]/route.ts`) is the client-side alternative path. Keep both consistent.
