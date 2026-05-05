---
name: ForHomeowners.test
description: Tests for components/ForHomeowners — section heading, five benefit titles, example conversation content
type: project
---

# AI Contract: __tests__/ForHomeowners.test.tsx

## Purpose
Unit tests for `components/ForHomeowners.tsx`. Verifies section heading text, all five benefit titles, specific body copy about purchasing parts and no-download requirement, example conversation section label, warranty question, and filter question content.

## Allowed Responsibilities
- Render `ForHomeowners` and assert on headings, text content.

## Not Allowed
- Do not make network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders the section heading.
- Heading mentions "home assistant experience".
- Renders all five benefit titles.
- Purchase benefit mentions "purchase the right part immediately".
- Mentions no download requirement.
- Renders "Example conversations" section label.
- Renders example warranty question (mentions "compressor").
- Renders example filter question (mentions "HVAC filter").
