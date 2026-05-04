# AI Contract: components/ForHomeowners.tsx

## Purpose
Marketing section component (`ForHomeowners`) that presents the homeowner-facing value proposition through a benefit list (`homeownerBenefits`) and two example SMS Q&A exchanges (`exampleMessages`) side by side.

## Allowed Responsibilities
- Define and render `homeownerBenefits` (5 items with emoji, title, description).
- Define and render `exampleMessages` (2 Q&A pairs) as styled chat bubbles inside a phone frame mockup.
- Render the section with `aria-labelledby="homeowners-heading"`.

## Not Allowed
- Do not add a `'use client'` directive; this is a static Server Component.
- Do not fetch benefit or example content; all content is hardcoded.
- Do not add interactive behaviors.

## Public Interfaces
- `export default function ForHomeowners(): JSX.Element`

## Required Patterns
- Section uses `aria-labelledby="homeowners-heading"` (no `id` on the section itself — it lacks a navigation anchor).
- `id="homeowners-heading"` on the `<h2>`.
- Emoji spans have `aria-hidden="true"` since they are decorative.
- Mac window "dot" decorations (`bg-red-400`, `bg-yellow-400`, `bg-green-400`) have `aria-hidden="true"`.

## Tests Required
- Five benefit items are rendered with title and description.
- Two example Q&A exchanges are rendered.
- Emoji spans have `aria-hidden="true"`.
- Homeowner question bubbles are right-aligned; Tendr response bubbles are left-aligned.

## Notes for AI Agents
- Content updates (benefits, example messages) go in the `homeownerBenefits` and `exampleMessages` arrays. Do not change layout or structure for copy updates.
- The example message tenant name "Armadillo Home Warranty" is illustrative placeholder copy.
