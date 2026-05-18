# AI Contract: __tests__/RootLayout.test.tsx

## Purpose
Verifies the exported `metadata` object and the rendered output of `app/layout.tsx`'s `RootLayout` component, including the Inter font wiring and the `<html lang="en">` shell.

## Allowed Responsibilities
- Assert the values of `metadata.title`, `metadata.description`, `metadata.metadataBase`, `metadata.openGraph`, and `metadata.other`.
- Render `<RootLayout>` with arbitrary children and assert the children, `<html>` attributes, and body className are correct.
- Rely on the global `next/font/google` mock from `jest.setup.ts` (className is `mock-inter-font`).

## Not Allowed
- Do not assert against the live website network resources.
- Do not load `app/globals.css` separately — it is imported transitively via the component.

## Public Interfaces
None — this is a test file.

## Required Patterns
- Use `@testing-library/react`'s `render` for component assertions.
- Read the rendered `<html>` and `<body>` from the returned `container` (jsdom permits nested html/body).
- Any assertion that depends on `NEXT_PUBLIC_SITE_URL` must isolate the module load with `jest.isolateModules` after explicitly setting/unsetting the env var, then restore the original value in a `finally` block. `metadata` is evaluated at module load time, so the top-of-file `import { metadata }` only reflects the env value at that moment.

## Tests Required
- `metadata.title` equals `'Tendr — AI Home Assistant Platform'`.
- `metadata.metadataBase` resolves to `'https://trytendr.org'` when `NEXT_PUBLIC_SITE_URL` is unset — uses `jest.isolateModules` with the env var explicitly deleted so the assertion does not flake under a CI- or shell-injected `NEXT_PUBLIC_SITE_URL`.
- `metadata.metadataBase` reflects `NEXT_PUBLIC_SITE_URL` when it is set (env override branch, also under `jest.isolateModules`).
- `<html>` has `lang="en"` and a className containing `scroll-smooth`.
- `<body>` className includes the Inter mock font class.
- Children are rendered inside the body.

## Notes for AI Agents
- Validates the behavior contract in `app/layout.ai.md`.
- If you change the impact-site-verification token, update the assertion in this file in the same commit.
