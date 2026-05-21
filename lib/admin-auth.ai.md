# AI Contract: lib/admin-auth.ts

## Purpose
Shared admin authentication helpers used by admin page layouts and API routes.
Provides cookie-based session validation for the `/admin` section, independently of
Supabase auth. Uses per-session timestamped tokens to prevent indefinite reuse of
captured credentials.

## Allowed Responsibilities
- Export `ADMIN_COOKIE_NAME` constant.
- Export `hashPassword(password)` — HMAC-SHA256 of the password using `ADMIN_PASSWORD` as the key.
- Export `createSessionToken()` — creates a fresh per-session token in the format `hmac:issuedAt`.
  The HMAC is computed over the issuedAt millisecond timestamp string.
- Export `isAdminAuthenticated()` — reads the admin session cookie, validates both the HMAC
  signature and the token age (must be ≤ `COOKIE_MAX_AGE_SECONDS`), and returns a boolean.
- Export `adminCookieOptions` — cookie options for the session cookie (httpOnly, secure in prod,
  lax sameSite, 8-hour maxAge).

## Not Allowed
- Do not store passwords in plaintext in cookies.
- Do not implement full cryptographic password hashing (bcrypt, etc.) — HMAC is sufficient for this internal tool.
- Do not check Supabase sessions — admin auth is entirely separate.
- Do not add rate limiting or lockout logic here.
- Do not export `validSessionToken` — it was removed in favour of the timestamped `createSessionToken`.

## Public Interfaces
- `export const ADMIN_COOKIE_NAME: string`
- `export function hashPassword(password: string): string`
- `export function createSessionToken(): string`
- `export function isAdminAuthenticated(): boolean`
- `export const adminCookieOptions: CookieSerializeOptions`

## Required Patterns
- Token format: `${hmac}:${issuedAt}` where `issuedAt = Date.now().toString()` and
  `hmac = hashPassword(issuedAt)`.
- `isAdminAuthenticated` splits on the **last** colon (to tolerate HMAC hex that contains no
  colons), rejects tokens with no colon, invalid numeric `issuedAt`, or age >
  `COOKIE_MAX_AGE_SECONDS * 1000` ms.
- HMAC comparison **must** use `crypto.timingSafeEqual` (not `===`). Convert both the received
  and expected HMAC strings to `Buffer` via `Buffer.from(hex, 'hex')` and check lengths match
  before calling `timingSafeEqual` — a malformed received HMAC produces a shorter buffer that
  would otherwise cause `timingSafeEqual` to throw.
- Fails closed: `isAdminAuthenticated()` returns `false` immediately when `ADMIN_PASSWORD` is unset.

## Tests Required
- `hashPassword` returns a hex string.
- `hashPassword` returns different values for different passwords.
- `createSessionToken` returns a string in `hmac:issuedAt` format.
- `createSessionToken` returns a unique token on each call (per-session uniqueness).
- `isAdminAuthenticated` returns false when cookie is absent.
- `isAdminAuthenticated` returns false when cookie value is wrong.
- `isAdminAuthenticated` returns false for an old-format token (no `:issuedAt` suffix).
- `isAdminAuthenticated` returns false for an expired token (issuedAt > 8 hours ago).
- `isAdminAuthenticated` returns true when cookie contains a valid, non-expired per-session token.
- `isAdminAuthenticated` returns false when `ADMIN_PASSWORD` is not set (fail closed).

## Notes for AI Agents
- Consumed by `app/admin/layout.tsx` (server component) and `app/api/admin/auth/route.ts`.
- The `ADMIN_PASSWORD` env var must be set. `isAdminAuthenticated()` fails closed (returns
  `false`) when it is unset — a crafted cookie cannot bypass auth in a misconfigured environment.
- The auth route (`app/api/admin/auth/route.ts`) verifies login with `hashPassword(submittedPassword) === hashPassword(adminPassword)`, then calls `createSessionToken()` to mint a fresh cookie value. It no longer exports or uses `validSessionToken`.
