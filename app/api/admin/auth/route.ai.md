# AI Contract: app/api/admin/auth/route.ts

## Purpose
Route handler for admin login/logout. Validates the password from form submission,
sets the admin session cookie on success, and clears it on logout.

## Allowed Responsibilities
- Accept `POST` with a `multipart/form-data` body containing `password` and optional `action`.
- Handle `action === "logout"`: clear the admin session cookie and redirect to `/admin/login`.
- Validate the submitted password against `ADMIN_PASSWORD`.
- Set the admin session cookie and redirect to `/admin` on success.
- Redirect back to `/admin/login` with an error query param on failure.

## Not Allowed
- Do not use Supabase auth.
- Do not return JSON — all responses are redirects.
- Do not render JSX or HTML.
- Do not log or expose the password value.

## Public Interfaces
- `export async function POST(request: NextRequest): Promise<NextResponse>`

## Required Patterns
- Read `password` and `action` from `request.formData()`.
- Redirect to `/admin/login?error=...` for missing password, unconfigured ADMIN_PASSWORD, and wrong password.
- Password comparison **must** use `crypto.timingSafeEqual` on the two `Buffer.from(hash,'hex')`
  buffers (not `===` / `!==`). Both hashes are always 64-char SHA-256 hex (32 bytes), so no
  length guard is needed here, but the comparison must be constant-time.
- Set cookie using `adminCookieOptions` from `lib/admin-auth.ts`.
- On logout: set cookie with `maxAge: 0` to expire it immediately.
- **All redirects must use status 303** (`NextResponse.redirect(url, { status: 303 })`) so
  browsers follow them as GET requests, completing the standard Post/Redirect/Get pattern.

## Tests Required
- POST with `action=logout` clears the cookie and redirects to `/admin/login` with status 303.
- POST with correct password sets the session cookie and redirects to `/admin` with status 303.
- POST with wrong password redirects to `/admin/login` with an error param and status 303.
- POST with missing password redirects to `/admin/login` with an error param and status 303.
- POST when `ADMIN_PASSWORD` is not set redirects to `/admin/login` with an error param and status 303.

## Notes for AI Agents
- Consumed by the `<form>` element in `app/admin/login/page.tsx`.
- The cookie value is the HMAC hash (not the plaintext password); see `lib/admin-auth.ts`.
