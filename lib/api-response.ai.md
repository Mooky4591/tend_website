# AI Contract: lib/api-response.ts

## Purpose
Centralized HTTP response factory for Next.js Route Handlers. Exports typed helper functions that return `NextResponse` objects, eliminating repeated `NextResponse.json({ error: '...' }, { status: N })` calls across every API route.

## Allowed Responsibilities
- Export one function per response class: `unauthorized`, `forbidden`, `badRequest`, `notFound`, `serverError`, `badGateway`, `unsupportedMedia`, `payloadTooLarge`, `unprocessableEntity`, `ok`, `created`.
- Accept a message string or typed data object where relevant.
- Return a `NextResponse` from every helper.

## Not Allowed
- Do not add logging, metrics, or side effects here.
- Do not import application business logic or Supabase.
- Do not define HTTP status codes not already present; add a new helper only when a new status code is needed by a route.

## Public Interfaces
- `export function unauthorized(): NextResponse`
- `export function forbidden(message?: string): NextResponse`
- `export function badRequest(message: string): NextResponse`
- `export function notFound(message?: string): NextResponse`
- `export function serverError(message: string): NextResponse`
- `export function badGateway(message: string): NextResponse`
- `export function unsupportedMedia(message: string): NextResponse`
- `export function payloadTooLarge(message: string): NextResponse`
- `export function unprocessableEntity(message: string): NextResponse`
- `export function ok<T extends object>(data: T): NextResponse`
- `export function created<T extends object>(data: T): NextResponse`

## Required Patterns
- Error helpers always serialize to `{ error: string }`.
- `ok` and `created` accept a typed data object and serialize it directly (no wrapping).
- Status codes must match their semantic names exactly (401, 403, 400, 404, 500, 502, 415, 413, 422, 200, 201).

## Tests Required
- Each helper returns a `NextResponse` with the correct status code.
- Error helpers include `{ error: '...' }` in the JSON body.
- `ok` and `created` serialize the data argument without modification.

## Notes for AI Agents
- All Route Handlers (`app/api/**/route.ts`) should import from this module instead of calling `NextResponse.json` directly with inline error objects.
- This module is server-only; do not import it in client components or `lib/api/client.ts`.
