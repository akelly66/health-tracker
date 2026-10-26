# mise

Next.js (Pages Router) macro and weight tracker backed by Postgres (Neon) and the Anthropic API.

## UI rules

- Read `DESIGN.md` before touching any UI. **Colors come only from `lib/theme.js`**, used as
  `var(--token)` in `styles/app.css` and inline styles, or `palette` from `lib/theme.js` for chart libraries.
- Never write a hex, `rgb()`, or named color anywhere else, and never add red, amber or any new hue.
- Styles live in `styles/app.css`. Do not reintroduce inline `<style>` blocks.
- Run `npm run check:design` after UI changes. It also runs before `npm run build`.

## Code rules learned the hard way

- Every meal has a stable `id` (`newMealId()`). Key lists by id, never by array index: the swipe-to-delete animation edits DOM styles directly.
- Data loads must ignore stale responses (`loadSeq`) and must never present a failed load as an empty day. Save is disabled while `dayError` is set.
- Anything numeric from the AI goes through `normalizeMeal` (lib/nutrition.js). The saved meal text format (lib/mealLog.js) only holds whole numbers.
- Don't put quotes in a React text child inside `<style>`; use `dangerouslySetInnerHTML` (it hydrates differently on server and client).
- Modals get `role="dialog"` and `useEscape`; form fields wrap their label.
- `.next/` is git-ignored build output. Don't commit it or run `git restore .next` while `npm run dev` is running.

## Notes

- The model name is configured in `lib/model.js` (`ANTHROPIC_MODEL` overrides it).
- Database schema is in `scripts/schema.sql` (idempotent; safe to re-run).
- Icons are generated from the palette: `npm run make:icons` (scripts/make-icons.js).
- The font (DM Sans) is self-hosted through next/font in pages/_app.js.
- Secrets live in `.env.local` (git-ignored): `ANTHROPIC_API_KEY`, `POSTGRES_URL`, `USDA_API_KEY`.
