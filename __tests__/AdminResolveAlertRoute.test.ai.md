# AI Contract: __tests__/AdminResolveAlertRoute.test.ts

## Purpose
Unit tests for `app/api/admin/alerts/[id]/resolve/route.ts`. Verifies that the POST handler
rejects unauthenticated requests (303 to /admin/login), sets `resolved = true` on the correct
system_alerts row, and redirects to /admin/alerts with status 303 on success.
