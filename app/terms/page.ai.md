# AI Contract: app/terms/page.tsx

## Purpose
Static Server Component page (`TermsPage`) that renders the full Tendr Terms of Use as 20 numbered sections with anchor IDs for internal TOC linking.

## Allowed Responsibilities
- Export `metadata` with title and description.
- Render all 20 terms sections with `id` attributes matching the TOC anchor hrefs.
- Provide a linked table of contents at the top.
- Link to `support@trytendr.org` for contact.

## Not Allowed
- Do not add a `'use client'` directive.
- Do not fetch data or add interactive elements.
- Do not shorten, omit, or rephrase terms sections — legal content must remain complete.

## Public Interfaces
- `export const metadata: { title: string; description: string }`
- `export default function TermsPage(): JSX.Element`

## Required Patterns
- Each `<h2>` for a section must have an `id` matching its TOC `href` (e.g., `id="sms-terms"` for `#sms-terms`).
- Section 2 (SMS Terms) must explicitly address opt-in, message frequency, data rates, STOP/HELP keywords, and the statement that consent is not required to purchase warranty services.

## Tests Required
- Page renders `<h1>` with "Tendr - Terms of Use".
- TOC contains 20 anchor links.
- Each anchor link target `id` exists in the page.
- Section 2 (SMS Terms) heading is present.
- Contact email `support@trytendr.org` appears as a mailto link.

## Notes for AI Agents
- This page is a legal document. Do not rewrite, summarize, or restructure sections without legal review.
- The "Last updated" date must be updated when content changes.
- Section 2 (SMS Terms) is required for A2P 10DLC carrier compliance. Do not remove or alter its core disclosures.
