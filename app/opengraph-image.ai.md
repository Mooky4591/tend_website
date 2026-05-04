# AI Contract: app/opengraph-image.tsx

## Purpose
Next.js edge-runtime Open Graph image generator that produces a 1200×630 PNG at the route `/_next/og`. Renders the Tendr brand name, headline, subline, and a feature badge using `ImageResponse`.

## Allowed Responsibilities
- Export `runtime = 'edge'`, `alt`, `size`, and `contentType` as required by Next.js OG conventions.
- Return a `new ImageResponse(...)` with inline styles (no Tailwind — OG image uses inline `style={}`).
- Render: brand name ("Tendr"), headline ("AI Home Assistant Platform"), subline, and bottom badge.

## Not Allowed
- Do not use Tailwind classes in the OG image JSX; OG images require inline styles.
- Do not import fonts dynamically; use `fontFamily: 'sans-serif'` only.
- Do not fetch external data or call Supabase.
- Do not add image assets (logos, photos); text-only layout.

## Public Interfaces
- `export const runtime = 'edge'`
- `export const alt: string`
- `export const size: { width: number; height: number }`
- `export const contentType: string`
- `export default function OGImage(): ImageResponse`

## Required Patterns
- `size` must be `{ width: 1200, height: 630 }` to match standard OG dimensions.
- `contentType` must be `'image/png'`.
- `runtime` must be `'edge'` (OG image generation requires Edge runtime).
- `{ ...size }` spread passed as the second argument to `ImageResponse`.
- Background color `#0f172a` (navy).

## Tests Required
- `OGImage()` returns an `ImageResponse` instance without throwing.
- `alt` is a non-empty string.
- `size.width === 1200` and `size.height === 630`.
- `contentType === 'image/png'`.

## Notes for AI Agents
- This file is discovered automatically by Next.js from the `app/` directory as the site-wide OG image. Do not add an explicit `openGraph.images` URL in `app/layout.tsx`.
- Changing colors or copy here only affects the link preview card, not the live website.
