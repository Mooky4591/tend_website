# AI Contract: __tests__/AdminReviewConversationRoute.test.ts

## Purpose
Unit tests for `app/api/admin/conversations/[userId]/review/route.ts`. Verifies that the POST
handler rejects unauthenticated requests (303 to /admin/login), sets `manually_reviewed = true`
on the most recent conversation row, and redirects to the conversation thread page with status 303.
