# AI Contract: lib/admin-auth.ts

## Purpose
Shared admin authentication helpers used by admin page layouts and API routes.
Provides cookie-based session validation for the `/admin` section, independently of
Supabase auth.

## Allowed Responsibilities
- Export `ADMIN_COOKIE_NAME` constant.
- Export `hashPassword(password)` — HMAC-SHA256 of the password using `ADMIN_PASSWORD` as the key.
- Export `validSessionToken()` — the expected cookie value for a valid session (hash of the password with itself as HMAC key).
- Export `isAdminAuthenticated()` — reads the admin session cookie and compares it to the expected token.
- Export `adminCookieOptions` — cookie options for the session cookie (httpOnly, secure in prod, lax sameSite, 8-hour maxAge).

## Not Allowed
- Do not store passwords in plaintext in cookies.
- Do not implement full cryptographic password hashing (bcrypt, etc.) — HMAC is sufficient for this internal tool.
- Do not check Supabase sessions — admin auth is entirely separate.
- Do not add rate limiting or lockout logic here.

## Public Interfaces
- `export const ADMIN_COOKIE_NAME: string`
- `export function hashPassword(password: string): string`
- `export function validSessionToken(): string`
- `export function isAdminAuthenticated(): boolean`
- `export const adminCookieOptions: CookieSerializeOptions`

## Tests Required
- `hashPassword` returns a hex string.
- `hashPassword` returns different values for different passwords.
- `validSessionToken` returns the same value when called twice with the same env var.
- `isAdminAuthenticated` returns false when cookie is absent.
- `isAdminAuthenticated` returns false when cookie value is wrong.
- `isAdminAuthenticated` returns true when cookie matches `validSessionToken()`.

## Notes for AI Agents
- Consumed by `app/admin/layout.tsx` (server component) and `app/api/admin/auth/route.ts`.
- The `ADMIN_PASSWORD` env var must be set; if missing, all HMAC values will use an empty string as the key, which effectively disables auth in development (acceptable for local use only).
