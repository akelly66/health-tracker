# mise design system

One rule: **colors come from `lib/theme.js` and nowhere else.** The app uses four hues, each as a
dense and a soft color, on a warm cream base. Nothing outside this palette is allowed.

`npm run check:design` enforces it (and runs before every `npm run build`). It fails on any hex,
`rgb()`/`hsl()`, or named color outside `lib/theme.js`, on any `var(--token)` that doesn't exist, and on
web-manifest colors that aren't palette colors.

## Where things live

| File | Role |
| --- | --- |
| `lib/theme.js` | The palette and all tokens. The only place a color value is written. |
| `pages/_document.js` | Injects the tokens as CSS variables on `:root` for every page. |
| `styles/app.css` | All component styles. Uses `var(--token)` only, never a color value. |
| `components/HistoryCharts.js` | Charts need raw values, so they import `palette` from `lib/theme.js`. |
| `scripts/check-design.js` | The guard described above. |
| `scripts/make-icons.js` | Generates the app icon set from the palette (`npm run make:icons`). The icon is a calorie ring with three macro meters. |

## Palette

Neutrals: **cream** `--bg` (page), **card** `--card` (cards and sheets), **ink** `--ink` (text),
**muted** `--muted` (secondary text), **line** `--line` (hairlines).

| Hue | Dense (fills, text, buttons) | Soft (tracks, backgrounds) | Used for |
| --- | --- | --- | --- |
| Green | `--green` | `--green-soft`, `--green-tint` | Calories, fiber, primary actions, active states |
| Blue | `--blue` | `--blue-soft` | Carbs, informational banners |
| Pink | `--pink` | `--pink-soft` | Protein, delete, errors, warnings |
| Purple | `--purple` | `--purple-soft` | Fat, dinner |

Rules of use:

- **Dense + soft always travel together.** A meter is a soft track with a dense fill. A tile is a soft
  background with a dense dot. A chart bar is a dense net with a soft, dotted burned segment.
- **Prefer roles over hues** when one exists: `--accent` (primary buttons, active tab, calorie fill),
  `--on-accent` (text on dense fills), `--alert` / `--alert-soft` (delete, errors, warnings),
  `--carbs`, `--protein`, `--fat`, `--fiber` (macro meters).
- **No red, no amber, no new hue.** Over a target is shown with a small pink "over" pill, never a recolor.
  Errors are ink text on `--alert-soft`.
- **Tints are mixes of palette colors**, defined in `lib/theme.js` (`--green-tint`, `--green-deep`).
  Do not add a color by eyeballing a hex. To change the palette, change `lib/theme.js` and everything follows.
- **Overlays and shadows are ink at some opacity** (`--scrim`, `--shadow-card`, `--shadow-pop`, `--shadow-tip`).

## Name and logo

- The name is **mise** (from *mise en place*), always lowercase, set in a soft serif (Fraunces, soft) with a **pink period**: `mise.`
- The wordmark and the app icon are drawn from letter outlines stored in `lib/mise-glyphs.json` (Fraunces is under the SIL Open Font License; outlines extracted once at optical size 144, weight 500, softness 100). They are plain vector shapes, so the app downloads no font for the logo. The header uses the component `MiseWordmark` and takes its colors from the tokens (deep green letters, pink period).
- The app icon is the monogram **m.**: a deep green m with a pink period on a cream tile, with clear space between the letter and the period (they never touch). Regenerate every size with `npm run make:icons`.
- A live serif font is **not** part of the app yet; DM Sans still does all functional text. If headings should go serif later, add the font deliberately through `next/font` and a `--serif` token, then update this file.

## Progress tab: one hue per box

Each box (tile) gets its own hue so the tab isn't tonal, and the color means something:

- **Week averages** follow the Track tab's meters: calories green, protein pink, carbs blue, fat purple,
  fiber soft green.
- **Weight vs. goal:** Now is blue, Goal is purple (the goal line and marker are purple too), Trend is green
  (the trend line is green).
- **Calories eaten & burned:** Avg net is green (the solid bars), Avg burned is blue (the dotted segments),
  Avg eaten is purple.
- Day badges: **P** (pink) fills in solid when that day's protein reached the protein target, **F** (green)
  when fiber reached the fiber target. Faded means not hit. A one-line total under the strip says how many logged days hit each goal.

## Shape, texture and type

- **Rounded everything.** Cards 20px, sheets and tiles 16 to 20px, buttons and chips fully round (20px or
  999px), bars and meters are pills. Charts use pill bars, round line caps and rounded tooltips.
- **Texture** is a fine dotted halftone (soft blue with dense blue dots), used for "burned" calories.
  No stripes.
- **Font** is DM Sans (`--sans`), weights 400 to 700. No other font.
- **Charts** have no axis lines and only horizontal dashed gridlines in `--line`.

## Adding something new

1. Pick the role it plays, then the token for that role.
2. If it needs a color no token covers, stop and extend `lib/theme.js` deliberately (and update this file).
3. Run `npm run check:design`.

## Voice and habits

The app should make it easier to keep going, not grade the day.

- A day over target is data. Show it neutrally ("+140", blue), never as red, "over" or a warning. After a rough day the chat offers a plan for the rest of the day.
- Count effort generously: any logging (food, a weigh-in, burned calories) is "showing up". Prefer "5 of 7 days" to streaks, since a broken streak makes people quit ("what the hell" effect).
- Movement is framed as something that feels good (fun, relaxing, social), and everyday movement counts.
- No guilt words anywhere, including the advisor ("cheat", "bad", "failed", "blew it").
- Make the next day automatic: "Plan tomorrow" (move, when, set it up, meals) is written the evening before and shown the next morning.
- The user's own "why" is shown back to them in Settings and the Meal Plan chat.
