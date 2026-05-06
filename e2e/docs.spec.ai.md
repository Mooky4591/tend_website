---
name: docs.spec
description: E2E tests for /dashboard/docs — page structure, upload form validation, mocked upload success/failure, and delete dialog interaction
type: project
---

# AI Contract: e2e/docs.spec.ts

## Purpose
End-to-end tests for the warranty documents page. Upload tests mock POST /api/warranty-upload to avoid real OpenAI API calls. Delete tests verify the browser confirm dialog appears without actually deleting data.

## Allowed Responsibilities
- Use storageState: 'e2e/.auth/user.json' for all tests.
- Assert "Warranty Documents" heading, "Uploaded documents" section, and UploadForm elements are present.
- Assert Upload button is disabled when plan name or file is missing.
- Mock POST /api/warranty-upload to test success (chunk count message) and error states.
- Assert clicking Delete on an existing doc triggers a browser confirm dialog.
- Handle the empty-state case (no docs uploaded yet) gracefully.

## Not Allowed
- Do not make real calls to POST /api/warranty-upload — always mock this route.
- Do not require specific doc data in the database — handle both empty and populated states.
- Do not test the server-side PDF parsing or embedding logic (covered by WarrantyUpload.test.ts and warrantyDocsService.test.ts).

## Public Interfaces
- No exports — test file only.

## Tests Required
- "Warranty Documents" h1 visible.
- "Uploaded documents" and "Upload warranty document" sections visible.
- Upload form has plan name input, PDF file input, Upload button.
- Upload button disabled with no file or plan name.
- Uploading file without plan name keeps button disabled.
- Mocked upload success shows chunk count message.
- Mocked upload failure shows error message.
- Clicking Delete on existing doc triggers confirm dialog containing "cannot be undone".
- Empty state shows "No documents uploaded yet" when no docs present.
