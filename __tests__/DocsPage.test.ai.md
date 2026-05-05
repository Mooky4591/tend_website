---
name: DocsPage.test
description: Tests for app/dashboard/docs/page — server component rendering, auth redirect, document list, empty state, sort order
type: project
---

# AI Contract: __tests__/DocsPage.test.tsx

## Purpose
Integration tests for `app/dashboard/docs/page.tsx`. Verifies auth redirect, document list rendering, empty state, chunk count display, sort order (most-recent first), UploadForm presence, and Delete buttons.

## Allowed Responsibilities
- Mock `@/lib/supabase/server` to control `getUser` and `warranty_docs` query outcomes.
- Mock `next/navigation` to intercept `redirect`.
- Mock `next/cache` for `revalidatePath`.
- Stub `UploadForm` and `DeleteDocButton` child components.
- Assert on rendered plan names, chunk counts, sort order, and button presence.

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
