# AI Contract: app/layout.tsx

## Purpose
Root Next.js layout (`RootLayout`) that sets site-wide metadata (title, description, OG tags, impact-site-verification), loads the Inter font, and wraps all pages in an `<html lang="en" className="scroll-smooth">` shell.

## Allowed Responsibilities
- Export the `metadata` object with `metadataBase`, `title`, `description`, `openGraph`, and `other` fields.
- Apply the Inter font via `next/font/google` to `<body>`.
- Import and apply `./globals.css`.
- Render `<html>` and `<body>` with the font class and `{children}`.

## Not Allowed
- Do not render navigation, headers, or footers here; those belong in page-specific layouts or components.
- Do not add Supabase or auth logic here; authentication is handled by middleware and dashboard layout.
- Do not remove `metadataBase`; it is required for absolute OG image URLs.
- Do not remove `scroll-smooth` from the `<html>` class.

## Public Interfaces
- `export const metadata: Metadata` — consumed by Next.js for `<head>` generation.
- `export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element`

## Required Patterns
- `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://trytendr.org')` — env variable with fallback.
- `impact-site-verification` token in `metadata.other`.
- OG image is provided by `app/opengraph-image.tsx` (Next.js convention); do not add an explicit `openGraph.images` field here.
- `inter.className` applied to `<body>`.

## Tests Required
- `metadata.title` equals `'Tendr — AI Home Assistant Platform'`.
- `metadata.metadataBase` resolves to `'https://trytendr.org'` when `NEXT_PUBLIC_SITE_URL` is unset.
- `<html>` element has `lang="en"` and `className` includes `"scroll-smooth"`.

## Notes for AI Agents
- The OG image is auto-discovered by Next.js from `app/opengraph-image.tsx`. Do not add an explicit image URL to this metadata object.
- Changing the site title or description requires updating this file; the title is not inherited from anywhere else.
