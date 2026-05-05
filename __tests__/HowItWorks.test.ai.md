---
name: HowItWorks.test
description: Tests for components/HowItWorks — three-step section, step numbers, anchor ID, specific step content
type: project
---

# AI Contract: __tests__/HowItWorks.test.tsx

## Purpose
Unit tests for `components/HowItWorks.tsx`. Verifies section heading ("three steps"), all three step headings, step numbers (01/02/03), `#how-it-works` anchor, section label tag, and specific content for each step.

## Allowed Responsibilities
- Render `HowItWorks` and assert on headings, text content, and anchor IDs.

## Not Allowed
- Do not make network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders the section heading ("three steps").
- Renders all three step headings.
- Renders step numbers 01, 02, 03.
- Section has the `how-it-works` id.
- Renders the "How it works" section label tag.
- Mentions webhook and CSV import in step 1.
- Mentions ATTOM property data in step 2.
- Mentions maintenance reminders and warranty in step 3.
