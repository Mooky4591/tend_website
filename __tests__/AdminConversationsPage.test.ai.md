# AI Contract: __tests__/AdminConversationsPage.test.tsx

## Purpose
Unit tests for `app/admin/conversations/page.tsx`. Verifies that the page shows an empty
state when no recent conversations exist, renders one row per unique user, truncates long
AI quality reasons at 100 characters, and passes all deduplicated user IDs to the chunked
users lookup (not the raw conversation rows, which may repeat the same user_id).
