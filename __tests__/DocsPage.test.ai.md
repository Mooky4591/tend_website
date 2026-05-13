---
name: DocsPage.test
description: Tests for app/dashboard/docs/page — server component rendering, auth redirect, document list, empty state, sort order
type: project
---

# AI Contract: __tests__/DocsPage.test.tsx

## Purpose
Integration tests for `app/dashboard/docs/page.tsx`. Verifies auth redirect, document list rendering, empty state, chunk count display, sort order (most-recent first), UploadForm presence, and Delete buttons.

## Allowed Responsibilities
- Mock `@/lib/supabase/server` to control `getUser`, `rpc('warranty_doc_summaries')` outcomes, and `warranty_documents` delete outcomes.
- Mock `@/lib/auth` to control `getTenantId`.
- Mock `next/navigation` to intercept `redirect`.
- Mock `next/cache` for `revalidatePath`.
- Stub `UploadForm` child component.
- Stub `DeleteDocButton` to capture the `action` prop so `deleteDoc` can be invoked directly.
- Assert on rendered plan names, chunk counts, sort order, button presence, RPC error throwing, and `deleteDoc` error/success behavior.

## Not Allowed
- Do not test UploadForm or DeleteDocButton internals — they are stubbed.
- Do not make real network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Redirects to `/login` when unauthenticated.
- Shows empty state when there are no documents.
- Renders each document with its plan name.
- Displays chunk count for each document.
- Renders documents sorted most-recent first.
- Renders the UploadForm.
- Renders a Delete button for each document.
- Handles null data response without crashing.
- Throws when the RPC query returns an error.
- `deleteDoc` throws "Unauthorized" when user is not authenticated.
- `deleteDoc` throws "No tenant" when `getTenantId` returns null.
- `deleteDoc` throws the DB error when the delete query fails.
- `deleteDoc` calls `revalidatePath('/dashboard/docs')` on successful delete.
