---
name: UploadForm.test
description: Tests for app/dashboard/docs/UploadForm — both-fields-required guard, FormData fetch call, success/error display, loading state, double-click guard
type: project
---

# AI Contract: __tests__/UploadForm.test.tsx

## Purpose
Unit tests for `app/dashboard/docs/UploadForm.tsx`. Verifies the Upload button stays disabled until both plan name and file are provided, correct FormData fetch call, success message with chunk count, error message display, loading state ("Uploading…"), and in-flight double-click guard.

## Allowed Responsibilities
- Stub `global.fetch` to control upload outcomes.
- Mock `next/navigation` for `useRouter`.
- Mock `react.useTransition` to make transitions synchronous.
- Assert on button state, fetch arguments, FormData contents, and rendered messages.

## Not Allowed
- Do not make real network requests.
- Do not mock the component under test.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders plan name input, file picker, and a disabled Upload button.
- Upload button stays disabled until both plan name and file are provided.
- Calls the API with `plan_name` and `file` in FormData on click.
- Shows success message with chunk count and clears inputs after upload.
- Shows error message when the API returns an error.
- Disables the button and shows "Uploading…" for the full fetch round-trip.
- Ignores a second click while an upload is already in flight.
