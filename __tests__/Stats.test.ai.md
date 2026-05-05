---
name: Stats.test
description: Tests for components/Stats — platform highlights region, stat values, labels, detail descriptions, definition list structure
type: project
---

# AI Contract: __tests__/Stats.test.tsx

## Purpose
Unit tests for `components/Stats.tsx`. Verifies "Platform highlights" region landmark, all four stat values (30+, 0, 100%, Multi-tenant), corresponding labels, detail descriptions for each stat, and `dl`/`dt`/`dd` definition list structure.

## Allowed Responsibilities
- Render `Stats` and assert on ARIA regions, text content, and DOM structure.

## Not Allowed
- Do not make network requests.

## Public Interfaces
- No exports — test file only.

## Tests Required
- Renders the section landmark ("Platform highlights").
- Renders all four stat values (30+, 0, 100%, Multi-tenant).
- Renders stat labels (Maintenance reminder types, Apps to download, TCPA compliant, Architecture).
- Renders stat detail descriptions mentioning HVAC/plumbing/roof, nothing to install, STOP/START, and Fully isolated.
- Uses a definition list (`dl`) for stat items.
