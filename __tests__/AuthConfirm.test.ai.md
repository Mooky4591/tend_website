# AI Contract: __tests__/AuthConfirm.test.ts

## Purpose
Integration tests for `app/auth/confirm/route.ts` (GET handler). Covers the code-exchange flow (`{{ .ConfirmationURL }}`), the token-hash flow (`{{ .TokenHash }}`), open-redirect protection, and the missing-params error path.

## Allowed Responsibilities
- Mock `@/lib/supabase/server` to control `verifyOtp` and `exchangeCodeForSession` outcomes.
- Assert on redirect status and `location` header values.

## Not Allowed
- Do not test the callback flow; that belongs in `AuthCallback.test.ts`.

## Public Interfaces
- No exports — test file only.

## Required Patterns
- `@jest-environment node` directive required.

## Tests Required
- Code exchange flow: exchanges code and redirects to `next` on success.
- Code exchange flow: defaults `next` to `/reset-password`.
- Code exchange flow: redirects to `/login?error=code_exchange_failed` on failure.
- Token hash flow: verifies OTP and redirects to `/reset-password` on success.
- Token hash flow: redirects to `/login?error=otp_verification_failed` on failure.
- Redirects to `/login?error=missing_auth_params` when neither code nor token_hash is present.
- Open-redirect: rejects absolute URL in `next` param.
- Open-redirect: rejects protocol-relative URL in `next` param.
- Open-redirect: allows a safe relative path through.
