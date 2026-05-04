# AI Contract: components/FAQ.tsx

## Purpose
Marketing section component (`FAQ`) that renders an accordion of seven product FAQ items using the `FAQItem` sub-component. Uses numeric `index` for collision-proof ARIA IDs. Anchored at `id="faq"`.

## Allowed Responsibilities
- Define the `faqs` array of `{ question, answer }` objects.
- Render `FAQItem` for each FAQ, passing `index` for stable IDs.
- Wrap in a `<section id="faq" aria-labelledby="faq-heading">`.
- `FAQItem` manages its own `open` toggle state.

## Not Allowed
- Do not fetch FAQ content from an API or CMS; it is hardcoded in the `faqs` constant.
- Do not use random or unstable keys for ARIA IDs; always use the numeric `index` prop.
- Do not allow multiple items open simultaneously (each `FAQItem` manages its own state independently — this is acceptable).

## Public Interfaces
- `export default function FAQ(): JSX.Element`
- `function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }): JSX.Element` — local, not exported.
- `function ChevronIcon({ open }: { open: boolean }): JSX.Element` — local, not exported.

## Required Patterns
- `'use client'` directive required (FAQItem uses `useState`).
- Button IDs: `faq-btn-${index}`; panel IDs: `faq-answer-${index}`.
- `aria-expanded={open}` and `aria-controls={panelId}` on the button.
- Panel uses `role="region" aria-labelledby={buttonId} hidden={!open}`.

## Tests Required
- Renders all 7 FAQ question buttons.
- Clicking a question button expands its answer panel.
- Clicking the same button again collapses it.
- `aria-expanded` reflects the open/closed state.
- Answer panel has `role="region"` and `aria-labelledby` matching the button `id`.
- `hidden` attribute is present when panel is closed.

## Notes for AI Agents
- FAQ content changes require editing the `faqs` array only. Do not change the component structure for content updates.
- The section links from the Footer's `#faq` anchor; do not change or remove `id="faq"` from the section.
