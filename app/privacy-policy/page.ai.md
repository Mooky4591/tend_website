# AI Contract: app/privacy-policy/page.tsx

## Purpose
Static Server Component page (`PrivacyPolicyPage`) that renders the full Tendr Privacy Policy as structured HTML sections, including the A2P SMS mobile data privacy disclosures required for 10DLC compliance.

## Allowed Responsibilities
- Export `metadata` with title and description.
- Render all 14 numbered privacy policy sections as static HTML content.
- Render the California state privacy rights table.
- Link to `support@trytendr.org` for contact and opt-out requests.

## Not Allowed
- Do not add interactive elements beyond links.
- Do not add a `'use client'` directive.
- Do not fetch data from Supabase or any external source.
- Do not shorten, summarize, or omit any privacy policy section — legal content must remain complete.

## Public Interfaces
- `export const metadata: { title: string; description: string }`
- `export default function PrivacyPolicyPage(): JSX.Element`

## Required Patterns
- `<main>` as the root element with `bg-slate-50 text-slate-900` classes.
- "Last updated May 8, 2026" date displayed below the heading.
- The SMS mobile data section (Section 2) must explicitly state that mobile numbers and SMS consent are not sold or shared for marketing purposes — required for A2P 10DLC compliance.

## Tests Required
- Page renders the `<h1>Privacy Policy</h1>` heading.
- All 14 section headings are present.
- Section 2 contains language about not selling/sharing mobile phone numbers.
- Contact email `support@trytendr.org` is present as a mailto link.
- Page renders without any client-side hooks.

## Notes for AI Agents
- This page is a legal document. Do not rephrase or restructure sections without legal review.
- The "Last updated" date must be updated whenever policy content changes.
- The California table (Section 11) lists personal information categories collected and whether collected. Do not remove or collapse it.
