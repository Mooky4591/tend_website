# AI Contract: app/sms-enrollment/page.tsx

## Purpose
Server Component page (`SmsEnrollmentPage`) that renders the public-facing SMS enrollment landing page with site Navigation, a page header explaining SMS enrollment, and the `SmsEnrollmentForm` client component.

## Allowed Responsibilities
- Export `metadata` with the enrollment page title and description.
- Render `<Navigation />` and `<Footer />` (public marketing chrome).
- Render a `<main id="main-content">` containing the header copy and `<SmsEnrollmentForm />`.

## Not Allowed
- Do not add authentication; this page is public.
- Do not add form logic here; all form state and submission belong in `SmsEnrollmentForm`.
- Do not add a `'use client'` directive.

## Public Interfaces
- `export const metadata: Metadata`
- `export default function SmsEnrollmentPage(): JSX.Element`

## Required Patterns
- `<main>` has `id="main-content"` for skip-link compatibility.
- Page heading explains that enrollment is optional and not required to use warranty services.
- `SmsEnrollmentForm` is rendered inside a white rounded card.

## Tests Required
- Page renders the `<h1>` with "Enroll in Tendr SMS Home Warranty Assistance".
- `<main>` has `id="main-content"`.
- `SmsEnrollmentForm` is rendered.
- Navigation and Footer are rendered.

## Notes for AI Agents
- This page is the canonical public enrollment URL; its path is used as `ENROLLMENT_SOURCE_URL` in `lib/sms-consent.ts`. If this route changes, update the constant.
- The page copy stating SMS is optional is a regulatory requirement for A2P 10DLC compliance; do not remove it.
