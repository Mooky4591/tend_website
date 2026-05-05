---
name: FAQ.test
description: Tests for components/FAQ — accordion expand/collapse, aria-expanded, answer visibility, multiple-open, unique IDs, aria-controls/labelledby wiring
type: project
---

# AI Contract: __tests__/FAQ.test.tsx

## Purpose
Unit tests for `components/FAQ.tsx`. Verifies section heading, `#faq` anchor, all question buttons rendered, all answers hidden by default (`aria-expanded=false`), expand/collapse on click, multiple items open simultaneously, specific answer content, "Ask us directly" link, unique button/panel IDs, and correct `aria-controls`/`aria-labelledby` relationships.

## Allowed Responsibilities
- Render `FAQ` and assert on ARIA attributes, visibility, DOM IDs, and link presence.

## Not Allowed
- Do not make network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders the section heading ("Common questions").
- Section has the `faq` id.
- Renders all 7 FAQ question buttons.
- All answers are hidden by default.
- All toggle buttons start with `aria-expanded=false`.
- Clicking a question reveals its answer (`aria-expanded=true`, answer visible).
- Clicking a question twice collapses it.
- STOP answer mentions carrier-level compliance.
- Warranty document answer mentions vector embeddings.
- Tenant isolation answer mentions dedicated phone number.
- Multiple questions can be open simultaneously.
- Renders an "Ask us directly" link pointing to `#contact`.
- Accordion button and panel IDs are unique across all items.
- Each answer panel is labelled by its controlling button (`aria-labelledby`).
