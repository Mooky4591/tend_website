# AI Contract: app/login/LoginShell.tsx

## Purpose
Server-safe skeleton component (`LoginShell`) used as the `<Suspense>` fallback in the login page. Renders the Tendr logo and a pulsing placeholder card while the `LoginForm` (which requires `useSearchParams`) loads.

## Allowed Responsibilities
- Render a static shell matching the visual layout of the login form: navy background, centered card, logo, pulsing placeholder div.
- Be importable without a `'use client'` directive (it uses no hooks or browser APIs).

## Not Allowed
- Do not import or use `useSearchParams`, `useRouter`, or any React hooks.
- Do not call Supabase.
- Do not render the actual form inputs; those belong in the `LoginForm` function inside `app/login/page.tsx`.

## Public Interfaces
- `export function LoginShell(): JSX.Element` — named export (not default).

## Required Patterns
- `<Image src="/logo.png" alt="Tendr" width={120} height={40} className="mx-auto brightness-0 invert" priority />`.
- Placeholder card uses `animate-pulse` and a fixed height (`h-48`).
- No `'use client'` directive; this is a server-safe component.

## Tests Required
- Renders without throwing when used outside a client context.
- Renders the Tendr logo image.
- Renders the animated placeholder div.

## Notes for AI Agents
- `LoginShell` is used exclusively as the Suspense fallback in `app/login/page.tsx`. It should not be used elsewhere.
- The `brightness-0 invert` filter makes the dark logo appear white on the navy background.
