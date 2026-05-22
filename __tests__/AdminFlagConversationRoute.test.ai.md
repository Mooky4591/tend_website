# AI Contract: __tests__/AdminFlagConversationRoute.test.ts

## Purpose
Unit tests for `app/api/admin/conversations/[userId]/flag/route.ts`. Verifies that the POST
handler rejects unauthenticated requests (303 to /admin/login), correctly sets
`manually_flagged = true` with a reason when flagging, sets `manually_flagged = false` and
`reason = null` when unflaging, and redirects to the conversation thread page with status 303.
