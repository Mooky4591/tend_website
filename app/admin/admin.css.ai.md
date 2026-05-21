# AI Contract: app/admin/admin.css

## Purpose
Segment-scoped stylesheet for the admin section. Imported by `app/admin/layout.tsx`
so all `/admin/*` routes share consistent typography, table, badge, button, card, and
stat-grid styles without polluting non-admin page bundles.

## Allowed Responsibilities
- Define global resets (`*`, `body`) scoped to the admin segment.
- Provide utility classes used by admin page components: `.btn`, `.btn-*`, `.badge`,
  `.badge-*`, `.card`, `.stat-grid`, `.stat-card`, `.stat-value`, `.stat-label`.
- Define base table styles (`table`, `th`, `td`, `tr:hover td`).

## Not Allowed
- Do not add Tailwind directives (`@apply`, `@tailwind`) — this is a plain CSS file.
- Do not import from other CSS files.
- Do not include non-admin styles (e.g. marketing-page colours or fonts).

## Notes for AI Agents
- Imported exclusively by `app/admin/layout.tsx`.
- Next.js/Jest mock this file automatically in tests (returns `{}`).
- All other admin styling uses inline `style={{}}` props directly on JSX elements.
