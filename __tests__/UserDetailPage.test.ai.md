---
name: UserDetailPage.test
description: Tests for app/dashboard/homeowners/[id]/page — server component rendering, auth redirect, notFound, homeowner details, sub-components
type: project
---

# AI Contract: __tests__/UserDetailPage.test.tsx

## Purpose
Integration tests for `app/dashboard/homeowners/[id]/page.tsx`. Verifies auth redirect, `notFound` call for missing homeowners, homeowner detail display, address/badge rendering, `first_name` fallback, and sub-component presence.

## Allowed Responsibilities
- Mock `@/lib/supabase/server` to control `getUser`, `users`, `conversations`, and `reminders` queries.
- Mock `next/navigation` to intercept `redirect` and `notFound`.
- Mock `next/link` to render anchor tags.
- Stub `ConversationPanel`, `MessageForm`, `RemindersPanel`, and `PhoneNumberEditor` child components.
- Assert on rendered text, addresses, badges, and stub presence.

## Not Allowed
- Do not test ConversationPanel, MessageForm, RemindersPanel, or PhoneNumberEditor internals — they are stubbed.
- Do not make real network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Redirects to `/login` when unauthenticated.
- Calls `notFound` when the homeowner does not exist.
- Renders the homeowner's full name (`${first_name} ${last_name}`) and phone number.
- Renders just the first name when `last_name` is null.
- Renders just the last name when `first_name` is null.
- Renders the full address when all location fields are present.
- Omits the address line when location fields are null.
- Shows the "Onboarding complete" badge when applicable.
- Does not show the "Onboarding complete" badge when false.
- Shows the "Opted out" badge when applicable.
- Shows the "Pending" badge when both `onboarding_complete` and `opted_out` are false.
- Falls back to "Homeowner" heading when both `first_name` and `last_name` are null.
- Renders ConversationPanel, MessageForm, RemindersPanel, and PhoneNumberEditor.
- Passes the homeowner's phone number to PhoneNumberEditor.
- Handles null conversations and reminders responses without crashing.
