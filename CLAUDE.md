# CLAUDE.md — Tendr Website

This is a Next.js 14 App Router project (TypeScript) using Supabase for auth and database, Twilio for SMS, and OpenAI for embeddings. The stack is: Next.js, React, Tailwind CSS, Supabase SSR, Twilio, OpenAI, Jest + Testing Library.

---

## Mandatory AI Contract Rules

This repository uses `.ai.md` contract files to define what each source file is allowed to do.

Before editing any source file, you must:

1. Look for a sibling `.ai.md` file with the same base filename plus `.ai.md` (drop the source extension).
   - Example: `lib/twilio.ts` → `lib/twilio.ai.md`
   - Example: `app/dashboard/docs/UploadForm.tsx` → `app/dashboard/docs/UploadForm.ai.md`
   - Example: `app/api/send-message/route.ts` → `app/api/send-message/route.ai.md`

2. Read the `.ai.md` file before making changes.

3. Treat the `.ai.md` file as binding architectural guidance.

4. Do not add responsibilities that are listed under "Not Allowed."

5. Do not change public interfaces unless the `.ai.md` file allows it or the user explicitly asks for it.

6. If the requested change conflicts with the `.ai.md` file, stop and explain the conflict before editing.

7. If a new source file is created, create a matching `.ai.md` file in the same directory using the base filename plus `.ai.md` (for example, `bar.ts` → `bar.ai.md`, `Baz.tsx` → `Baz.ai.md`).

8. If a source file's purpose or responsibility changes, update its `.ai.md` file in the same commit.

9. Before finishing, verify that every edited source file still complies with its `.ai.md` contract.

---

## Definition of Done

A change is not complete unless:
- Edited files comply with their sibling `.ai.md` files.
- New source files have matching `.ai.md` files.
- Existing `.ai.md` files are updated when responsibilities change.
- Edited files have updated tests if needed.
- New source files have full test coverage.
- All tests, new and old, pass at 100%.

---

## Additional Quality and Testing Requirements

10. Update all relevant documentation whenever necessary to reflect code or behavior changes.

11. Add new tests whenever necessary to cover new behavior, bug fixes, and regressions.

12. Run all test suites for every code change, and ensure they pass completely before considering the change done.

13. Do not change tests just to make them pass unless it is the last possible resort.

14. Tests should validate functionality and behavior, not internal implementation details.

15. If any test is changed, explicitly inform the user and include a clear explanation of why the test was modified.

---

## Files Exempt from Sibling `.ai.md` Requirements

The following files do **not** need sibling `.ai.md` files:

- `CLAUDE.md`
- `README.md`
- `package.json`
- `tsconfig.json`
- `tsconfig.test.json`
- `jest.config.js` / `jest.setup.ts`
- `next.config.*`
- `tailwind.config.*`
- `postcss.config.*`
- `.env` / `.env.*` / `.env.example`
- `.github` workflows
- `.ai.md` files themselves
- `.md` documentation files
- Images and asset files
- Lockfiles (`package-lock.json`, `yarn.lock`, etc.)
- `__tests__/**` test files

If any `.ai.md` files already exist for exempt files, they should be removed to avoid stale or conflicting contract guidance.
