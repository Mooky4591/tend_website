---
name: Features.test
description: Tests for components/Features — section heading, anchor ID, six feature cards with specific content assertions
type: project
---

# AI Contract: __tests__/Features.test.tsx

## Purpose
Unit tests for `components/Features.tsx`. Verifies section heading (h2), `#features` anchor, all six feature card titles rendered (h3), and specific body-copy assertions for each feature card.

## Allowed Responsibilities
- Render `Features` and assert on headings, text content, and anchor IDs.

## Not Allowed
- Do not make network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders the section heading.
- Section has the `features` id.
- Renders all six feature card titles.
- Renders six h3 headings (one per feature card).
- Conversational Onboarding card mentions "plain English".
- Proactive Maintenance Reminders card mentions "30+ reminder types" and "direct link to purchase".
- Instant Warranty Answers card mentions "semantic search".
- SMS Compliance card mentions "STOP" keyword.
- Built for Multiple Companies card mentions "dedicated phone number".
- Billing card mentions "Monthly snapshots" and "per warranty company".
